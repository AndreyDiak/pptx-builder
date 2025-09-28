import type { Project } from "@/entities/project";
import type { Track } from "@/entities/slide";

// Импорт статических ассетов как base64
import chipImageUrl from '/chip.png?url';
import menuBackgroundImageUrl from '/menu_background.png?url';

// Кэш для статических ассетов в base64
let staticAssetsCache: Map<string, string> | null = null;

// Функция для получения статических ассетов в base64
async function getStaticAssetsBase64(): Promise<Map<string, string>> {
  if (staticAssetsCache) {
    return staticAssetsCache;
  }

  const cache = new Map<string, string>();
  
  try {
    // Загружаем chip.png
    const chipResponse = await fetch(chipImageUrl);
    const chipBlob = await chipResponse.blob();
    const chipBase64 = await blobToBase64(chipBlob);
    cache.set('/chip.png', chipBase64);
    
    // Загружаем menu_background.png
    const menuResponse = await fetch(menuBackgroundImageUrl);
    const menuBlob = await menuResponse.blob();
    const menuBase64 = await blobToBase64(menuBlob);
    cache.set('/menu_background.png', menuBase64);
    
    staticAssetsCache = cache;
    console.log('Статические ассеты загружены в base64');
    return cache;
  } catch (error) {
    console.error('Ошибка загрузки статических ассетов:', error);
    return cache;
  }
}

// Динамический импорт JSZip для избежания проблем с SSR
let JSZip: any = null;

async function getJSZip() {
  if (!JSZip) {
    try {
      const JSZipModule = await import('jszip');
      JSZip = JSZipModule.default;
    } catch (error) {
      console.error('Ошибка загрузки JSZip:', error);
      throw new Error('Не удалось загрузить библиотеку JSZip');
    }
  }
  return JSZip;
}

export interface PresentationData {
  project: Project;
  tracks: Track[];
}

