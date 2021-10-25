import axios from "axios"
import * as $ from 'jquery';

const $showsList = $("#showsList");
const $episodesList = $("#episodesList");
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

function populateShows(shows: TvInterface[]): void {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src="${show.image}"
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

async function searchForShowAndDisplay(): Promise<void> {
  const term = $("#searchForm-term").val() as string;
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt): Promise<void> {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

interface EpisodeInterface {
  id: number;
  name: string;
  season: string;
  number: number;
}

async function getEpisodesOfShow(id: number): Promise<EpisodeInterface[]> {
  const response = await axios({
    url: `${BASE_URL}shows/${id}/episodes`,
    method: "GET",
  });

  return response.data.map((e: EpisodeInterface) => ({
    id: e.id,
    name: e.name,
    season: e.season,
    number: e.number,
  }));
}

/** Given list of episodes, create markup for each and to DOM */

function populateEpisodes(episodes: EpisodeInterface[]): void {
  $episodesList.empty();

  for (let episode of episodes) {
    const $item = $(
      `<li>
         ${episode.name}
         (season ${episode.season}, episode ${episode.number})
       </li>
      `);

    $episodesList.append($item);
  }

  $episodesArea.show();
}

/** Handle click on episodes button: get episodes for show and display */

async function getEpisodesAndDisplay(evt: { target: HTMLElement }): Promise<void> {
  // here's one way to get the ID of the show: search "closest" ancestor
  // with the class of .Show (which is put onto the enclosing div, which
  // has the .data-show-id attribute).
  const showId = $(evt.target).closest(".Show").data("show-id");

  // here's another way to get the ID of the show: search "closest" ancestor
  // that has an attribute of 'data-show-id'. This is called an "attribute
  // selector", and it's part of CSS selectors worth learning.
  // const showId = $(evt.target).closest("[data-show-id]").data("show-id");

  const episodes = await getEpisodesOfShow(showId);
  populateEpisodes(episodes);
}

$showsList.on("click", ".Show-getEpisodes", getEpisodesAndDisplay);