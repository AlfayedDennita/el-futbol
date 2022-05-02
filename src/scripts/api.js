import $clamp from "clamp-js/clamp.js";
import swal from "sweetalert/dist/sweetalert.min.js";
import {saveClubData, getSavedClubData, getAllClubData, saveFavorites, getFavoriteClub, getAllFavoriteClubs, deleteFavoriteClub} from "./db.js"

const baseURL = "https://api.football-data.org/v2/",
      authToken = "c925be32fdfe4e7c91c85fe27aefae25";

const fetchAPI = (url) => {
   return fetch(url, {
      headers: {
         "X-Auth-Token": authToken
      }
   });
}

function statusFetch(response) {
   if(response.status !== 200) {
      return Promise.reject(new Error(response.statusText));
   } else {
      return Promise.resolve(response);
   }
}

function parse(response) {
   return response.json();
}

function error(error) {
   console.log(`Terdapat eror: ${error}`);
}

function checkCacheStatus(url) {
   return new Promise((resolve, reject) => {
      caches.match(url)
         .then(response => {
            resolve(response);
         });
   });
}

export function getClubData() {
   //--- Inner Response

   function innerResponse(data) {
      data.teams.forEach(club => {
         saveClubData(club);
      });
   }

   //--- Get from Cache

   if("caches" in window) {
      caches.match(`${baseURL}competitions/2014/teams`).then(response => {
         if(response) {
            response.json().then(data => {
               innerResponse(data);
            });
         }
      });
   }
   
   //--- Get from Internet

   fetchAPI(`${baseURL}competitions/2014/teams`)
      .then(parse)
      .then(data => {
         innerResponse(data)
      });
}

