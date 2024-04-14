const userInfo = document.getElementById('user');
const userOptions = document.getElementById('profile_container');

const userIcon = document.getElementById('user_icon');
const menu = document.querySelector('.menu');
const menuOptions = document.querySelector('.menu_options')
userInfo.addEventListener('click', (event) => {
    event.stopPropagation();
    userOptions.classList.toggle('user_show');
});

menu.addEventListener('click', (event) => {
    event.stopPropagation();
    menuOptions.classList.toggle('menu_options_show');
});
userIcon.addEventListener('click', (event) => {
    event.stopPropagation();
    userOptions.classList.toggle('user_show');
});

document.addEventListener('click', (event) => {
    if (!userOptions.contains(event.target) && event.target !== userInfo) {
        userOptions.classList.remove('user_show');
    }
    if (!menuOptions.contains(event.target) && event.target !== menu) {
        menuOptions.classList.remove('menu_options_show');
    }
});

document.getElementById('logout-button').addEventListener('click', () => {
    fetch('/logout', { method: 'GET' })
        .then((response) => {
            if (response.redirected) {
                window.location.href = response.url;
            }
        })
        .catch((error) => {
            console.error('Error logging out:', error);
        });
});

// const youtubeApiKey = 'AIzaSyDDE-in4LuSrD4b2NnKTdgm8u5GpuRfdJs';

function clearResults() {
    const wikipediaResults = document.getElementById('wikipediaResults');
    const youtubeResults = document.getElementById('youtubeResults');
    wikipediaResults.innerHTML = '';
    youtubeResults.innerHTML = '';
}

async function fetchWikipediaImages(title) {
    try {
        const response = await fetch(`https://en.wikipedia.org/w/api.php?action=query&titles=${title}&prop=images&format=json&origin=*`);
        const data = await response.json();
        const pageId = Object.keys(data.query.pages)[0];

        if (data.query.pages[pageId].images) {
            const imageTitles = data.query.pages[pageId].images.map(imageInfo => imageInfo.title);

            const relevantImageTitles = imageTitles.filter(imageTitle => imageTitle.toLowerCase().includes(title.toLowerCase()));

            const imageUrls = await Promise.all(
                relevantImageTitles.map(async (imageTitle) => {
                    try {
                        const imageUrlResponse = await fetch(`https://en.wikipedia.org/w/api.php?action=query&titles=${imageTitle}&prop=imageinfo&iiprop=url&format=json&origin=*`);
                        const imageData = await imageUrlResponse.json();
                        const image = Object.values(imageData.query.pages)[0];
                        return image.imageinfo[0].url;
                    } catch (error) {
                        console.error('Wikipedia Image Fetch Error:', error);
                        return null;
                    }
                })
            );

            return imageUrls.filter(url => url !== null);
        }
    } catch (error) {
        console.error('Wikipedia Image Fetch Error:', error);
    }
    return [];
}

async function fetchWikipediaData(title, sentenceLimit = 20) {
    try {
        const response = await fetch(`https://en.wikipedia.org/w/api.php?action=query&titles=${title}&prop=extracts&explaintext&format=json&origin=*`);
        const data = await response.json();
        const pageId = Object.keys(data.query.pages)[0];
        if (data.query.pages[pageId].extract) {
            let extract = data.query.pages[pageId].extract;

            // Ensure the extract is not null or undefined
            if (extract) {
                // Split the extract into sentences
                const sentences = extract.split(/\. /);

                // Limit the content to a certain number of sentences
                if (sentences.length > sentenceLimit) {
                    extract = sentences.slice(0, sentenceLimit).join('. ') + '.';
                }

                return extract;
            }
        }
    } catch (error) {
        console.error('Wikipedia Data Fetch Error:', error);
    }
    return null;
}




function createWikipediaEntry(title, content, imageUrls) {
    const entryDiv = document.createElement('div');
    entryDiv.classList.add('wikipedia-entry');

    const titleElement = document.createElement('h2');
    titleElement.textContent = title;
    titleElement.classList.add('entry-title');
    entryDiv.appendChild(titleElement);

    const contentDiv = document.createElement('div');
    contentDiv.classList.add('entry-content');
    // contentDiv.innerHTML = content;
    contentDiv.innerHTML = parseMediaWikiMarkup(content);
    entryDiv.appendChild(contentDiv);

    if (imageUrls && imageUrls.length > 0) {
        const imageContainer = document.createElement('div');
        imageContainer.classList.add('entry-images');

        imageUrls.forEach(imageUrl => {
            const imageElement = document.createElement('img');
            imageElement.src = imageUrl;
            imageElement.classList.add('entry-image');
            imageContainer.appendChild(imageElement);
        });

        entryDiv.appendChild(imageContainer);
    }

    const wikipediaResults = document.getElementById('wikipediaResults');
    wikipediaResults.appendChild(entryDiv);
}

function parseMediaWikiMarkup(markup) {
    // Regular expression to identify headings in MediaWiki markup
    const headingRegex = /(=+)([^=]+)\1/g;

    return markup.replace(headingRegex, (match, equalSigns, headingText) => {
        // const level = equalSigns.length - 1;
        return `<p class='sub-title'>${headingText.trim()}</p>`;
    });
}

