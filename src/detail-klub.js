import "materialize-css/dist/css/materialize.min.css";
import "./styles/style.css";
import "materialize-css/dist/js/materialize.min.js";
import "./scripts/sw-register.js";
import "./scripts/db.js";
import {getClubData, getClubDetails} from "./scripts/api.js";

document.addEventListener('DOMContentLoaded', function() {

   //----- Save Club Data to Database

   getClubData();

   //----- Load Club Details

   const urlParams = new URLSearchParams(window.location.search),
         idParam = parseInt(urlParams.get("id")),
         favParam = urlParams.get("favorit");      

   if(idParam && !favParam) {
      getClubDetails(idParam, "all");
   } else if (idParam && favParam) {
      getClubDetails(idParam, "favorite");
   } else {
      document.querySelector("#club-details > div").innerHTML =
      `
      <div class="center-align page-notice">
         <i class="material-icons">error_outline</i>
         <p>Silakan <a class="link-button" href="/#klub" title="Daftar Klub">pilih klub</a> terlebih dahulu untuk melihat detailnya.</p>
      </div>
      `;
   }

   //----- Back Button

   const backButton = document.querySelector("#mobile-header .nav-wrapper a");

   if(favParam) {
      backButton.href = "/#favorit";
   } else {
      backButton.href = "/#klub";
   }

   //----- Tooltip Init

   const tooltip = document.querySelectorAll(".tooltipped");
   M.Tooltip.init(tooltip, {margin: -20});

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

});