// Функция для скачивания файла по URL
async function downloadFile(url: string): Promise<Blob> {
  try {
    console.log(`Скачивание файла: ${url}`);
    
    // Для статических файлов используем импортированные URL
    if (url === '/chip.png') {
      const response = await fetch(chipImageUrl);
      const blob = await response.blob();
      console.log(`Статический файл chip.png загружен, размер: ${blob.size} байт`);
      return blob;
    } else if (url === '/menu_background.png') {
      const response = await fetch(menuBackgroundImageUrl);
      const blob = await response.blob();
      console.log(`Статический файл menu_background.png загружен, размер: ${blob.size} байт`);
      return blob;
    }
    
    // Для остальных файлов используем обычный fetch
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} for ${url}`);
    }
    const blob = await response.blob();
    console.log(`Файл скачан успешно: ${url}, размер: ${blob.size} байт`);
    return blob;
  } catch (error) {
    console.error(`Ошибка скачивания файла ${url}:`, error);
    // Возвращаем пустой blob в случае ошибки
    return new Blob();
  }
}

// Функция для конвертации Blob в base64
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Функция для получения расширения файла из URL
function getFileExtension(url: string): string {
  const path = url.split('?')[0]; // Убираем query параметры
  const extension = path.split('.').pop()?.toLowerCase() || 'bin';
  return extension;
}

// Функция для генерации уникального имени файла
function generateFileName(url: string, prefix: string, index?: number): string {
  const extension = getFileExtension(url);
  const timestamp = Date.now();
  const indexSuffix = index !== undefined ? `_${index}` : '';
  return `${prefix}${indexSuffix}_${timestamp}.${extension}`;
}

// Основная функция для создания ZIP архива с презентацией
export async function generatePresentationZIP(data: PresentationData): Promise<Blob> {
  try {
    console.log('Начало создания ZIP архива с презентацией');
    const { project, tracks } = data;
    
    // Получаем JSZip динамически
    const JSZipClass = await getJSZip();
    const zip = new JSZipClass();
    
    // Создаем папки для ассетов
    const assetsFolder = zip.folder('assets');
    const photosFolder = assetsFolder?.folder('photos');
    const audiosFolder = assetsFolder?.folder('audios');
    
    console.log('Созданы папки для ассетов');
    
    // Собираем все уникальные URL файлов
    const fileUrls = new Set<string>();
    
    // Фоновое изображение проекта
    if (project.front_page_background_src) {
      fileUrls.add(project.front_page_background_src);
      console.log('Добавлено фоновое изображение:', project.front_page_background_src);
    }
    
    // Статические ассеты из public
    fileUrls.add('/chip.png');
    fileUrls.add('/menu_background.png');
    console.log('Добавлены статические ассеты: chip.png, menu_background.png');
    
    // Изображения и аудио треков
    tracks.forEach((track, index) => {
      if (track.image_src) {
        fileUrls.add(track.image_src);
        console.log(`Трек ${index}: добавлено изображение автора:`, track.image_src);
      }
      if (track.audio_src) {
        fileUrls.add(track.audio_src);
        console.log(`Трек ${index}: добавлено аудио:`, track.audio_src);
      }
    });
    
    console.log(`Всего уникальных файлов для скачивания: ${fileUrls.size}`);
  
  // Скачиваем все файлы
  const fileMap = new Map<string, string>(); // URL -> локальное имя файла
  
  let photoIndex = 0;
  let audioIndex = 0;
  
  for (const url of fileUrls) {
    try {
      // Пропускаем пустые или невалидные URL
      if (!url || url.trim() === '') {
        console.warn(`Пропущен невалидный URL: ${url}`);
        continue;
      }
      
      console.log(`Обработка файла: ${url}`);
      const blob = await downloadFile(url);
      const extension = getFileExtension(url);
      
      let fileName: string;
      let targetFolder: any | null = null;
      
      if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension)) {
        // Специальная обработка для статических ассетов
        if (url === '/chip.png') {
          fileName = 'chip.png';
          targetFolder = assetsFolder || null;
        } else if (url === '/menu_background.png') {
          fileName = 'menu_background.png';
          targetFolder = assetsFolder || null;
        } else {
          fileName = generateFileName(url, 'photo', photoIndex++);
          targetFolder = photosFolder || null;
        }
      } else if (['mp3', 'wav', 'ogg', 'm4a', 'aac'].includes(extension)) {
        fileName = generateFileName(url, 'audio', audioIndex++);
        targetFolder = audiosFolder || null;
      } else {
        // Для других типов файлов (например, фоновое изображение)
        fileName = generateFileName(url, 'asset');
        targetFolder = assetsFolder || null;
      }
      
      if (targetFolder && blob.size > 0) {
        targetFolder.file(fileName, blob);
        const relativePath = `assets/${targetFolder === photosFolder ? 'photos' : targetFolder === audiosFolder ? 'audios' : ''}/${fileName}`;
        fileMap.set(url, relativePath);
        console.log(`Файл добавлен в архив: ${url} -> ${relativePath}`);
      } else {
        console.warn(`Файл не добавлен (пустой или ошибка): ${url}, размер: ${blob.size}`);
      }
    } catch (error) {
      console.error(`Ошибка обработки файла ${url}:`, error);
    }
  }
  
    // Генерируем HTML с локальными путями
    console.log('Генерация HTML с локальными путями');
    console.log(`Карта файлов содержит ${fileMap.size} записей`);
    const htmlContent = generatePresentationHTML(data, fileMap);
    
    // Добавляем HTML файл в корень архива
    zip.file('presentation.html', htmlContent);
    console.log('HTML файл добавлен в архив');
    
    // Добавляем README файл с инструкциями
    const readmeContent = `# Инструкция по использованию презентации

## Как запустить:
1. Откройте файл presentation.html в браузере
2. Наслаждайтесь интерактивной презентацией!

## Управление:
- [M] или [М] - возврат в главное меню
- [Q] или [Й] - переход к поздравлению  
- [R] или [К] - сброс прогресса

## Особенности:
- Полностью автономная презентация
- Все ассеты включены в архив
- Работает без интернета
`;
    zip.file('README.txt', readmeContent);
    
    // Генерируем ZIP архив
    console.log('Генерация ZIP архива...');
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    console.log(`ZIP архив создан успешно, размер: ${zipBlob.size} байт`);
    
    return zipBlob;
  } catch (error) {
    console.error('Ошибка в generatePresentationZIP:', error);
    throw new Error(`Ошибка создания ZIP архива: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
  }
}

