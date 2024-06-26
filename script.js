

const tvPath = "tv";
const currentPath = window.location.pathname;
const apiKey = '9ef07499b6c050f5231237075e92547e';


let page =  1;
const imgPath = 'https://image.tmdb.org/t/p/w1280';
const movieUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&page=${page}&sort_by=popularity.desc`;
const  tvUrl = `https://api.themoviedb.org/3/discover/tv?api_key=${apiKey}&page=${page}&sort_by=popularity.desc`;


let apiUrl = currentPath.includes(tvPath) ? tvUrl : movieUrl;

const searchApi = `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=`;


let infoText = document.querySelector(".info-text")
const main = document.getElementById("main");
const pagination = document.querySelector(".pagination");
const searchInput = document.getElementById("search");
const form = document.getElementById("form");
const paginationBtn = document.querySelectorAll(".pagination-btn");


var submitted; 

let searchedWord; 
infoText.innerHTML = verifyText(submitted);




getMovies(apiUrl)  //works for both movies and tv-series;

async function getMovies(url){
     try{
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error('Failed to fetch the initial list of movies or TV series');
    }
      const data =  await res.json();

        // Map over the results and fetch additional details for each movie or tv-series
        const moviesWithDetails = await Promise.all(data.results.map(async movie => {

            const  moviedetails = `https://api.themoviedb.org/3/movie/${movie.id}?api_key=${apiKey}&append_to_response=genres`;
            const tvdetails = `https://api.themoviedb.org/3/tv/${movie.id}?api_key=${apiKey}&append_to_response=genres`;

            // Determine details URL based on the current path
            const detailsUrl  =  currentPath.includes(tvPath) ? tvdetails : moviedetails;

            const detailsRes = await fetch(detailsUrl);
            if (!detailsRes.ok) {
                throw new Error('Failed to fetch movie or tv-series details');
            }
            const detailsData = await detailsRes.json();
            return { ...movie, details: detailsData };
        }));

        showMovies(moviesWithDetails) //handles both movies and tv-series;
    }catch(err){
        console.error(`API All media fetching Failed: ${err}`)
         const errheader = document.createElement("h1")
         errheader.classList.add("err")
         errheader.innerHTML = "Film Center is currently down; try again later;";
         main.appendChild(errheader);
    }
}



 function showMovies(movies){
       submitted = false;
    main.innerHTML  = " ";

     
     const movieCard = movies.map((movie) => {

           const {vote_average, poster_path, overview} = movie;
           const roundedAverage = vote_average.toFixed(1);
           const titleValue = movie[currentPath.includes(tvPath) ? "name" : "title"];
           const dateValue = movie[currentPath.includes(tvPath) ? "first_air_date" : "release_date"];
           const releaseYear = Number(dateValue.split("-")[0]);
           const genres = movie.details && movie.details.genres ? movie.details.genres.map(genre => genre.name).join(', ') : 'N/A';
           const runtime = movie.details && movie.details.runtime ? movie.details.runtime + ' min' : 'N/A';
                

            return `
               <div class="movie">
               <figure class="movie__poster" >
                 <img src="${imgPath + poster_path}" alt="${titleValue}" title="${titleValue}" >
               </figure>
               <span class="vote ${getRate(roundedAverage)}">${roundedAverage}</span>
               <h3>${titleValue} (${releaseYear})</h3>
               <div class="overlay">
                  <img src="assets/play.svg" alt="play button" title="play button" class="play" >
               </div>
                <div class="overview">
                  <h3>${titleValue} (${releaseYear})</h3>
                    <div class="info">
                            <span class="txt rate ${getRate(roundedAverage)}">TMDb: ${roundedAverage}</span>
                            <span class="txt">${releaseYear}</span>
                            <span class="txt">${runtime}</span>
                    </div>
                    <p>
                       ${overview}
                    </p>

                 <div class="genre">Genre: <span>${genres}</span></div>
                </div>

              </div>
             `;
      }).join('');

      main.innerHTML = movieCard;
 }









 
 async function getSearch(url){
    try {
        const res = await fetch(url);
        if (!res.ok) {
            throw new Error('Failed to fetch initial searched movies & TV series');
        }
        const data =  await res.json();
   
        const validMoviesAndSeries = data.results.filter(item => item.media_type === "movie" || item.media_type === "tv");
        const moviesAndSeriesWithDetails = await Promise.all(validMoviesAndSeries.map(async item => {
            let detailsUrl;
            if (item.media_type === 'movie') {
                detailsUrl = `https://api.themoviedb.org/3/movie/${item.id}?api_key=${apiKey}&append_to_response=genres`;
            } else if (item.media_type === 'tv') {
                detailsUrl = `https://api.themoviedb.org/3/tv/${item.id}?api_key=${apiKey}&append_to_response=genres`;
            }

            const detailsRes = await fetch(detailsUrl);
            if (!detailsRes.ok) {
                throw new Error('Failed to fetch searched movie & TV series details');
            }
            const detailsData = await detailsRes.json();
            return { ...item, details: detailsData };
        }));

        showMoviesAndSeries(moviesAndSeriesWithDetails); // Handles Searches for both movies and tv-series;
    } catch (err) {
        console.error(`getSearch API fetching Failed: ${err}`);
        const errheader = document.createElement("h1");
        errheader.classList.add("err");
        errheader.innerHTML = "Searching not available at the moment; try again later;";
        main.appendChild(errheader);

    }
}