function getImageClub(id) {
   getSavedClubData(id).then(data => {
      document.querySelectorAll(`img[data-image-id="${id}"]`).forEach(elm => {
         const filterURL = data.crestUrl.replace(/^http:\/\//i, "https://");
         elm.src = filterURL;
      });
   });
}

function colorizeFavoriteClub() {
   getAllFavoriteClubs().then(data => {
      data.forEach(club => {
         const favoriteClub = document.querySelectorAll(`[data-club-id="${club.id}"]`);
         favoriteClub.forEach(favClub => {
            favClub.style.color = "#f1c40f";
         });
      });
   });
}

function starredFavoriteButton() {
   getAllFavoriteClubs().then(data => {
      data.forEach(club => {
         const favoriteButton = document.querySelectorAll(`[data-favorite-club="${club.id}"]`);
         favoriteButton.forEach(favButton => {
            favButton.innerHTML = `<span>star</span>`;
         });
      });
   });
}

function getCurrentMatchday() {
   return new Promise((resolve, reject) => {
      //--- Inner Response

      function innerResponse(data) {
         resolve(data.currentSeason.currentMatchday);
      }

      //--- Get from Cache

      if("caches" in window) {
         caches.match(`${baseURL}competitions/2014`).then(response => {
            if(response) {
               response.json().then(data => {
                  innerResponse(data);
               });
            }
         });
      }

      //--- Get from Internet

      fetchAPI(`${baseURL}competitions/2014`)
         .then(parse)
         .then(data => {
            innerResponse(data);
         });
   });
}

export function showCurrentMatchday() {
   getCurrentMatchday().then(data => {
      document.querySelectorAll(".current-matchday").forEach(elm => {
         elm.innerHTML = data;
      });
   });
}

export function showMatchday(containerLeft, containerRight, matchday) {
   if(matchday === "current") {
      getCurrentMatchday().then(data => {
         getMatchday(data, containerLeft, containerRight);
      });
   } else if (matchday === "next") {
      getCurrentMatchday().then(data => {
         getMatchday(data+1, containerLeft, containerRight);
      });
   }
}

function getMatchday(matchday, containerLeft, containerRight) {
   //--- Inner Response
   function innerResponse(data) {
      function insertHTML(container) {

         let matchdayHTML = "",
             matchday = data.matches,
             indexStart,
             indexEnd;

         if(container === "left") {
            indexStart = 0;
            indexEnd = 5;
         } else if (container === "right") {
            indexStart = 5;
            indexEnd = 10;
         }

         for(let i = indexStart; i < indexEnd; i++) {

            let status = matchday[i].status;

            switch(status) {
               case "SCHEDULED":
                  status = "Belum Mulai";
                  break;
               case "LIVE":
                  status = "Langsung";
                  break;
               case "IN_PLAY":
                  status = "Sedang Tanding";
                  break;
               case "PAUSED":
                  status = "Jeda";
                  break;
               case "FINISHED":
                  status = "Selesai";
                  break;
               case "POSTPONED":
                  status = "Ditunda";
                  break;
               case "SUSPENDED":
                  status = "Ditangguhkan";
                  break;
               case "CANCELED":
                  status = "Dibatalkan";
                  break;
            }

            let fullDate = new Date(matchday[i].utcDate),
                date = fullDate.getDate(),
                month = fullDate.getMonth()+1,
                hour = fullDate.getHours(),
                minute = fullDate.getMinutes();
            
            if(date < 10) {
               date = "0" + date;
            }
            if(month < 10) {
               month = "0" + month;
            }
            if(hour < 10) {
               hour = "0" + hour;
            }
            if(minute < 10) {
               minute = "0" + minute;
            }

            fullDate = `${date}/${month} ${hour}:${minute}`;

            let homeTeam = matchday[i].homeTeam.name,
                awayTeam = matchday[i].awayTeam.name;

            homeTeam = homeTeam.split(" ").slice(0, 2).join(" ");
            awayTeam = awayTeam.split(" ").slice(0, 2).join(" ");

            matchdayHTML +=
            `
            <div class="row match" data-status="${matchday[i].status}" data-winner="${matchday[i].score.winner}">
               <div class="col s8 team-match">
                  <div class="home">
                     <span data-club-id="${matchday[i].homeTeam.id}"><img class="left" data-image-id="${matchday[i].homeTeam.id}" alt="${matchday[i].homeTeam.name}">${homeTeam}</span>
                     <span class="right full-time-score" data-score="${matchday[i].score.fullTime.homeTeam}">${matchday[i].score.fullTime.homeTeam}</span>
                  </div>
                  <div class="away">
                     <span data-club-id="${matchday[i].awayTeam.id}"><img class="left" data-image-id="${matchday[i].awayTeam.id}" alt="${matchday[i].awayTeam.name}">${awayTeam}</span>
                     <span class="right full-time-score" data-score="${matchday[i].score.fullTime.awayTeam}">${matchday[i].score.fullTime.awayTeam}</span>
                  </div>
               </div>
               <div class="col s4 center-align date">
                  <span class="status">${status}</span>
                  <span>${fullDate}</span>
               </div>
            </div>
            `;

            getImageClub(matchday[i].homeTeam.id);
            getImageClub(matchday[i].awayTeam.id);
         }

         if(container === "left") {
            document.querySelector(containerLeft).innerHTML = matchdayHTML;
         } else if (container === "right") {
            document.querySelector(containerRight).innerHTML = matchdayHTML;
         }
      }
      insertHTML("left");
      insertHTML("right")
      colorizeFavoriteClub();
   }

   //--- Get from Cache

   if("caches" in window) {
      caches.match(`${baseURL}competitions/2014/matches?matchday=${matchday}`).then(response => {
         if(response) {
            response.json()
               .then(data => {
                  innerResponse(data);
               })
               .catch(() => {
                  const errorText = 
                  `
                  <div class="center-align">
                     <p class="grey-text">Gagal memuat, coba lagi beberapa saat.</p>
                  </div>
                  `;
                  document.querySelector(containerLeft).innerHTML = errorText;
                  document.querySelector(containerRight).innerHTML = errorText;
               });
         }
      });
   }

   //--- Get from Internet

   fetchAPI(`${baseURL}competitions/2014/matches?matchday=${matchday}`)
      .then(response => {
         if(response.status === 400) {
            const errorText = 
            `
            <div class="center-align">
               <p class="grey-text">Tidak ada jadwal pertandingan.</p>
            </div>
            `;
            document.querySelector(containerLeft).innerHTML = errorText;
            document.querySelector(containerRight).innerHTML = errorText; 
         } else if (response.status !== 200) {
            return Promise.reject(new Error(response.statusText));
         } else {
            return Promise.resolve(response);
         }
      })
      .then(parse)
      .then(data => {
         innerResponse(data);
      })
      .catch(() => {
         checkCacheStatus(`${baseURL}competitions/2014/matches?matchday=${matchday}`).then(data => {
            if(data === undefined) {
               const errorText = 
               `
               <div class="center-align">
                  <p class="grey-text">Gagal memuat, butuh koneksi internet terlebih dahulu.</p>
               </div>
               `;
               document.querySelector(containerLeft).innerHTML = errorText;
               document.querySelector(containerRight).innerHTML = errorText;
            }
         });
      });
}

export function getStandings(container, type) {
   //--- Inner Response
   function innerResponse(data) {
      let standingsHTML = "",
          standing = data.standings[0].table,
          indexEnd;

      if (type === "home") {
         indexEnd = 5;
      } else if (type === "full") {
         indexEnd = 20;
      }

      for(let i = 0; i < indexEnd; i++) {
         let gdStatus,
             gd = standing[i].goalDifference; 
         
         if(standing[i].goalDifference > 0) {
            gdStatus = "plus";
            gd = `+${standing[i].goalDifference}`;               
         } else if (standing[i].goalDifference < 0) {
            gdStatus = "minus";                  
         } else {
            gdStatus = "zero";
         }

         const filterURL = standing[i].team.crestUrl.replace(/^http:\/\//i, "https://");
         
         standingsHTML +=
         `
         <tr>
            <td>${standing[i].position}</td>
            <td class="left-align"><a href="detail-klub.html?id=${standing[i].team.id}" title="${standing[i].team.name}"><img class="left" src="${filterURL}" alt="${standing[i].team.name}"><span class="featured-club-name" data-club-id="${standing[i].team.id}">${standing[i].team.name}</span></a></td>
            <td>${standing[i].playedGames}</td>
            <td>${standing[i].won}</td>
            <td>${standing[i].draw}</td>
            <td>${standing[i].lost}</td>
            <td>${standing[i].goalsFor}</td>
            <td>${standing[i].goalsAgainst}</td>
            <td data-gd="${gdStatus}">${gd}</td>
            <td>${standing[i].points}</td>
         </tr>
         `;
      }
      document.querySelector(container).innerHTML = standingsHTML;
      document.querySelectorAll(".featured-club-name").forEach(elm => {
         $clamp(elm, {clamp: 1});
      });
      colorizeFavoriteClub();
   }

   //--- Get from Cache

   if("caches" in window) {
      caches.match(`${baseURL}competitions/2014/standings`).then(response => {
         if(response) {
            response.json()
               .then(data => {
                  innerResponse(data);
               })
               .catch(() => {
                  document.querySelector(container).innerHTML = 
                  `
                  <tr>
                     <td colspan="10">
                        <div class="center-align">
                           <p class="grey-text">Gagal memuat, coba lagi beberapa saat.</pc>
                        </div>
                     </td>
                  </tr>
                  `;
               });
         }
      });
   }

   //--- Get from Internet

   fetchAPI(`${baseURL}competitions/2014/standings`)
      .then(statusFetch)
      .then(parse)
      .then(data => {
         innerResponse(data);
      })
      .catch(() => {
         checkCacheStatus(`${baseURL}competitions/2014/standings`).then(data => {
            if(data === undefined) {
               document.querySelector(container).innerHTML = 
               `
               <tr>
                  <td colspan="10">
                     <div class="center-align">
                        <p class="grey-text">Gagal memuat, butuh koneksi internet terlebih dahulu.</pc>
                     </div>
                  <td>
               <tr>
               `;
            }
         });
      });
}

export function getScorers(container, limit) {
   //--- Inner Response

   function innerResponse(data) {
      let scorersHTML = "",
          scorer = data.scorers,
          i = 1;

      scorer.forEach(scorer => {
         scorersHTML +=
         `
         <tr>
            <td>${i}</td>
            <td class="left-align"><span class="featured-player-name">${scorer.player.name}</span></td>
            <td class="left-align"><a href="detail-klub.html?id=${scorer.team.id}" title="${scorer.team.name}"><img class="left" data-image-id="${scorer.team.id}" alt="${scorer.team.name}"><span class="featured-club-name" data-club-id="${scorer.team.id}">${scorer.team.name}</span></a></td>
            <td>${scorer.numberOfGoals}</td>
         </tr>
         `;
         i++
         getImageClub(scorer.team.id);
      });
      document.querySelector(container).innerHTML = scorersHTML;
      document.querySelectorAll(".featured-club-name, .featured-player-name").forEach(elm => {
         $clamp(elm, {clamp: 1});
      });
      colorizeFavoriteClub();
   }

   //--- Get from Cache

   if("caches" in window) {
      caches.match(`${baseURL}competitions/2014/scorers?limit=${limit}`).then(response => {
         if(response) {
            response.json()
               .then(data => {
                  innerResponse(data);
               })
               .catch(() => {
                  document.querySelector(container).innerHTML = 
                  `
                  <tr>
                     <td colspan="4">
                        <div class="center-align">
                           <p class="grey-text">Gagal memuat, coba lagi beberapa saat.</pc>
                        </div>
                     </td>
                  </tr>
                  `;
               });
         }
      });
   }

   //--- Get from Internet

   fetchAPI(`${baseURL}competitions/2014/scorers?limit=${limit}`)
      .then(statusFetch)
      .then(parse)
      .then(data => {
         innerResponse(data);
      })
      .catch(() => {
         checkCacheStatus(`${baseURL}competitions/2014/scorers?limit=${limit}`).then(data => {
            if(data === undefined) {
               document.querySelector(container).innerHTML = 
               `
               <tr>
                  <td colspan="4">
                     <div class="center-align">
                        <p class="grey-text">Gagal memuat, butuh koneksi internet terlebih dahulu.</p>
                     </div>
                  </td>
               </tr>
               `;
            }
         });
      });
}

export function getClubs(type) {

   if(type === "all") {
      getAllClubData().then(clubs => {
         if (clubs.length > 0) {
            let clubsHTML = "";
            clubs.forEach(club => {
               const filterURL = club.crestUrl.replace(/^http:\/\//i, "https://");
               clubsHTML +=
               `
               <div class="col s6 m4 l2 club">
                  <a href="detail-klub.html?id=${club.id}" title="${club.name}">
                     <img src="${filterURL}" alt="${club.name}">
                     <span class="center-align club-name">${club.name}</span>
                  </a>
               </div>
               `;
            });
            document.querySelector("#clubs > div").innerHTML = clubsHTML;
            document.querySelectorAll(".club-name").forEach(elm => {
               $clamp(elm, {clamp: 1});
            });
         } else {
            document.querySelector("#clubs > div").innerHTML = 
            `
            <div class="center-align">
               <p class="grey-text">Muat ulang kembali halaman untuk melihat daftar klub.</p>
            </div>
            `;
         }
         
      });
   } else if (type === "favorite") {
      getAllFavoriteClubs().then(clubs => {
         let clubsHTML = "";
         if(clubs.length > 0) {
            clubs.forEach(club => {
               const filterURL = club.crestUrl.replace(/^http:\/\//i, "https://");
               clubsHTML +=
               `
               <div class="col s6 m4 l2 club">
                  <a href="detail-klub.html?id=${club.id}&favorit=true" title="${club.name}">
                     <img src="${filterURL}" alt="${club.name}">
                     <span class="center-align club-name">${club.name}</span>
                  </a>
               </div>
               `;
            });
            document.querySelector("#clubs > div").innerHTML = clubsHTML;
            document.querySelectorAll(".club-name").forEach(elm => {
               $clamp(elm, {clamp: 1});
            });
         } else {
            document.querySelector("#clubs > div").innerHTML =
            `
            <div class="center-align page-notice">
               <i class="material-icons star">star_half</i>
               <p>Belum ada klub yang dijadikan favorit.</p>
            </div>
            `;
         }
      });
   }

}

export function getClubDetails(id, type) {
   
   if (type === "all") {
      //--- Inner Response

      function innerResponse(data) {

         document.querySelector("#mobile-header .club-name").innerHTML = data.name;

         const favContainerHeader = document.querySelector("#favorite-container-header");
         favContainerHeader.innerHTML = `<i class="material-icons favorite-button" data-favorite-club="${data.id}"><span class="favorite-click">star_border</span></i>`;
               
         const filterURL = data.crestUrl.replace(/^http:\/\//i, "https://");

         let detailsHTML =
         `
         <div class="col s12 detail-club">
            <div class="col s12 m4 detail-image">
               <img src="${filterURL}" alt="${data.name}" title="${data.name}">
            </div>
      
            <div class="col s12 m8 detail-info">         
               <h3>${data.name}<span class="favorite-container"><i class="material-icons hide-on-small-only favorite-button" data-favorite-club="${data.id}"><span class="favorite-click" title="Jadikan Favorit">star_border</span></i></span></h3>
               <div class="col s6">
                  <p class="detail-info-title">Didirikan</p>
                  <p>${data.founded}</p>
                  <p class="detail-info-title">Stadion</p>
                  <p>${data.venue}</p>
               </div>
               <div class="col s6">
                  <p class="detail-info-title">Pelatih</p>
                  <p data-type="coach"></p>
                  <p class="detail-info-title">Situs Resmi</p>
                  <p><a href="${data.website}" title="${data.name}" target="_blank" rel="noopener">${data.website}</a></p>
               </div>
            </div>
         </div>

         <div class="col s12 detail-squad">
            <h4>Skuad Klub</h4>
            <div class="detail-squad-table">
               <table>
                  <thead>
                     <tr>
                        <th>Nama Pemain</th>
                        <th>Posisi</th>
                     </tr>
                  </thead>

                  <tbody>
                  </tbody>
               </table>
            </div>
         </div>
         `;

         document.querySelector("#club-details > div").innerHTML = detailsHTML;
         document.querySelectorAll(".detail-info a, #mobile-header .club-name").forEach(elm => {
            $clamp(elm, {clamp: 1});
         });
         starredFavoriteButton();

         const favBtn = document.querySelectorAll(".favorite-button"),
               favClick = document.querySelectorAll(".favorite-click");

         favBtn.forEach(elm => {
            elm.addEventListener("click", () => {
               favBtn.forEach(elms => {
                  elms.innerHTML = `<span>star</span>`
               })               
            })
         })

         favClick.forEach(elm => {
            elm.addEventListener("click", () => {
               saveClubDetails(data.id).then(club => {
                  saveFavorites(club);
               }); 
               let toastHTML = 
               `<span>Klub berhasil disimpan!</span><a href="/#favorit" class="btn-flat toast-action" title="Lihat Favorit">Lihat</a>
               `;
               M.toast({html: toastHTML});
               showFavoriteNotification(data.name);
            });
         });

         let playerHTML = "";

         data.squad.forEach(player => {
            if (player.role === "PLAYER") {
               let position;                     
               switch(player.position) {
                  case "Goalkeeper":
                     position = "Penjaga Gawang";
                     break;
                  case "Defender":
                     position = "Bertahan";
                     break;
                  case "Midfielder":
                     position = "Gelandang";
                     break;
                  case "Attacker":
                     position = "Penyerang";
                     break;
               }
               playerHTML +=
               `
               <tr data-position="${player.position}">
                  <td><span class="number" data-number="${player.shirtNumber}">${player.shirtNumber}</span>${player.name}</td>
                  <td>${position}</td>
               </tr>
               `;
            } else if (player.role === "COACH") {
               document.querySelector("#club-details p[data-type='coach']").innerHTML = player.name;
            }
         });
         document.querySelector("#club-details tbody").innerHTML = playerHTML;

      }

      //--- Get from Cache

      if("caches" in window) {
         caches.match(`${baseURL}teams/${id}`).then(response => {
            if(response) {
               response.json()
                  .then(data => {
                     innerResponse(data);
                  })
                  .catch(() => {
                     document.querySelector("#club-details > div").innerHTML = 
                     `
                     <div class="center-align">
                        <p class="grey-text">Gagal memuat, coba lagi beberapa saat.</p>
                     </div>
                     `;
                  });
            }
         });
      }

      //--- Get from Internet

      fetchAPI(`${baseURL}teams/${id}`)
         .then(statusFetch)
         .then(parse)
         .then(data => {
            innerResponse(data);
         })
         .catch(() => {
            checkCacheStatus(`${baseURL}teams/${id}`).then(data => {
               if(data === undefined) {
                  document.querySelector("#club-details > div").innerHTML = 
                  `
                  <div class="center-align">
                     <p class="grey-text">Gagal memuat, butuh koneksi internet terlebih dahulu.</p>
                  </div>
                  `;
               }
            });
         });
         
   } else if (type === "favorite") {

      getFavoriteClub(id).then(data => {
         
         document.querySelector("#mobile-header .club-name").innerHTML = data.name;

         const favContainerHeader = document.querySelector("#favorite-container-header");
         favContainerHeader.innerHTML = `<i class="material-icons delete-favorite-button"><span class="delete-click">delete</span></i>`;

         const filterURL = data.crestUrl.replace(/^http:\/\//i, "https://");

         let detailsHTML =
         `
         <div class="col s12 detail-club">
            <div class="col s12 m4 detail-image">
               <img src="${filterURL}" alt="${data.name}" title="${data.name}">
            </div>
      
            <div class="col s12 m8 detail-info">
               <h3>${data.name}<span class="favorite-container"><i class="material-icons tooltipped hide-on-small-only delete-favorite-button" data-position="right" data-tooltip="Hapus dari Favorit"><span class="delete-click">delete</span></i></span></h3>
               <div class="col s6">
                  <p class="detail-info-title">Didirikan</p>
                  <p>${data.founded}</p>
                  <p class="detail-info-title">Stadion</p>
                  <p>${data.venue}</p>
               </div>
               <div class="col s6">
                  <p class="detail-info-title">Pelatih</p>
                  <p data-type="coach"></p>
                  <p class="detail-info-title">Situs Resmi</p>
                  <p><a href="${data.website}" title="${data.name}" target="_blank" rel="noopener">${data.website}</a></p>
               </div>
            </div>
         </div>

         <div class="col s12 detail-squad">
            <h4>Skuad Klub</h4>
            <table>
               <thead>
                  <tr>
                     <th>Nama Pemain</th>
                     <th>Posisi</th>
                  </tr>
               </thead>

               <tbody>
               </tbody>
            </table>
         </div>
         `;

         document.querySelector("#club-details > div").innerHTML = detailsHTML;
         document.querySelectorAll(".detail-info a, #mobile-header .club-name").forEach(elm => {
            $clamp(elm, {clamp: 1});
         });

         const tooltip = document.querySelectorAll(".tooltipped");
         M.Tooltip.init(tooltip);

         const deleteBtn = document.querySelectorAll(".delete-favorite-button");

         deleteBtn.forEach(elm => {
            elm.addEventListener("click", () => {
               swal({
                  title: `Hapus ${data.name}`,
                  text: `Yakin ingin menghapus ${data.name} dari klub favorit?`,
                  icon: "warning",
                  buttons: {
                     cancel: {
                        text: "Batal",
                        visible: true,
                        closeModal: true,
                        className: "cancel-delete"
                     },
                     confirm: {
                        text: "Hapus",
                        value: true,
                        closeModal: true,
                        className: "confirm-delete"
                     }
                  },
                  dangerMode: true
               })
                  .then(willDelete => {
                     if(willDelete) {
                        deleteFavoriteClub(data.id);
                        M.toast({html: "Klub berhasil dihapus!"});                        
                        window.location.href = "/#favorit";
                     }
                  });
            });
         });

         let playerHTML = "";

         data.squad.forEach(player => {
            if (player.role === "PLAYER") {
               let position;               
               switch(player.position) {
                  case "Goalkeeper":
                     position = "Penjaga Gawang";
                     break;
                  case "Defender":
                     position = "Bertahan";
                     break;
                  case "Midfielder":
                     position = "Gelandang";
                     break;
                  case "Attacker":
                     position = "Penyerang";
                     break;
               }
               playerHTML +=
               `
               <tr data-position="${player.position}">
                  <td><span class="number" data-number="${player.shirtNumber}">${player.shirtNumber}</span>${player.name}</td>
                  <td>${position}</td>
               </tr>
               `;
            } else if (player.role === "COACH") {
               document.querySelector("#club-details p[data-type='coach']").innerHTML = player.name;
            }
         });
         document.querySelector("#club-details tbody").innerHTML = playerHTML;

      });

   }

}

function saveClubDetails(id) {
   return new Promise((resolve, reject) => {
      //--- Get from Cache

      if("caches" in window) {
         caches.match(`${baseURL}teams/${id}`).then(response => {
            if(response) {
               response.json().then(data => {
                  resolve(data);
               });
            }
         });
      }

      //--- Get from Internet

      fetchAPI(`${baseURL}teams/${id}`)
         .then(parse)
         .then(data => {
            resolve(data);
         });
   });
}

//----- Show Notification when User Add Favorite Club

function showFavoriteNotification(clubName) {
   const options = {
         body: `Kini ${clubName} telah ditambahkan ke klub favorit!`,
         badge: "images/logo.png",
         icon: "images/logo.png",
         image: "images/laliga-players.jpg",
         tag: "favorite-club",
         silent: true
   };
   if (Notification.permission === "granted") {
      navigator.serviceWorker.ready.then(registration => {
         registration.showNotification("Klub Favorit Baru", options);
      });
   }
}