// Альтернативная функция для создания HTML с встроенными ассетами (без ZIP)
export async function generatePresentationHTMLWithAssets(data: PresentationData): Promise<string> {
  try {
    console.log('Создание HTML с встроенными ассетами');
    const { project, tracks } = data;
    
    // Собираем все уникальные URL файлов
    const fileUrls = new Set<string>();
    
    // Фоновое изображение проекта
    if (project.front_page_background_src) {
      fileUrls.add(project.front_page_background_src);
    }
    
    // Статические ассеты из public
    fileUrls.add('/chip.png');
    fileUrls.add('/menu_background.png');
    
    // Изображения и аудио треков
    tracks.forEach(track => {
      if (track.image_src) {
        fileUrls.add(track.image_src);
      }
      if (track.audio_src) {
        fileUrls.add(track.audio_src);
      }
    });
    
    // Получаем статические ассеты в base64
    const staticAssets = await getStaticAssetsBase64();
    
    // Скачиваем и конвертируем файлы в base64
    const fileMap = new Map<string, string>();
    
    // Сначала добавляем статические ассеты
    for (const [url, base64] of staticAssets) {
      fileMap.set(url, base64);
      console.log(`Статический ассет добавлен: ${url}`);
    }
    
    for (const url of fileUrls) {
      try {
        // Пропускаем статические ассеты, они уже добавлены
        if (url === '/chip.png' || url === '/menu_background.png') {
          continue;
        }
        
        if (!url || url.trim() === '' || !url.startsWith('http')) {
          console.warn(`Пропущен невалидный URL: ${url}`);
          continue;
        }
        
        console.log(`Обработка файла: ${url}`);
        const blob = await downloadFile(url);
        
        if (blob.size > 0) {
          const base64 = await blobToBase64(blob);
          fileMap.set(url, base64);
          console.log(`Файл конвертирован в base64: ${url}`);
        }
      } catch (error) {
        console.error(`Ошибка обработки файла ${url}:`, error);
      }
    }
    
    // Генерируем HTML с встроенными ассетами
    return generatePresentationHTML(data, fileMap);
  } catch (error) {
    console.error('Ошибка создания HTML с ассетами:', error);
    throw new Error(`Ошибка создания HTML: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
  }
}

// Тестовая функция для проверки работы генератора
export function testPresentationGenerator() {
  console.log('Тестирование генератора презентации...');
  
  // Создаем тестовые данные
  const testProject: Project = {
    id: 1,
    name: 'Тестовый проект',
    size_x: 3,
    size_y: 3,
    front_page_background_src: 'https://example.com/background.jpg',
    track_ids: [1, 2, 3],
    status: 'completed',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deadline: null,
    description: null
  };
  
  const testTracks: Track[] = [
    {
      id: 1,
      name: 'Тестовый трек 1',
      author: 'Тестовый автор 1',
      audio_src: 'https://example.com/audio1.mp3',
      image_src: 'https://example.com/image1.jpg',
      index: 1,
      project_id: 1,
      created_at: new Date().toISOString(),
      updated_at: null
    }
  ];
  
  console.log('Тестовые данные созданы:', { testProject, testTracks });
  return { testProject, testTracks };
}

// Тестовая функция для проверки статических ассетов
export async function testStaticAssets() {
  try {
    console.log('Тестирование статических ассетов...');
    const staticAssets = await getStaticAssetsBase64();
    console.log('Статические ассеты загружены:', staticAssets.size);
    
    for (const [url, base64] of staticAssets) {
      console.log(`Ассет: ${url}, размер base64: ${base64.length} символов`);
    }
    
    return staticAssets;
  } catch (error) {
    console.error('Ошибка тестирования статических ассетов:', error);
    return new Map();
  }
}

export function generatePresentationHTML(data: PresentationData, fileMap?: Map<string, string>): string {
  const { project, tracks } = data;
  
  // Сортируем треки по индексу
  const sortedTracks = tracks.sort((a, b) => a.index - b.index);
  
  // Функция для получения локального пути к файлу
  const getLocalPath = (url: string | null): string => {
    if (!url) return '';
    if (fileMap && fileMap.has(url)) {
      return fileMap.get(url) || url;
    }
    return url; // Fallback к оригинальному URL
  };
  
  return `<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>МУЗ ЛОТО: ${project.name}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Arial', sans-serif;
            overflow: hidden;
            background: #000;
            color: white;
        }

        .page {
            position: absolute;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            display: none;
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
        }

        .page.active {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
        }

        .page.fade-in {
            animation: fadeIn 0.5s ease-in-out;
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        /* Первая страница */
        .first-page {
            background-image: url('${getLocalPath(project.front_page_background_src)}');
        }

        .title-overlay {
            background: #32CD32;
            border: 3px solid #FFD700;
            border-radius: 15px;
            padding: 30px 50px;
            text-align: center;
            box-shadow: 0 0 20px rgba(0,0,0,0.5);
        }

        .title-text {
            color: white;
            font-size: 4rem;
            font-weight: bold;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.7);
            line-height: 1.2;
        }

        /* Главный экран */
        .main-page {
            background-image: url('${getLocalPath('/menu_background.png')}');
            background-color: #1a1a1a;
        }

        .grid-container {
            display: grid;
            grid-template-columns: repeat(${project.size_x}, 1fr);
            grid-template-rows: repeat(${project.size_y}, 1fr);
            gap: 15px;
            max-width: ${project.size_x * 220}px;
            max-height: ${project.size_y * 120}px;
            width: 100%;
            height: 100%;
            padding: 20px;
        }

        .track-card {
            background: white;
            border: 2px solid #FFD700;
            border-radius: 8px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
            min-height: 100px;
            max-width: 200px;
            max-height: 100px;
            user-select: none;
        }

        .track-card:hover {
            transform: scale(1.05);
            box-shadow: 0 5px 15px rgba(255, 215, 0, 0.3);
        }

        .track-card.played {
            background: #f0f0f0;
            opacity: 0.7;
            cursor: not-allowed;
        }

        .track-card.played:hover {
            transform: none;
            box-shadow: none;
        }

        .headphone-icon {
            position: absolute;
            top: -10px;
            left: 50%;
            transform: translateX(-50%);
            width: 20px;
            height: 20px;
            background: #FFD700;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            color: #8B008B;
            border: 2px solid #8B008B;
        }

        .track-name {
            color: #DC143C;
            font-weight: bold;
            font-size: 0.9rem;
            text-align: center;
            padding: 5px;
            line-height: 1.1;
        }

        .track-number {
            color: #666;
            font-weight: bold;
            font-size: 1.2rem;
        }

        /* Страница трека */
        .track-page {
            background-image: url('${getLocalPath(project.front_page_background_src)}');
            background-color: #1a1a1a;
        }

        .track-index {
            position: absolute;
            top: 30px;
            left: 30px;
            width: 80px;
            height: 80px;
            background-image: url('${getLocalPath('/chip.png')}');
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.8rem;
            font-weight: bold;
            color: white;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
        }

        .author-image {
            position: absolute;
            bottom: 30px;
            right: 30px;
            width: 200px;
            height: 200px;
            border-radius: 10px;
            border: 3px solid #FFD700;
            object-fit: cover;
        }

        .track-title {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0,0,0,0.7);
            padding: 20px 40px;
            border-radius: 10px;
            border: 2px solid #FFD700;
            text-align: center;
        }

        .track-title h2 {
            color: #FFD700;
            font-size: 2rem;
            margin-bottom: 10px;
        }

        .track-title p {
            color: white;
            font-size: 1.2rem;
        }

        /* Финальная страница */
        .final-page {
            background-image: url('${getLocalPath(project.front_page_background_src)}');
        }

        .congratulations-overlay {
            background: #32CD32;
            border: 3px solid #FFD700;
            border-radius: 15px;
            padding: 40px 60px;
            text-align: center;
            box-shadow: 0 0 20px rgba(0,0,0,0.5);
        }

        .congratulations-text {
            color: white;
            font-size: 2.5rem;
            font-weight: bold;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.7);
            line-height: 1.2;
        }

        /* Скрытые элементы */
        .hidden {
            display: none !important;
        }

        /* Анимации */
        .slide-in-left {
            animation: slideInLeft 0.5s ease-out;
        }

        .slide-in-right {
            animation: slideInRight 0.5s ease-out;
        }

        @keyframes slideInLeft {
            from { transform: translateX(-100%); }
            to { transform: translateX(0); }
        }

        @keyframes slideInRight {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
        }
    </style>
