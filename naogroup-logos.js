/* ============================================================
   NaoGroup — tous les logos de la maison, en un seul endroit.
   Une page qui charge ce fichier peut afficher n'importe quel jeton :
     <svg viewBox="0 0 40 40"><use href="#l-fi"/></svg>
   Symboles : l-gr (NaoGroup), l-fi, l-bu, l-pl, l-ag, l-as, l-la, l-fa, l-ba, l-we, l-tr, l-do, l-da, l-cv, l-sa, l-pe, l-in, l-st, l-ro.
   Nouvel outil : ajouter ici son dégradé et son symbole (DEFS), puis son entrée
   dans OUTILS (nom, rôle, tons, sens) : la charte l'affiche toute seule, avec sa palette.
   ============================================================ */
(function () {
'use strict';

var DEFS =
'<linearGradient id="ggr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6F55D0"/><stop offset="1" stop-color="#C39BF3"/></linearGradient>' +
'<linearGradient id="gfi" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8E7BD4"/><stop offset="1" stop-color="#B9A8F0"/></linearGradient>' +
'<linearGradient id="gbu" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7B5FD9"/><stop offset="1" stop-color="#B48CF2"/></linearGradient>' +
'<linearGradient id="gpl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7A4FD6"/><stop offset="1" stop-color="#BE9AF4"/></linearGradient>' +
'<linearGradient id="gag" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6A4ED0"/><stop offset="1" stop-color="#C7A6F6"/></linearGradient>' +
'<radialGradient id="gag-lueur"><stop offset="0" stop-color="#fff" stop-opacity=".85"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>' +
'<linearGradient id="gas" x1=".25" y1="0" x2=".75" y2="1"><stop offset="0" stop-color="#1E2266"/><stop offset=".52" stop-color="#5A3FC6"/><stop offset="1" stop-color="#B89CF3"/></linearGradient>' +
'<radialGradient id="gas-lueur"><stop offset="0" stop-color="#fff" stop-opacity=".6"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>' +
'<linearGradient id="gla" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5E4BD4"/><stop offset="1" stop-color="#BBA5F6"/></linearGradient>' +
'<linearGradient id="gfa" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4E36C4"/><stop offset=".55" stop-color="#A488F1"/><stop offset="1" stop-color="#7C8BF0"/></linearGradient>' +
'<radialGradient id="gfa-lueur"><stop offset="0" stop-color="#fff" stop-opacity=".8"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>' +
'<linearGradient id="gba" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5A44CC"/><stop offset=".45" stop-color="#8C7BEA"/><stop offset=".8" stop-color="#C3A6F4"/><stop offset="1" stop-color="#EBC3E0"/></linearGradient>' +
'<radialGradient id="gba-lueur"><stop offset="0" stop-color="#fff" stop-opacity=".8"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>' +
'<linearGradient id="gwe" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6F4FD0"/><stop offset=".6" stop-color="#D98BC0"/><stop offset="1" stop-color="#F0C98A"/></linearGradient>' +
'<radialGradient id="gwe-lueur"><stop offset="0" stop-color="#fff" stop-opacity=".85"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>' +

'<symbol id="l-gr" viewBox="0 0 40 40"><rect width="40" height="40" rx="13" fill="url(#ggr)"/>' +
  '<path d="M12 27V11L28 25V9.5" fill="none" stroke="#fff" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round"/>' +
  '<g fill="#fff" opacity=".6"><circle cx="10.5" cy="31.5" r="1.9"/><circle cx="16.3" cy="33.2" r="1.9"/><circle cx="22.4" cy="33.2" r="1.9"/><circle cx="28.2" cy="31.5" r="1.9"/></g></symbol>' +
'<symbol id="l-fi" viewBox="0 0 40 40"><rect width="40" height="40" rx="13" fill="url(#gfi)"/>' +
  '<path d="M12 29V13.5L28 28V12" fill="none" stroke="#fff" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round"/>' +
  '<path d="M23.4 16.6L28 12l4.6 4.6" fill="none" stroke="#fff" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round" opacity=".55"/></symbol>' +
'<symbol id="l-bu" viewBox="0 0 40 40"><rect width="40" height="40" rx="13" fill="url(#gbu)"/>' +
  '<path d="M12 25.5V11L27 25V10.5" fill="none" stroke="#fff" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round"/>' +
  '<path d="M9.5 30.5H30.5" fill="none" stroke="#fff" stroke-width="2.8" stroke-linecap="round" opacity=".5"/></symbol>' +
'<symbol id="l-pl" viewBox="0 0 40 40"><rect width="40" height="40" rx="13" fill="url(#gpl)"/>' +
  '<path d="M12.5 31V20.5L27.5 31V19.5" fill="none" stroke="#fff" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round"/>' +
  '<path d="M7.5 16.5L20 8.5L32.5 16.5" fill="none" stroke="#fff" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" opacity=".5"/></symbol>' +
'<symbol id="l-ag" viewBox="0 0 40 40"><rect width="40" height="40" rx="13" fill="url(#gag)"/>' +
  '<path d="M9.5 12.8H30.5M14.5 6.6V9.4" fill="none" stroke="#fff" stroke-width="2.8" stroke-linecap="round" opacity=".5"/>' +
  '<circle cx="25.5" cy="8" r="4.6" fill="url(#gag-lueur)" opacity=".7"/>' +
  '<path d="M25.5 4.6Q26 7.5 28.9 8Q26 8.5 25.5 11.4Q25 8.5 22.1 8Q25 7.5 25.5 4.6Z" fill="#fff"/>' +
  '<path d="M12 31.5V18.5L28 31.5V18.5" fill="none" stroke="#fff" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round"/></symbol>' +
'<symbol id="l-as" viewBox="0 0 40 40"><rect width="40" height="40" rx="13" fill="url(#gas)"/>' +
  '<circle cx="27.4" cy="10.2" r="8" fill="url(#gas-lueur)" opacity=".55"/>' +
  '<path d="M27.88 5.02A5.2 5.2 0 1 1 22.57 12.11A4.5 4.5 0 0 0 27.88 5.02Z" fill="#fff"/>' +
  '<path d="M11.2 6.7Q11.63 9.17 14.1 9.6Q11.63 10.03 11.2 12.5Q10.77 10.03 8.3 9.6Q10.77 9.17 11.2 6.7Z" fill="#fff"/>' +
  '<path d="M17.2 3.8Q17.47 5.33 19 5.6Q17.47 5.87 17.2 7.4Q16.93 5.87 15.4 5.6Q16.93 5.33 17.2 3.8Z" fill="#fff" opacity=".75"/>' +
  '<path d="M18.3 11.8Q18.51 12.99 19.7 13.2Q18.51 13.41 18.3 14.6Q18.09 13.41 16.9 13.2Q18.09 12.99 18.3 11.8Z" fill="#fff" opacity=".6"/>' +
  '<path d="M12 31.5V19L28 31.5V19" fill="none" stroke="#fff" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round"/></symbol>' +
'<symbol id="l-la" viewBox="0 0 40 40"><rect width="40" height="40" rx="13" fill="url(#gla)"/>' +
  '<path d="M10.5 13.2C13 9.6 16.2 9.6 19.6 12.2S26.4 14.8 29.5 11" fill="none" stroke="#fff" stroke-width="2.8" stroke-linecap="round" opacity=".5"/>' +
  '<path d="M12 31.5V18.5L28 31.5V18.5" fill="none" stroke="#fff" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round"/></symbol>' +
'<symbol id="l-fa" viewBox="0 0 40 40"><rect width="40" height="40" rx="13" fill="url(#gfa)"/>' +
  '<circle cx="26.6" cy="11.4" r="6.2" fill="url(#gfa-lueur)" opacity=".55"/>' +
  '<path d="M9.5 11.8H19" fill="none" stroke="#fff" stroke-width="2.8" stroke-linecap="round" opacity=".5"/>' +
  '<path d="M23.2 11.4L26 14.2L31 8.6" fill="none" stroke="#fff" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>' +
  '<path d="M12 31.5V18.5L28 31.5V18.5" fill="none" stroke="#fff" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round"/></symbol>' +
'<symbol id="l-ba" viewBox="0 0 40 40"><rect width="40" height="40" rx="13" fill="url(#gba)"/>' +
  '<circle cx="20" cy="7.4" r="6.4" fill="url(#gba-lueur)" opacity=".5"/>' +
  '<path d="M11 6.8A9 6.8 0 0 0 29 6.8A9 3.6 0 0 1 11 6.8Z" fill="#fff" opacity=".55"/>' +
  '<path d="M20 3.5Q20.43 5.97 22.9 6.4Q20.43 6.83 20 9.3Q19.57 6.83 17.1 6.4Q19.57 5.97 20 3.5Z" fill="#fff"/>' +
  '<path d="M12 31.5V18.5L28 31.5V18.5" fill="none" stroke="#fff" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round"/></symbol>' +
'<symbol id="l-we" viewBox="0 0 40 40"><rect width="40" height="40" rx="13" fill="url(#gwe)"/>' +
  '<circle cx="28.6" cy="5.6" r="4.4" fill="url(#gwe-lueur)" opacity=".7"/>' +
  '<circle cx="17" cy="10.5" r="4.3" fill="none" stroke="#fff" stroke-width="2.2" opacity=".62"/>' +
  '<circle cx="23" cy="10.5" r="4.3" fill="none" stroke="#fff" stroke-width="2.2" opacity=".62"/>' +
  '<path d="M28.6 2.6Q29 5.2 31.6 5.6Q29 6 28.6 8.6Q28.2 6 25.6 5.6Q28.2 5.2 28.6 2.6Z" fill="#fff"/>' +
  '<path d="M12 31.5V19L28 31.5V19" fill="none" stroke="#fff" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round"/></symbol>' +
'<linearGradient id="gtr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5B45CF"/><stop offset=".55" stop-color="#9A86EE"/><stop offset="1" stop-color="#C9B2F7"/></linearGradient>' +
'<radialGradient id="gtr-lueur"><stop offset="0" stop-color="#fff" stop-opacity=".85"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>' +
'<symbol id="l-tr" viewBox="0 0 40 40"><rect width="40" height="40" rx="13" fill="url(#gtr)"/>' +
  '<circle cx="30.6" cy="7.4" r="5.2" fill="url(#gtr-lueur)" opacity=".6"/>' +
  '<rect x="8" y="8.4" width="8.4" height="6.4" rx="1.7" fill="#fff" opacity=".93"/>' +
  '<path d="M10.7 8.4V7.2Q10.7 6.1 11.8 6.1H12.6Q13.7 6.1 13.7 7.2V8.4" fill="none" stroke="#fff" stroke-width="1.3" stroke-linecap="round" opacity=".93"/>' +
  '<path d="M10.6 9.5V13.7M13.8 9.5V13.7" stroke="#7C66DD" stroke-width=".9" stroke-linecap="round" opacity=".6"/>' +
  '<path d="M18.4 11.4Q23.2 4.4 28.2 7.1" fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-dasharray=".1 2.5" opacity=".8"/>' +
  '<path d="M28.4 4.4L33.8 7.6L28.5 10.2L29.7 7.5Z" fill="#fff" transform="rotate(14 30.6 7.4)"/>' +
  '<path d="M12 31.5V19L28 31.5V19" fill="none" stroke="#fff" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round"/></symbol>' +
'<linearGradient id="gdo" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5F48D2"/><stop offset=".55" stop-color="#9580EC"/><stop offset="1" stop-color="#CDB6F7"/></linearGradient>' +
'<radialGradient id="gdo-lueur"><stop offset="0" stop-color="#fff" stop-opacity=".85"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>' +
'<symbol id="l-do" viewBox="0 0 40 40"><rect width="40" height="40" rx="13" fill="url(#gdo)"/>' +
  '<circle cx="25" cy="8.6" r="7.4" fill="url(#gdo-lueur)" opacity=".5"/>' +
  '<rect x="12.6" y="5.2" width="9.6" height="11.4" rx="1.5" fill="#fff" opacity=".45" transform="rotate(-11 17.4 10.9)"/>' +
  '<path d="M18.9 3.6H24.2L27.6 7V14.3Q27.6 15.8 26.1 15.8H18.9Q17.4 15.8 17.4 14.3V5.1Q17.4 3.6 18.9 3.6Z" fill="#fff"/>' +
  '<path d="M24.2 3.6V5.9Q24.2 7 25.3 7H27.6Z" fill="#B9A6F4"/>' +
  '<path d="M19.9 10.2H25.1M19.9 12.9H23.3" fill="none" stroke="#7C66DD" stroke-width="1.1" stroke-linecap="round" opacity=".6"/>' +
  '<path d="M12 31.5V19L28 31.5V19" fill="none" stroke="#fff" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round"/></symbol>' +
'<linearGradient id="gda" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4F37C9"/><stop offset=".5" stop-color="#6F7FEF"/><stop offset="1" stop-color="#C7B1F7"/></linearGradient>' +
'<radialGradient id="gda-lueur"><stop offset="0" stop-color="#fff" stop-opacity=".85"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>' +
'<symbol id="l-da" viewBox="0 0 40 40"><rect width="40" height="40" rx="13" fill="url(#gda)"/>' +
  '<circle cx="27.5" cy="9.5" r="7" fill="url(#gda-lueur)" opacity=".5"/>' +
  '<g fill="#fff" opacity=".55"><circle cx="9.8" cy="9.5" r="1.7"/><circle cx="14.2" cy="9.5" r="1.7"/><circle cx="18.6" cy="9.5" r="1.7"/></g>' +
  '<circle cx="27.5" cy="9.5" r="4.6" fill="none" stroke="#fff" stroke-width="2.2" opacity=".35"/>' +
  '<path d="M27.5 4.9A4.6 4.6 0 1 1 22.9 9.5" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/>' +
  '<path d="M12 31.5V19L28 31.5V19" fill="none" stroke="#fff" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round"/></symbol>' +
'<linearGradient id="gcv" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4A3DC4"/><stop offset=".55" stop-color="#7C7BE8"/><stop offset="1" stop-color="#9FD0F2"/></linearGradient>' +
'<radialGradient id="gcv-lueur"><stop offset="0" stop-color="#fff" stop-opacity=".85"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>' +
'<symbol id="l-cv" viewBox="0 0 40 40"><rect width="40" height="40" rx="13" fill="url(#gcv)"/>' +
  '<circle cx="29" cy="9.6" r="5.6" fill="url(#gcv-lueur)" opacity=".6"/>' +
  '<rect x="7.4" y="5.4" width="13.4" height="8.8" rx="2.1" fill="#fff" opacity=".94"/>' +
  '<circle cx="11.3" cy="9.8" r="2.1" fill="#6A62DA" opacity=".72"/>' +
  '<path d="M14.6 8.5H18.4M14.6 11.2H17" stroke="#6A62DA" stroke-width="1.05" stroke-linecap="round" opacity=".6"/>' +
  '<path d="M29 5.2Q29.5 9.1 33.4 9.6Q29.5 10.1 29 14Q28.5 10.1 24.6 9.6Q28.5 9.1 29 5.2Z" fill="#fff"/>' +
  '<path d="M12 31.5V19L28 31.5V19" fill="none" stroke="#fff" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round"/></symbol>' +
'<linearGradient id="gsa" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4B36C6"/><stop offset=".55" stop-color="#9A84EE"/><stop offset="1" stop-color="#A9D6F6"/></linearGradient>' +
'<radialGradient id="gsa-lueur"><stop offset="0" stop-color="#fff" stop-opacity=".85"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>' +
'<symbol id="l-sa" viewBox="0 0 40 40"><rect width="40" height="40" rx="13" fill="url(#gsa)"/>' +
  '<circle cx="27.4" cy="10.4" r="7.2" fill="url(#gsa-lueur)" opacity=".55"/>' +
  '<path d="M7.6 10.6H11.6L13.4 7L15.9 14.4L17.8 10.6H20.2" fill="none" stroke="#fff" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" opacity=".55"/>' +
  '<path d="M27.4 14.8C23.9 12.5 22.6 10.7 22.6 8.9A2.4 2.4 0 0 1 27.4 7.7A2.4 2.4 0 0 1 32.2 8.9C32.2 10.7 30.9 12.5 27.4 14.8Z" fill="#fff"/>' +
  '<path d="M12 31.5V19L28 31.5V19" fill="none" stroke="#fff" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round"/></symbol>' +
'<linearGradient id="gpe" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5B42CE"/><stop offset=".5" stop-color="#7F84F0"/><stop offset="1" stop-color="#C6ACF6"/></linearGradient>' +
'<radialGradient id="gpe-lueur"><stop offset="0" stop-color="#EDE4FF" stop-opacity=".9"/><stop offset="1" stop-color="#EDE4FF" stop-opacity="0"/></radialGradient>' +
'<symbol id="l-pe" viewBox="0 0 40 40"><rect width="40" height="40" rx="13" fill="url(#gpe)"/>' +
  '<circle cx="20" cy="9.4" r="8" fill="url(#gpe-lueur)" opacity=".5"/>' +
  '<g fill="#fff"><ellipse cx="20" cy="12.2" rx="4.3" ry="3.3"/><circle cx="13.7" cy="8.4" r="1.95"/><circle cx="17.7" cy="5.3" r="1.95"/><circle cx="22.3" cy="5.3" r="1.95"/><circle cx="26.3" cy="8.4" r="1.95"/></g>' +
  '<path d="M12 31.5V19.5L28 31.5V19.5" fill="none" stroke="#fff" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round"/></symbol>' +
'<linearGradient id="gin" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3F2CB9"/><stop offset=".5" stop-color="#6C78EE"/><stop offset="1" stop-color="#CDB3F8"/></linearGradient>' +
'<radialGradient id="gin-lueur"><stop offset="0" stop-color="#EFE6FF" stop-opacity=".95"/><stop offset="1" stop-color="#EFE6FF" stop-opacity="0"/></radialGradient>' +
'<symbol id="l-in" viewBox="0 0 40 40"><rect width="40" height="40" rx="13" fill="url(#gin)"/>' +
  '<circle cx="26.4" cy="8.6" r="8" fill="url(#gin-lueur)" opacity=".6"/>' +
  '<g fill="#fff" opacity=".55"><rect x="8" y="12.2" width="2.8" height="3.8" rx="1.1"/><rect x="12.4" y="10" width="2.8" height="6" rx="1.1"/><rect x="16.8" y="7.8" width="2.8" height="8.2" rx="1.1"/></g>' +
  '<path d="M26.4 3.4Q26.9 8 31.4 8.6Q26.9 9.2 26.4 13.8Q25.9 9.2 21.4 8.6Q25.9 8 26.4 3.4Z" fill="#fff"/>' +
  '<circle cx="33.2" cy="4.4" r="1" fill="#fff" opacity=".75"/>' +
  '<path d="M12 31.5V19.5L28 31.5V19.5" fill="none" stroke="#fff" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round"/></symbol>' +
'<linearGradient id="gst" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4B34C8"/><stop offset=".5" stop-color="#7A7CF0"/><stop offset="1" stop-color="#CDB4F8"/></linearGradient>' +
'<radialGradient id="gst-lueur"><stop offset="0" stop-color="#EFE6FF" stop-opacity=".95"/><stop offset="1" stop-color="#EFE6FF" stop-opacity="0"/></radialGradient>' +
'<symbol id="l-st" viewBox="0 0 40 40"><rect width="40" height="40" rx="13" fill="url(#gst)"/>' +
  '<circle cx="20" cy="9.6" r="9.4" fill="url(#gst-lueur)" opacity=".55"/>' +
  '<path d="M20 8.1C17.6 6.5 14.7 6 11.8 6.4V14.4C14.7 14 17.6 14.5 20 16.1Z" fill="#fff"/>' +
  '<path d="M20 8.1C22.4 6.5 25.3 6 28.2 6.4V14.4C25.3 14 22.4 14.5 20 16.1Z" fill="#fff" opacity=".78"/>' +
  '<path d="M14 9.4Q16.4 9.3 18.2 10.3" fill="none" stroke="#A89BF2" stroke-width=".8" stroke-linecap="round"/>' +
  '<path d="M20 8.1V16.1" stroke="#8A7CEE" stroke-width=".9" stroke-linecap="round"/>' +
  '<path d="M20 1.4Q20.3 3.3 22 3.6Q20.3 3.9 20 5.8Q19.7 3.9 18 3.6Q19.7 3.3 20 1.4Z" fill="#fff"/>' +
  '<circle cx="31.6" cy="6.2" r="1.05" fill="#fff" opacity=".8"/>' +
  '<path d="M12 31.5V19.5L28 31.5V19.5" fill="none" stroke="#fff" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round"/></symbol>' +
'<linearGradient id="gro" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4B2FB8"/><stop offset=".52" stop-color="#7A70EC"/><stop offset="1" stop-color="#D4BEFA"/></linearGradient>' +
'<radialGradient id="gro-lueur"><stop offset="0" stop-color="#F1E8FF" stop-opacity=".95"/><stop offset="1" stop-color="#F1E8FF" stop-opacity="0"/></radialGradient>' +
'<symbol id="l-ro" viewBox="0 0 40 40"><rect width="40" height="40" rx="13" fill="url(#gro)"/>' +
  '<circle cx="20" cy="9.6" r="9" fill="url(#gro-lueur)" opacity=".55"/>' +
  '<path d="M20 16.4Q17.9 16.6 16.4 17.8M20 16.4Q22.1 16.6 23.6 17.8" fill="none" stroke="#fff" stroke-width="1.15" stroke-linecap="round" opacity=".6"/>' +
  '<path d="M20 16.4V9.6M20 12.6L15.6 9.2M20 11.2L24.4 8" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>' +
  '<circle cx="15.1" cy="8.7" r="1.9" fill="#fff"/>' +
  '<circle cx="24.9" cy="7.5" r="1.9" fill="#fff"/>' +
  '<path d="M20 3.6C21.9 5.2 22 7.6 20 9.4C18 7.6 18.1 5.2 20 3.6Z" fill="#fff"/>' +
  '<path d="M20 5.2V8.4" stroke="#8A7CEE" stroke-width=".7" stroke-linecap="round"/>' +
  '<circle cx="31.4" cy="6.4" r="1.1" fill="#fff" opacity=".8"/>' +
  '<path d="M12 31.5V19.5L28 31.5V19.5" fill="none" stroke="#fff" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round"/></symbol>';

/* Le registre des logos : la charte s'écrit toute seule à partir d'ici.
   Un outil = une entrée (le symbole ci-dessus, ses tons, et son sens). */
var OUTILS = [
  { id: 'l-fi', nom: 'NaoFi', role: 'Analyse de dossier de crédit', de: '#8E7BD4', a: '#B9A8F0',
    accent: "Le N complet, et sa dernière branche <b>s'échappe vers le haut en flèche</b>.",
    sens: "la lettre et la progression dans un seul tracé. La flèche monte parce qu'un crédit, c'est un projet qui avance : une capacité qu'on calcule, un dossier qu'on fait aboutir. Elle est en blanc à demi-transparent pour rester <b>un accent</b>." },
  { id: 'l-bu', nom: 'NaoBudget', role: 'Budget mensuel et annuel', de: '#7B5FD9', a: '#B48CF2',
    accent: "Le même N, remonté, et <b>posé sur une ligne de base</b> qui traverse le jeton.",
    sens: "cette ligne, c'est l'<b>axe d'un graphique</b> — et le sol sur lequel un budget tient debout. Là où NaoFi s'envole, NaoBudget se pose : on ne projette pas, on constate, mois après mois. Les deux pics du N se lisent comme deux barres d'un histogramme." },
  { id: 'l-pl', nom: 'NaoPlan', role: 'Plans de projet immobilier', de: '#7A4FD6', a: '#BE9AF4',
    accent: "Le N descendu dans le bas du jeton, et <b>un toit posé au-dessus</b> : deux pentes qui se rejoignent en une pointe.",
    sens: "ici l'accent <b>abrite</b> le N au lieu de le prolonger. C'est tout le propos de l'outil : ce qu'on dessine, c'est ce qui vient se mettre autour de la vie de quelqu'un. Le toit est le signe le plus court pour dire « logement »." },
  { id: 'l-ag', nom: 'NaoAgenda', role: 'Rendez-vous, tâches et anniversaires', de: '#6A4ED0', a: '#C7A6F6',
    accent: "Le N descendu, et au-dessus <b>l'en-tête d'un calendrier</b> — un trait et une petite patte — avec <b>une étoile</b> posée sur la date.",
    sens: "dans un agenda, une case compte plus que les autres. L'étoile dit « celle-là, ne l'oublie pas » : un rendez-vous, une échéance, un anniversaire. Le calendrier reste à demi transparent ; seule l'étoile est en blanc plein." },
  { id: 'l-as', nom: 'NaoAstro', role: 'Thème natal, horoscope, carte du jour', de: '#1E2266', m: '#5A3FC6', a: '#B89CF3',
    accent: "Le N sous <b>un ciel de nuit</b> : un croissant de lune et trois étoiles fines, sur un dégradé qui part d'un indigo profond.",
    sens: "le seul jeton qui commence dans le sombre — on regarde le ciel. Le croissant est l'accent principal ; les trois étoiles, d'opacités décroissantes, donnent de la profondeur sans devenir une illustration, et un halo doux fait briller la lune." },
  { id: 'l-la', nom: 'NaoLang', role: 'Apprentissage des langues', de: '#5E4BD4', a: '#BBA5F6',
    accent: "Le N coiffé d'<b>un tilde</b> : Ñ.",
    sens: "l'accent de l'outil est… un accent. Le tilde ondule comme une voix ; il évoque la langue qu'on parle autant que celle qu'on écrit, et un N surmonté d'un tilde est déjà une lettre venue d'une autre langue." },
  { id: 'l-fa', nom: 'NaoFactu', role: 'Devis, factures, paiements', de: '#4E36C4', m: '#A488F1', a: '#7C8BF0',
    accent: "Au-dessus du N, <b>une ligne de facture qui se termine par une coche</b>.",
    sens: "« la ligne est réglée ». Le trait à demi transparent est la ligne de la facture, la coche en blanc plein dit qu'elle est payée : tout l'outil tient dans ce geste, de la facture émise à l'argent encaissé. Un léger halo derrière la coche attire l'œil." },
  { id: 'l-ba', nom: 'NaoBaby', role: 'Grossesse, naissance et souvenirs', de: '#5A44CC', m: '#8C7BEA', a: '#EBC3E0',
    accent: "Au-dessus du N, <b>un croissant de lune couché qui berce une petite étoile</b>.",
    sens: "le berceau et l'enfant qui arrive. Le dégradé passe par une touche bleu-violet et s'éteint sur un rose poudré à peine visible : c'est la teinte de la famille qui tire le plus vers la douceur." },
  { id: 'l-we', nom: 'NaoWedding', role: 'Organisation du mariage', de: '#6F4FD0', m: '#D98BC0', a: '#F0C98A',
    accent: "Au-dessus du N, <b>deux alliances entrelacées</b> et un éclat de diamant.",
    sens: "deux anneaux qui se croisent, un éclat — rien de plus. Le dégradé part du violet de la maison et se réchauffe en rose poudré puis en or champagne : c'est le seul jeton à finir sur de l'or." },
  { id: 'l-tr', nom: 'NaoTrip', role: 'Voyages, sorties et réservations', de: '#5B45CF', m: '#9A86EE', a: '#C9B2F7',
    accent: "Au-dessus du N, <b>une petite valise</b> d'où part un trajet en pointillés qui s'envole en <b>avion de papier</b>.",
    sens: "le voyage commence dans la valise et se termine à l'autre bout du monde. Le pointillé est un trajet qu'on trace avant de le vivre ; l'avion de papier, en blanc plein, dit la légèreté d'un départ. Le dégradé s'éclaircit vers la fin, comme un ciel au matin." },
  { id: 'l-do', nom: 'NaoDoc', role: 'Classeur de documents de la famille', de: '#5F48D2', m: '#9580EC', a: '#CDB6F7',
    accent: "Au-dessus du N, <b>deux feuilles</b> : l'une posée de biais, à demi transparente, l'autre en blanc plein, <b>le coin corné</b> et deux lignes de texte.",
    sens: "un document qu'on range sur un autre — le geste même du classement. La feuille du dessous rappelle qu'on ne garde jamais un papier seul : il a sa place dans une pile, un dossier, un classeur. Le coin corné dit le papier qu'on a déjà consulté ; le dégradé s'éclaircit vers la lavande, comme une page qu'on tourne." },
  { id: 'l-da', nom: 'NaoDaily', role: 'Listes, menus & courses, cadeaux', de: '#4F37C9', m: '#6F7FEF', a: '#C7B1F7',
    accent: "Au-dessus du N, <b>trois points bien rangés</b> et <b>un cercle de planning</b> parcouru aux trois quarts.",
    sens: "les trois points sont les trois espaces du quotidien — les listes, les repas, les cadeaux — alignés sans effort. Le cercle, c'est la journée qui avance tranquillement : ni fourchette, ni paquet, seulement le rythme des choses bien tenues. Le dégradé passe du violet profond à un vrai bleu-violet, puis s'adoucit en lavande." },
  { id: 'l-cv', nom: 'NaoCV', role: 'CV, lettres de motivation et candidatures', de: '#4A3DC4', m: '#7C7BE8', a: '#9FD0F2',
    accent: "Au-dessus du N, <b>une carte de profil</b> — une photo, deux lignes — et, à côté, <b>un éclat</b> qui brille.",
    sens: "« votre parcours mérite d'être remarqué ». La carte est la personne telle qu'elle se présente ; l'éclat, en blanc plein, c'est le moment où un recruteur s'arrête sur elle. Le dégradé quitte le violet de la maison pour finir en bleu ciel, la couleur du bureau et des matins d'entretien." },
  { id: 'l-sa', nom: 'NaoSanté', role: 'Bien-être, habitudes et rendez-vous de santé', de: '#4B36C6', m: '#9A84EE', a: '#A9D6F6',
    accent: "Au-dessus du N, <b>une ligne de pulsation</b> qui court vers <b>un petit cœur</b> blanc, posé dans une lueur douce.",
    sens: "le rythme — celui du cœur, et celui des journées dont on prend soin. La pulsation reste à demi transparente, le cœur est en blanc plein : c'est lui qui compte. Le dégradé part du violet profond, passe par la lavande et s'éclaire d'une touche de bleu clair, comme un verre d'eau au soleil : rassurant, jamais froid ni médical." },
  { id: 'l-pe', nom: 'NaoPets', role: 'Animaux de compagnie : soins, repas, budget et souvenirs', de: '#5B42CE', m: '#7F84F0', a: '#C6ACF6',
    accent: "Au-dessus du N, <b>une petite empreinte de patte</b> — un coussinet et quatre doigts — sur une lueur lavande.",
    sens: "la trace qu'un compagnon laisse dans la maison, et dans la vie de ceux qui s'en occupent. Rien d'un dessin d'animal : un ovale et quatre points, lisibles jusqu'à 16 px, pour le chien comme pour le chat, le lapin ou le cheval. Le dégradé part du violet profond, passe par un bleu-violet et s'adoucit en lavande — la nuit calme où tout le monde dort bien." },
  { id: 'l-in', nom: 'NaoInvest', role: 'Éducation financière : budget, épargne, impôts, Bourse et anti-arnaques', de: '#3F2CB9', m: '#6C78EE', a: '#CDB3F8',
    accent: "Au-dessus du N, <b>trois petites barres qui montent doucement</b> à demi transparentes, et <b>une étoile</b> blanche qui s'élève dans une lueur lavande.",
    sens: "comprendre, puis avancer. Les barres sont un graphique discret — la progression pas à pas, jamais une flèche qui presse ; l'étoile, c'est la notion qui s'éclaire, le déclic. Rien qui promette un gain : seulement l'apprentissage. Le dégradé part du violet profond, passe par un bleu-violet calme et s'adoucit en lavande : la prudence, la clarté, puis l'autonomie." },
  { id: 'l-st', nom: 'NaoStudy', role: 'Emplois du temps, devoirs, révisions et orientation de la famille', de: '#4B34C8', m: '#7A7CF0', a: '#CDB4F8',
    accent: "Au-dessus du N, <b>un livre ouvert</b> — une page en blanc plein, l'autre à demi transparente, la reliure lavande — et <b>une petite étoile de connaissance</b> qui s'en élève.",
    sens: "apprendre, s'organiser, avancer. Le livre est le geste le plus simple de l'étude, à tout âge ; l'étoile, c'est la notion comprise, la curiosité qui s'allume. Ni cahier d'écolier ni toque trop sérieuse : un symbole calme, lisible jusqu'à 16 px. Le dégradé part du violet profond, passe par un bleu-violet studieux et s'adoucit en lavande : la concentration, puis la progression." },
  { id: 'l-ro', nom: 'NaoRoots', role: 'Arbre familial, souvenirs, photos et histoires de génération en génération', de: '#4B2FB8', m: '#7A70EC', a: '#D4BEFA',
    accent: "Au-dessus du N, <b>un petit arbre de famille</b> : un tronc fin qui part de <b>deux racines</b> à demi transparentes, <b>deux branches</b> qui portent chacune un point — une génération — et <b>une feuille</b> qui monte, veinée de lavande.",
    sens: "retrouver nos racines, transmettre nos histoires. Les racines disent d'où l'on vient, les deux branches les deux lignées qui se rejoignent, la feuille ce qui pousse encore. Pas de vieux chêne noueux ni de parchemin : un tracé sobre, lisible jusqu'à 16 px. Le dégradé part du violet profond, passe par un bleu-violet et s'adoucit en lavande très claire : la mémoire, les liens, puis la transmission." }
];

function injecter() {
  if (document.getElementById('l-gr')) return;
  var s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  s.setAttribute('width', '0'); s.setAttribute('height', '0'); s.setAttribute('aria-hidden', 'true');
  s.style.position = 'absolute';
  s.innerHTML = '<defs>' + DEFS + '</defs>';
  (document.body || document.documentElement).insertBefore(s, (document.body || document.documentElement).firstChild);
}
window.NaoLogos = { injecter: injecter, outils: OUTILS };
if (document.body) injecter(); else document.addEventListener('DOMContentLoaded', injecter);
})();
