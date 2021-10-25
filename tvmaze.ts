import axios from "axios"
import * as $ from 'jquery';

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");
const BASE_URL: string = "http://api.tvmaze.com/";

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

interface TvInterface {
  id: number;
  name: string;
  summary: string;
  image: string;
}
async function getShowsByTerm(term: string): Promise<TvInterface[]> {
  // ADD: Remove placeholder & make request to TVMaze search shows API.
  const response = await axios.get(`${BASE_URL}search/shows?q=${term}`);
  const shows = response.data.map(_handleShowData);
  return shows;

}

interface eachShowInterface {
  show: {
    id: number;
    name: "string";
    summary: "string";
    image?: { medium: string }
  };
}

/** Parse received data from each show and return {id, name, summary, image} */
function _handleShowData(eachShow: eachShowInterface): TvInterface {
  return {
    id: eachShow.show.id,
    name: eachShow.show.name,
    summary: eachShow.show.summary,
    image: eachShow.show.image
      ? eachShow.show.image.medium
      : "https://static.tvmaze.com/uploads/images/medium_portrait/147/369403.jpg"
  }
}

/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src="http://static.tvmaze.com/uploads/images/medium_portrait/160/401704.jpg"
              alt="Bletchly Circle San Francisco"
              class="w-25 mr-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);

    $showsList.append($show);
  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

// async function getEpisodesOfShow(id) { }

/** Write a clear docstring for this function... */

// function populateEpisodes(episodes) { }