</head>
<body>
    <!-- Первая страница -->
    <div class="page first-page active" id="first-page">
        <div class="title-overlay">
            <div class="title-text">
                МУЗ ЛОТО:<br>
                ${project.name}
            </div>
        </div>
    </div>

    <!-- Главный экран -->
    <div class="page main-page" id="main-page">
        <div class="grid-container">
            ${generateTrackCards(sortedTracks, project.size_x, project.size_y)}
        </div>
        <div style="position: absolute; bottom: 20px; left: 20px; color: rgba(255,255,255,0.7); font-size: 14px;">
            [S] или [Ы] - главная | [Q] или [Й] - поздравление | [R] или [К] - сброс
        </div>
    </div>

    <!-- Страница трека -->
    <div class="page track-page" id="track-page">
        <div class="track-index" id="track-index">1</div>
        <div class="track-title" id="track-title">
            <h2 id="track-name">Название трека</h2>
            <p id="track-author">Автор</p>
        </div>
        <img class="author-image" id="author-image" src="" alt="Автор">
        <audio id="track-audio" autoplay></audio>
        <div style="position: absolute; bottom: 20px; left: 20px; color: rgba(255,255,255,0.7); font-size: 14px;">
            [S] или [Ы] - главная | [M] или [М] - меню | [Esc] - назад
        </div>
    </div>

    <!-- Финальная страница -->
    <div class="page final-page" id="final-page">
        <div class="congratulations-overlay">
            <div class="congratulations-text">
                ПОЗДРАВЛЯЕМ<br>
                ПОБЕДИТЕЛЕЙ!
            </div>
        </div>
        <div style="position: absolute; bottom: 20px; left: 20px; color: rgba(255,255,255,0.7); font-size: 14px;">
            [S] или [Ы] - вернуться на главную
        </div>
    </div>

    <script>
        // Данные презентации
        const presentationData = ${JSON.stringify({ project, tracks: sortedTracks })};
        const fileMap = ${fileMap ? JSON.stringify(Object.fromEntries(fileMap)) : 'null'};
        
        // Функция для получения локального пути к файлу
        function getLocalPath(url) {
            if (!url) return '';
            if (fileMap && fileMap[url]) {
                return fileMap[url];
            }
            return url; // Fallback к оригинальному URL
        }
        
        // Состояние приложения
        let currentPage = 'first-page';
        let playedTracks = JSON.parse(localStorage.getItem('playedTracks') || '[]');
        let currentTrackIndex = -1;

        // Инициализация
        document.addEventListener('DOMContentLoaded', function() {
            // Небольшая задержка для полной загрузки DOM
            setTimeout(() => {
                updateTrackCards();
                setupEventListeners();
                
                // Автоматический переход на главную страницу через 3 секунды
                setTimeout(() => {
                    showPage('main-page');
                }, 3000);
            }, 100);
        });

        // Остановка музыки при потере фокуса страницы
        document.addEventListener('visibilitychange', function() {
            if (document.hidden && currentPage === 'track-page') {
                const audio = document.getElementById('track-audio');
                if (audio) {
                    audio.pause();
                }
            }
        });

        // Остановка музыки при закрытии страницы
        window.addEventListener('beforeunload', function() {
            const audio = document.getElementById('track-audio');
            if (audio) {
                audio.pause();
            }
        });

        function setupEventListeners() {
            // Обработка кликов по карточкам треков
            const trackCards = document.querySelectorAll('.track-card');
            console.log('Найдено карточек треков:', trackCards.length);
            
            trackCards.forEach((card, index) => {
                card.addEventListener('click', (e) => {
                    e.preventDefault();
                    console.log('Клик по карточке трека:', index);
                    if (!playedTracks.includes(index)) {
                        showTrackPage(index);
                    } else {
                        console.log('Трек уже прослушан:', index);
                    }
                });
            });

            // Обработка клавиш (поддержка русской и английской раскладки)
            document.addEventListener('keydown', (e) => {
                const key = e.key.toLowerCase();
                
                // Клавиша M (русская М или английская M)
                if ((key === 'm' || key === 'м') && currentPage === 'track-page') {
                    showPage('main-page');
                } 
                // Клавиша S (русская Ы или английская S) - возврат на главную с любой страницы
                else if (key === 's' || key === 'ы') {
                    showPage('main-page');
                }
                // Клавиша Q (русская Й или английская Q)
                else if ((key === 'q' || key === 'й') && currentPage === 'main-page') {
                    showPage('final-page');
                }
                // Клавиша R (русская К или английская R) - очистка localStorage
                else if (key === 'r' || key === 'к') {
                    localStorage.removeItem('playedTracks');
                    playedTracks = [];
                    updateTrackCards();
                    console.log('localStorage очищен, прогресс сброшен');
                }
                // Клавиша Escape - возврат на главную
                else if (key === 'escape' && currentPage === 'track-page') {
                    showPage('main-page');
                }
            });

            // Обработка кликов по пустому месту для возврата на главную
            document.addEventListener('click', (e) => {
                if (currentPage === 'track-page' && e.target === e.currentTarget) {
                    showPage('main-page');
                }
            });
        }

        function showPage(pageId) {
            // Остановить музыку при уходе со страницы трека
            if (currentPage === 'track-page') {
                const audio = document.getElementById('track-audio');
                if (audio) {
                    audio.pause();
                    audio.currentTime = 0;
                }
            }

            // Скрыть все страницы
            document.querySelectorAll('.page').forEach(page => {
                page.classList.remove('active');
            });

            // Показать нужную страницу
            const targetPage = document.getElementById(pageId);
            if (targetPage) {
                targetPage.classList.add('active', 'fade-in');
                currentPage = pageId;
                
                // Убрать класс анимации после завершения
                setTimeout(() => {
                    targetPage.classList.remove('fade-in');
                }, 500);
            }
        }

        function showTrackPage(trackIndex) {
            console.log('showTrackPage вызвана с индексом:', trackIndex);
            const track = presentationData.tracks[trackIndex];
            if (!track) {
                console.error('Трек не найден для индекса:', trackIndex);
                return;
            }

            console.log('Открываем трек:', track);
            currentTrackIndex = trackIndex;

            // Обновить информацию о треке
            document.getElementById('track-index').textContent = track.index;
            document.getElementById('track-name').textContent = track.name || 'Неизвестный трек';
            document.getElementById('track-author').textContent = track.author || 'Неизвестный автор';
            
            // Установить изображение автора
            const authorImage = document.getElementById('author-image');
            if (track.image_src) {
                const localImagePath = getLocalPath(track.image_src);
                authorImage.src = localImagePath;
                authorImage.style.display = 'block';
            } else {
                authorImage.style.display = 'none';
            }

            // Воспроизвести аудио
            const audio = document.getElementById('track-audio');
            if (track.audio_src) {
                const localAudioPath = getLocalPath(track.audio_src);
                audio.src = localAudioPath;
                audio.play().catch(e => console.log('Не удалось воспроизвести аудио:', e));
            }

            showPage('track-page');
        }

        function updateTrackCards() {
            document.querySelectorAll('.track-card').forEach((card, index) => {
                if (playedTracks.includes(index)) {
                    card.classList.add('played');
                    const track = presentationData.tracks[index];
                    if (track) {
                        card.innerHTML = \`
                            <div class="headphone-icon">🎧</div>
                            <div class="track-number">\${track.index}</div>
                        \`;
                    }
                }
            });
        }

        // Отметить трек как прослушанный при возврате на главную
        function markTrackAsPlayed() {
            if (currentTrackIndex >= 0 && !playedTracks.includes(currentTrackIndex)) {
                playedTracks.push(currentTrackIndex);
                localStorage.setItem('playedTracks', JSON.stringify(playedTracks));
                updateTrackCards();
            }
        }

        // Переопределить функцию показа главной страницы
        const originalShowPage = showPage;
        showPage = function(pageId) {
            if (pageId === 'main-page' && currentPage === 'track-page') {
                markTrackAsPlayed();
            }
            originalShowPage(pageId);
        };
    </script>
</body>
</html>`;
}

function generateTrackCards(tracks: Track[], sizeX: number, sizeY: number): string {
  const totalSlots = sizeX * sizeY;
  let html = '';
  
  for (let i = 0; i < totalSlots; i++) {
    const track = tracks[i];
    if (track) {
      html += `
        <div class="track-card" data-track-index="${i}">
          <div class="headphone-icon">🎧</div>
          <div class="track-name">${track.name || 'Неизвестный трек'}</div>
        </div>
      `;
    } else {
      html += `
        <div class="track-card" style="opacity: 0.3;">
          <div class="headphone-icon">🎧</div>
          <div class="track-name">Пусто</div>
        </div>
      `;
    }
  }
  
  return html;
}
