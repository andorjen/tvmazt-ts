import axios from "axios"
import * as $ from 'jquery';

const $showsList = $("#showsList");
const $episodesList = $("#episodesList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");
const BASE_URL: string = "http://api.tvmaze.com/";

interface ShowInterface {
  id: number;
  name: string;
  summary: string;
  image: { medium: string }
}

// interface ShowDataInterface {
//   show: {
//     id: number;
//     name: string;
//     summary: string;
//     image?: { medium: string }
//   };
// }

interface EpisodeInterface {
  id: number;
  name: string;
  season: string;
  number: number;
}


/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term: string): Promise<ShowInterface[]> {
  const response = await axios.get(`${BASE_URL}search/shows?q=${term}`);
  const shows: ShowInterface[] = response.data.map(_handleShowData);
  return shows;

}


/** Parse received data from each show and return {id, name, summary, image} */
function _handleShowData(eachShow: { show: ShowInterface }): ShowInterface {
  const show = eachShow.show;
  return {
    id: show.id,
    name: show.name,
    summary: show.summary,
    image: { medium: show.image?.medium || "https://static.tvmaze.com/uploads/images/medium_portrait/147/369403.jpg" }
  }
}

/** Given list of shows, create markup for each and to DOM */

function populateShows(shows: ShowInterface[]): void {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src="${show.image.medium}"
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


/** Given a show ID, get from API,
 *  returns (promise) array of episodes: [{ id, name, season, number },...]
 */

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

async function getEpisodesAndDisplay(evt: JQuery.ClickEvent): Promise<void> {

  const showId = $(evt.target).closest(".Show").data("show-id");
  const episodes = await getEpisodesOfShow(showId);
  populateEpisodes(episodes);
}

$showsList.on("click", ".Show-getEpisodes", getEpisodesAndDisplay);