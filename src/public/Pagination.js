// Filename: public/Pagination.js 
//
// Code written in public files is shared by your site's
// Backend, page code, and site code environments.
//
// Use public files to hold utility functions that can 
// be called from multiple locations in your site's code.

import {session} from 'wix-storage';
import wixLocation from 'wix-location';

// Construct the paginationKey.
let urlPath = "";
for (let i = 0; i < wixLocation.path.length; i++) {
    if (wixLocation.path[i] != "")
        urlPath = urlPath + "/" + wixLocation.path[i];
}

//console.log (wixLocation.url);

export let paginationKey = ((typeof(wixLocation.prefix) != "undefined" && wixLocation.prefix != "") ? "/" + wixLocation.prefix : "") + 
    urlPath + 
    wixLocation.url.substr(wixLocation.url.indexOf("?")) + 
    "_paginationIndex";

//console.log (urlPath);
console.log("Pagination Key: " + paginationKey);

export function setPaginationIndexFromSave() {
    let savedPage = session.getItem(paginationKey);
    if (savedPage && parseInt(savedPage) > 0)
    {
        let savedPageInt = parseInt(savedPage);
        console.log("Saved page is ", savedPageInt, "; type is " + typeof(savedPageInt));

        $w("#dynamicDataset").onReady(() => {
            if ($w("#pagination1").currentPage != savedPageInt || $w("#dynamicDataset").getCurrentPageIndex() != savedPageInt) {
                $w("#pagination1").currentPage = savedPageInt;
                
                $w("#dynamicDataset").loadPage(savedPageInt)
                .then(function() { console.log("Pagination page set to " + $w("#pagination1").currentPage); })
                .catch((error) => { console.error("Error", error, " occurred when setting pagination index to ", savedPageInt)});
            }
        });        
    }
    else
    {
        $w("#dynamicDataset").onReady(() => {
            if ($w("#pagination1").currentPage != 1 || $w("#dynamicDataset").getCurrentPageIndex() != 1) {
                $w("#pagination1").currentPage = 1;
                $w("#dynamicDataset").loadPage(1)
                    .then(function() { console.log("Pagination page set to " + $w("#pagination1").currentPage); })
                    .catch((error) => { console.error("Error", error, " occurred when setting pagination index to 1")});
            }
        });
    }
}