function showMoviesAndSeries(movies){
     main.innerHTML = " ";

    
  const movieCard = movies.map((movie) =>{
          const {vote_average, poster_path, overview} = movie;
          const t = movie.media_type === "movie" ? "title" : "name";
          const d = movie.media_type === "movie" ? "release_date" : "first_air_date";
          const titleValue = movie[t];
          const dateValue = movie[d];
          const releaseYear = Number(dateValue.split("-")[0]);
          const roundedAverage = vote_average.toFixed(1);
          const genres = movie.details && movie.details.genres ? movie.details.genres.map(genre => genre.name).join(', ') : 'N/A';
          const runtime = movie.details && movie.details.runtime ? movie.details.runtime + ' min' : 'N/A';
               

           return `
              <div class="movie">
              <figure class="movie__poster" >
               <img src="${imgPath + poster_path}" alt="${titleValue}" title="${titleValue}">
              </figure>
              <span class="vote ${getRate(roundedAverage)}">${roundedAverage}</span>
              <h3>${titleValue} (${releaseYear})</h3>
              <div class="overlay">
                 <img src="assets/play.svg" alt="play button" title="play button" class="play" >
              </div>
               <div class="overview">
                 <h3>${titleValue} (${releaseYear})</h3>
                   <div class="info">
                           <span class="txt rate ${getRate(roundedAverage)}">TMDb: ${roundedAverage}</span>
                           <span class="txt">${releaseYear}</span>
                           <span class="txt">${runtime}</span>
                   </div>
                   <p>
                      ${overview}
                   </p>

                <div class="genre">Genre: <span>${genres}</span></div>
               </div>

             </div>
            `;
     }).join('');

     main.innerHTML = movieCard;

}









//Call getSearch APi
form.addEventListener("submit", function handleSearch(e){
    e.preventDefault();
      searchedWord = searchInput.value.trim();


    if (searchedWord && searchedWord !== "") {
        submitted = true;
        pagination.style.display = "none";
        infoText.innerHTML = verifyText(submitted);
        getSearch(searchApi + searchedWord);
        searchInput.value = "";


        setTimeout(RemoveMobileNavBar, 200);
        
    } else {
        window.location.reload();
        pagination.style.display = "block";
    }


});


















function handlePages(e) {
 
    paginationBtn.forEach(p => p.classList.remove("active"));
    this.classList.add("active");

    page = e.target.value;
    apiUrl = currentPath.includes(tvPath) ? `https://api.themoviedb.org/3/discover/tv?api_key=${apiKey}&page=${page}&sort_by=popularity.desc` : `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&page=${page}&sort_by=popularity.desc`;
    getMovies(apiUrl);
  
}

paginationBtn.forEach(p => p.addEventListener("click", handlePages));





function verifyText(formSubmitted) {
 if (formSubmitted === true) {
     return `Search Results for "${searchedWord}"`;
 } else if (currentPath.includes(tvPath)) {
     submitted = false;
     return "POPULAR TV-SERIES";
 } else {
     return "POPULAR MOVIES";
 }
}




function getRate(int){
 if(int >= 8) {
     return 'green';
 } else if(int >= 5) {
     return 'orange';
 } else {
     return 'red';
 }
}






//Mobile Menu Function

const menuBtn = document.getElementById('menu');

menuBtn.addEventListener('click', function(){
    menuBtn.classList.toggle('active');

    let navEl = document.querySelector("nav");
    let isOpen = menuBtn && menuBtn.classList.contains('active') ? true : false;

    if(isOpen){
        navEl.classList.remove('fadeout');
        setTimeout(() => {
            navEl.classList.add('mobile-navbar'); 
        }, 200); 
    } else {
        navEl.classList.add("fadeout");
        setTimeout(() => {
            navEl.classList.remove('mobile-navbar');
        }, 200); 
    }
});


//hover effects for mobile IOS devices

function handleTouch(event) {
    const target = event.target.closest('.movie');
    if (target) {
        target.classList.add('touch');
    }
}

function handleRemoveTouch(event) {
    const target = event.target.closest('.movie');
    if (target) {
        target.classList.remove('touch');
    }
}


main.addEventListener('touchstart', handleTouch);
main.addEventListener('touchend', handleRemoveTouch);


function RemoveMobileNavBar() {

    if (window.innerWidth <= 992 && submitted === true) {
        menuBtn.click();
    } else {
       return;
    }
}
