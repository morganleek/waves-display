!function(){"use strict";var e,t={4840:function(){var e=window.wp.blocks,t=window.React,n=window.wp.i18n,r=window.wp.blockEditor,o=window.wp.components,a=window.wp.element,i=JSON.parse('{"u2":"waves/display"}');(0,e.registerBlockType)(i.u2,{edit:function({attributes:e,setAttributes:i,isSelected:l}){const{buoys:s,darkMode:c}=e,[u,d]=(0,a.useState)([]);return(0,a.useEffect)((()=>{wp.apiFetch({path:"waves-display/v1/buoys"}).then((e=>{d(JSON.parse(e))}))})),(0,t.createElement)("div",{...(0,r.useBlockProps)()},(0,t.createElement)(r.InspectorControls,null,(0,t.createElement)(o.PanelBody,{title:(0,n.__)("Appearance")},(0,t.createElement)(o.ToggleControl,{checked:c,onChange:e=>i({darkMode:e}),label:"Enable dark mode"})),(0,t.createElement)(o.PanelBody,{title:(0,n.__)("Restrict Buoys")},u.length>0?(0,t.createElement)(o.FormTokenField,{label:"Add buoy",value:u.filter((e=>s.includes(e.id))).map((e=>e.label)),suggestions:u.map((e=>e.label)),onChange:e=>{const t=u.filter((t=>e.includes(t.label))).map((e=>e.id));i({buoys:t})}}):void 0)),(0,t.createElement)("div",{class:"maps"}),(0,t.createElement)("div",{class:"charts"}))},save:function({attributes:e}){const{buoys:n,darkMode:o}=e,a=o?"theme-dark":"theme-light";return(0,t.createElement)("div",{"data-theme":a,...r.useBlockProps.save(),"data-buoys":n.join(",")})}})}},n={};function r(e){var o=n[e];if(void 0!==o)return o.exports;var a=n[e]={exports:{}};return t[e](a,a.exports,r),a.exports}r.m=t,e=[],r.O=function(t,n,o,a){if(!n){var i=1/0;for(u=0;u<e.length;u++){n=e[u][0],o=e[u][1],a=e[u][2];for(var l=!0,s=0;s<n.length;s++)(!1&a||i>=a)&&Object.keys(r.O).every((function(e){return r.O[e](n[s])}))?n.splice(s--,1):(l=!1,a<i&&(i=a));if(l){e.splice(u--,1);var c=o();void 0!==c&&(t=c)}}return t}a=a||0;for(var u=e.length;u>0&&e[u-1][2]>a;u--)e[u]=e[u-1];e[u]=[n,o,a]},r.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},function(){var e={826:0,431:0};r.O.j=function(t){return 0===e[t]};var t=function(t,n){var o,a,i=n[0],l=n[1],s=n[2],c=0;if(i.some((function(t){return 0!==e[t]}))){for(o in l)r.o(l,o)&&(r.m[o]=l[o]);if(s)var u=s(r)}for(t&&t(n);c<i.length;c++)a=i[c],r.o(e,a)&&e[a]&&e[a][0](),e[a]=0;return r.O(u)},n=self.webpackChunkwaves_display=self.webpackChunkwaves_display||[];n.forEach(t.bind(null,0)),n.push=t.bind(null,n.push.bind(n))}();var o=r.O(void 0,[431],(function(){return r(4840)}));o=r.O(o)}();