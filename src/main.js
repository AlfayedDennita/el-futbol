import "materialize-css/dist/css/materialize.min.css";
import "./styles/style.css";
import "materialize-css/dist/js/materialize.min.js";
import "./scripts/sw-register.js";
import "./scripts/db.js";
import {getClubData, showCurrentMatchday, showMatchday, getStandings, getScorers, getClubs} from "./scripts/api.js";

document.addEventListener('DOMContentLoaded', function() {

   //----- Save Club Data to Database

   getClubData();

   //----- Load Page

   let page = window.location.hash.substr(1);
   if (page === "") {
      page = "beranda";
   }

   loadPage();
   loadMobileNav();

   function loadPage() {
      const xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
         if(this.readyState === 4) {
            const container = document.querySelector("main");

            if (this.status === 200) {
               container.innerHTML = xhttp.responseText;

               switch(page) {
                  case "beranda":
                     showCurrentMatchday();
                     showMatchday("#home-matchday .matchday-content > div:first-child", "#home-matchday .matchday-content > div:last-child", "current");
                     getStandings("#standings tbody", "home");
                     getScorers("#scorers tbody", 5);
                     document.querySelectorAll(".link-button-home").forEach(elm => {
                        elm.addEventListener("click", () => {
                           //--- Close Bottom Menu List
                           menuList.classList.remove("show");
                           //--- Go to Top
                           document.documentElement.scrollTop = 0;
                           //--- Load Page
                           page = elm.getAttribute("href").substr(1);
                           loadPage();
                           loadMobileNav();
                        });
                     });
                     break;
                  case "klub":
                     getClubs("all");
                     break;
                  case "pertandingan":
                     showCurrentMatchday();
                     showMatchday("#matchday > div:first-of-type .matchday-content > div:first-child", "#matchday > div:first-of-type .matchday-content > div:last-child", "current");
                     showMatchday("#matchday > div:last-of-type .matchday-content > div:first-child", "#matchday > div:last-of-type .matchday-content > div:last-child", "next");
                     break;
                  case "klasemen":
                     getStandings("#standings tbody", "full");
                     break;
                  case "top-skor":
                     getScorers("#scorers tbody", 20);
                     break;
                  case "favorit":
                     getClubs("favorite");
                     break;
               }
   
               //----- Tooltip Init
   
               const tooltip = document.querySelectorAll(".tooltipped");
               M.Tooltip.init(tooltip, {margin: -20});

            } else if (this.status === 404) {
               container.innerHTML =
               `<div class="center-align page-notice">
                  <h4>404</h4>
                  <p>Mohon maaf, halaman yang dituju tidak ada.</p>
               </div>
               `;
            } else {
               container.innerHTML = 
               `<div class="center-align page-notice">
                  <i class="material-icons">sentiment_dissatisfied</i>
                  <p>Mohon maaf, halaman tidak dapat dimuat.</p>
               </div>
               `;
            }

         }
      };
      xhttp.open("GET", `halaman/${page}.html`, true);
      xhttp.send();
   }

   function loadMobileNav() {
      const xhttp = new XMLHttpRequest;
      xhttp.onreadystatechange = function() {
         if(this.readyState === 4 && this.status === 200) {
            const container = document.querySelector("#mobile-header");
            container.innerHTML = xhttp.responseText;

            if(page === "beranda") {
               const sidenav = document.querySelector(".sidenav");
               M.Sidenav.init(sidenav);
               document.querySelectorAll(".link-button-mobile").forEach(elm => {
                  elm.addEventListener("click", () => {
                     //--- Close Sidenav
                     M.Sidenav.getInstance(sidenav).close();
                     //--- Go to Top
                     document.documentElement.scrollTop = 0;
                     //--- Load Page
                     page = elm.getAttribute("href").substr(1);
                     loadPage();
                     loadMobileNav();
                  });
               });
            } else {
               document.querySelectorAll(".link-button-mobile").forEach(elm => {
                  elm.addEventListener("click", () => {
                     //--- Go to Top
                     document.documentElement.scrollTop = 0;
                     //--- Load Page
                     page = elm.getAttribute("href").substr(1);
                     loadPage();
                     loadMobileNav();
                  });
               });
            }
         }
      };
      if(page === "beranda") {
         xhttp.open("GET", "halaman/main-header.html", true);
      } else {
         xhttp.open("GET", "halaman/sec-header.html", true);
      }
      xhttp.send();
   }

   //----- Bottom Menu List Config

   const menuList = document.querySelector("#menu-list"),
         menuListBtnShow = document.querySelector("#show-menu-list"),
         menuListBtnClose = document.querySelector("#close-menu-list");

   menuListBtnShow.addEventListener("click", () => {
      menuList.classList.add("show");
   });

   menuListBtnClose.addEventListener("click", () => {
      menuList.classList.remove("show");
   });

   //--- Link Button

   document.querySelectorAll(".link-button").forEach(elm => {
      elm.addEventListener("click", () => {
         //--- Close Bottom Menu List
         menuList.classList.remove("show");
         //--- Go to Top
         document.documentElement.scrollTop = 0;
         //--- Load Page
         page = elm.getAttribute("href").substr(1);
         loadPage();
         loadMobileNav();
      });
   });

});