async function displayWikipediaResults(searchQuery) {
    try {
        const wikipediaResults = document.getElementById('wikipediaResults');

        const response = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${searchQuery}&utf8=&format=json&origin=*`);
        const data = await response.json();

        const searchResults = data.query.search;

        for (const result of searchResults) {
            const title = result.title;
            const extract = await fetchWikipediaData(title);
            const imageUrls = await fetchWikipediaImages(title);
            createWikipediaEntry(title, extract, imageUrls);
        }
    } catch (error) {
        console.error('Wikipedia API Error:', error);
    }
}

async function displayYouTubeResults(searchQuery) {
    try {
        const youtubeResults = document.getElementById('youtubeResults');

        const response = await fetch(`https://www.googleapis.com/youtube/v3/search?key=${youtubeApiKey}&q=${searchQuery}&part=snippet&type=video`);
        const data = await response.json();

        if (data.items) {
            data.items.forEach(item => {
                const videoContainer = document.createElement('div');
                videoContainer.className = 'youtube-video';

                // Check if the video is playable
                if (item.id.videoId) {
                    videoContainer.innerHTML = `<iframe width="700" height="300" src="https://www.youtube.com/embed/${item.id.videoId}" frameborder="0" allowfullscreen></iframe>`;
                    youtubeResults.appendChild(videoContainer);
                }
            });
        }
    } catch (error) {
        console.error('YouTube API Error:', error);
    }
}


// Add this code at the bottom of your script.js file
document.getElementById('searchButton').addEventListener('click', async function (event) {
    event.preventDefault();
    const searchQuery = document.getElementById('searchInput').value;
    clearResults();
    await displayWikipediaResults(searchQuery);
    await displayYouTubeResults(searchQuery);
});


const userThemePreference = sessionStorage.getItem('theme');

// If the preference is set, apply the theme
if (userThemePreference === 'dark') {
  document.body.classList.add('dark_mode');
}

const lightDark = document.querySelector('.light_dark');
lightDark.addEventListener('click',()=>{
    let body=document.body;
    let ldIcon = document.querySelector('.ld');
    body.classList.toggle("dark_mode");

    const currentTheme = body.classList.contains('dark_mode') ? 'dark' : 'light';
    sessionStorage.setItem('theme', currentTheme);

    if(body.classList.contains("dark_mode")){
        ldIcon.name = 'sunny';
    }
    else{
        ldIcon.name = 'moon';
    }

})


const dicSearchIcon = document.querySelector('.dictionary_icon'),
    dicSearchBlock = document.querySelector('.dictionary_block')
    dicSearch = document.querySelector('.dic_search');

dicSearchIcon.addEventListener('click',()=>{
    dicSearchBlock.classList.toggle('active');
    // if (dicSearchBlock.classList.contains('active')){
    //     dicSearchBlock.innerHTML = `<div class="dic_input">
    //     <input type="text" placeholder="Enter word here..." id="word-input"/>
    //     <button class="dic_search"><ion-icon name="search"></ion-icon></button>
    //   </div>
    //   <div class="dic_meaning">
    //     <div class="audio_word">
    //       <audio src="" id="word-audio">audio</audio>
    //       <div class="audio_icn"><ion-icon name="volume-medium-outline"></ion-icon></div>
    //       <div class="word_class">
    //         <h2 class="word"></h2>
    //       </div>
    //     </div>
    //     <div class="phonetic_class">
    //       <p class="phonetic"></p>
    //     </div>
    //     <ul class="meanings"></ul>
    //   </div>`;
    // }else{
    //     dicSearchBlock.innerHTML = '';
    // }
    // dicSearch.focus();
});
dicSearch.addEventListener('click', () => {
    const wordInput = document.getElementById('word-input').value,
        word= document.querySelector('.word'),
        wordAudio = document.getElementById('word-audio'),
        phonetic = document.querySelector('.phonetic'),
        meaningsArr = document.querySelector('.meanings'),
        playIcon = document.querySelector('.audio_icn'),
        playBtn = document.querySelector('.audio_icn');
        
        word.innerHTML = '';
        phonetic.innerHTML = '';
        meaningsArr.innerHTML =  '';
        playIcon.style.display =  'none';
    if (wordInput) {
        // fetchWord(wordInput);
        fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${wordInput}`)
        .then(response => response.json())
        .then(data => {
            // console.log(data[0].phonetics[0].audio);
            word.innerHTML = data[0].word;
            playIcon.style.display =  'block';
            playBtn.addEventListener('click',()=>{
                wordAudio.src = data[0].phonetics[0].audio;
                wordAudio.play();
            });
            wordAudio.src = data[0].phonetics[0].audio;
            console.log(data[0].phonetics[0].audio);
            phonetic.innerHTML = data[0].phonetic;
            data[0].meanings.forEach(ele => {
                let pos = document.createElement('li');
                pos.setAttribute('class','preposition');
                pos.innerHTML = ele.partOfSpeech;
                let defs = document.createElement('ol');
                for(let i=0;i<ele.definitions.length;i++){
                    let d = ele.definitions[i]; 
                    let def = document.createElement('li');
                    def.innerHTML = `${d.definition} <br> <p>${d.example ? `"${d.example}"` : ''}</p>`;
                    defs.appendChild(def);
                }
                meaningsArr.appendChild(pos);
                meaningsArr.appendChild(defs);
                
            });
        })
        .catch(error => console.error('Error:', error));
    } else {
        alert("Please enter a word!");
    }
});


