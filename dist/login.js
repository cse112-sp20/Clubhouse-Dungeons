!function(e){var t={};function n(o){if(t[o])return t[o].exports;var r=t[o]={i:o,l:!1,exports:{}};return e[o].call(r.exports,r,r.exports,n),r.l=!0,r.exports}n.m=e,n.c=t,n.d=function(e,t,o){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:o})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var o=Object.create(null);if(n.r(o),Object.defineProperty(o,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var r in e)n.d(o,r,function(t){return e[t]}.bind(null,r));return o},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=1)}([function(e,t,n){"use strict";n.d(t,"c",(function(){return o})),n.d(t,"b",(function(){return r})),n.d(t,"a",(function(){return a}));const o=async()=>(await fetch("https://api.clubhouse.io/api/v3/projects?token="+API_TOKEN,{headers:{"Content-Type":"application/json"}})).json(),r=async e=>(await fetch(`https://api.clubhouse.io/api/v3/projects/${e}/stories?token=${API_TOKEN}`,{headers:{"Content-Type":"application/json"}})).json(),a=async e=>(await fetch("https://api.clubhouse.io/api/v3/member?token="+e,{headers:{"Content-Type":"application/json"}})).json()},function(e,t,n){"use strict";n.r(t);var o=n(0);document.addEventListener("DOMContentLoaded",()=>{document.querySelector("button").addEventListener("click",(function(){var e=document.getElementById("apiEntry").value;console.log(document.getElementById("apiEntry").value),Object(o.a)(e).then(t=>{console.log(t),"Unauthorized"===t.message?alert("Invalid key!"):(localStorage.setItem("api_token",e),localStorage.setItem("member_id",t.id),localStorage.setItem("member_name",t.name),window.location.href="../popup.html")}).catch(e=>{alert("Error"),console.log(e)})}),!1)},!1)}]);