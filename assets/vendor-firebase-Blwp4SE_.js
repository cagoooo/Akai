/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const nm=()=>{};var Zu={};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Nl=function(r){const t=[];let e=0;for(let n=0;n<r.length;n++){let s=r.charCodeAt(n);s<128?t[e++]=s:s<2048?(t[e++]=s>>6|192,t[e++]=s&63|128):(s&64512)===55296&&n+1<r.length&&(r.charCodeAt(n+1)&64512)===56320?(s=65536+((s&1023)<<10)+(r.charCodeAt(++n)&1023),t[e++]=s>>18|240,t[e++]=s>>12&63|128,t[e++]=s>>6&63|128,t[e++]=s&63|128):(t[e++]=s>>12|224,t[e++]=s>>6&63|128,t[e++]=s&63|128)}return t},rm=function(r){const t=[];let e=0,n=0;for(;e<r.length;){const s=r[e++];if(s<128)t[n++]=String.fromCharCode(s);else if(s>191&&s<224){const i=r[e++];t[n++]=String.fromCharCode((s&31)<<6|i&63)}else if(s>239&&s<365){const i=r[e++],a=r[e++],u=r[e++],l=((s&7)<<18|(i&63)<<12|(a&63)<<6|u&63)-65536;t[n++]=String.fromCharCode(55296+(l>>10)),t[n++]=String.fromCharCode(56320+(l&1023))}else{const i=r[e++],a=r[e++];t[n++]=String.fromCharCode((s&15)<<12|(i&63)<<6|a&63)}}return t.join("")},kl={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(r,t){if(!Array.isArray(r))throw Error("encodeByteArray takes an array as a parameter");this.init_();const e=t?this.byteToCharMapWebSafe_:this.byteToCharMap_,n=[];for(let s=0;s<r.length;s+=3){const i=r[s],a=s+1<r.length,u=a?r[s+1]:0,l=s+2<r.length,d=l?r[s+2]:0,f=i>>2,g=(i&3)<<4|u>>4;let _=(u&15)<<2|d>>6,S=d&63;l||(S=64,a||(_=64)),n.push(e[f],e[g],e[_],e[S])}return n.join("")},encodeString(r,t){return this.HAS_NATIVE_SUPPORT&&!t?btoa(r):this.encodeByteArray(Nl(r),t)},decodeString(r,t){return this.HAS_NATIVE_SUPPORT&&!t?atob(r):rm(this.decodeStringToByteArray(r,t))},decodeStringToByteArray(r,t){this.init_();const e=t?this.charToByteMapWebSafe_:this.charToByteMap_,n=[];for(let s=0;s<r.length;){const i=e[r.charAt(s++)],u=s<r.length?e[r.charAt(s)]:0;++s;const d=s<r.length?e[r.charAt(s)]:64;++s;const g=s<r.length?e[r.charAt(s)]:64;if(++s,i==null||u==null||d==null||g==null)throw new sm;const _=i<<2|u>>4;if(n.push(_),d!==64){const S=u<<4&240|d>>2;if(n.push(S),g!==64){const D=d<<6&192|g;n.push(D)}}}return n},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let r=0;r<this.ENCODED_VALS.length;r++)this.byteToCharMap_[r]=this.ENCODED_VALS.charAt(r),this.charToByteMap_[this.byteToCharMap_[r]]=r,this.byteToCharMapWebSafe_[r]=this.ENCODED_VALS_WEBSAFE.charAt(r),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[r]]=r,r>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(r)]=r,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(r)]=r)}}};class sm extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const im=function(r){const t=Nl(r);return kl.encodeByteArray(t,!0)},Ml=function(r){return im(r).replace(/\./g,"")},om=function(r){try{return kl.decodeString(r,!0)}catch(t){console.error("base64Decode failed: ",t)}return null};/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ol(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const am=()=>Ol().__FIREBASE_DEFAULTS__,um=()=>{if(typeof process>"u"||typeof Zu>"u")return;const r=Zu.__FIREBASE_DEFAULTS__;if(r)return JSON.parse(r)},cm=()=>{if(typeof document>"u")return;let r;try{r=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const t=r&&om(r[1]);return t&&JSON.parse(t)},li=()=>{try{return nm()||am()||um()||cm()}catch(r){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${r}`);return}},CI=r=>{var t,e;return(e=(t=li())==null?void 0:t.emulatorHosts)==null?void 0:e[r]},Fl=()=>{var r;return(r=li())==null?void 0:r.config},DI=r=>{var t;return(t=li())==null?void 0:t[`_${r}`]};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class lm{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((t,e)=>{this.resolve=t,this.reject=e})}wrapCallback(t){return(e,n)=>{e?this.reject(e):this.resolve(n),typeof t=="function"&&(this.promise.catch(()=>{}),t.length===1?t(e):t(e,n))}}}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ea(r){try{return(r.startsWith("http://")||r.startsWith("https://")?new URL(r).hostname:r).endsWith(".cloudworkstations.dev")}catch{return!1}}async function hm(r){return(await fetch(r,{credentials:"include"})).ok}const Rr={};function dm(){const r={prod:[],emulator:[]};for(const t of Object.keys(Rr))Rr[t]?r.emulator.push(t):r.prod.push(t);return r}function fm(r){let t=document.getElementById(r),e=!1;return t||(t=document.createElement("div"),t.setAttribute("id",r),e=!0),{created:e,element:t}}let tc=!1;function xI(r,t){if(typeof window>"u"||typeof document>"u"||!ea(window.location.host)||Rr[r]===t||Rr[r]||tc)return;Rr[r]=t;function e(_){return`__firebase__banner__${_}`}const n="__firebase__banner",i=dm().prod.length>0;function a(){const _=document.getElementById(n);_&&_.remove()}function u(_){_.style.display="flex",_.style.background="#7faaf0",_.style.position="fixed",_.style.bottom="5px",_.style.left="5px",_.style.padding=".5em",_.style.borderRadius="5px",_.style.alignItems="center"}function l(_,S){_.setAttribute("width","24"),_.setAttribute("id",S),_.setAttribute("height","24"),_.setAttribute("viewBox","0 0 24 24"),_.setAttribute("fill","none"),_.style.marginLeft="-6px"}function d(){const _=document.createElement("span");return _.style.cursor="pointer",_.style.marginLeft="16px",_.style.fontSize="24px",_.innerHTML=" &times;",_.onclick=()=>{tc=!0,a()},_}function f(_,S){_.setAttribute("id",S),_.innerText="Learn more",_.href="https://firebase.google.com/docs/studio/preview-apps#preview-backend",_.setAttribute("target","__blank"),_.style.paddingLeft="5px",_.style.textDecoration="underline"}function g(){const _=fm(n),S=e("text"),D=document.getElementById(S)||document.createElement("span"),k=e("learnmore"),M=document.getElementById(k)||document.createElement("a"),G=e("preprendIcon"),q=document.getElementById(G)||document.createElementNS("http://www.w3.org/2000/svg","svg");if(_.created){const U=_.element;u(U),f(M,k);const et=d();l(q,G),U.append(q,D,M,et),document.body.appendChild(U)}i?(D.innerText="Preview backend disconnected.",q.innerHTML=`<g clip-path="url(#clip0_6013_33858)">
<path d="M4.8 17.6L12 5.6L19.2 17.6H4.8ZM6.91667 16.4H17.0833L12 7.93333L6.91667 16.4ZM12 15.6C12.1667 15.6 12.3056 15.5444 12.4167 15.4333C12.5389 15.3111 12.6 15.1667 12.6 15C12.6 14.8333 12.5389 14.6944 12.4167 14.5833C12.3056 14.4611 12.1667 14.4 12 14.4C11.8333 14.4 11.6889 14.4611 11.5667 14.5833C11.4556 14.6944 11.4 14.8333 11.4 15C11.4 15.1667 11.4556 15.3111 11.5667 15.4333C11.6889 15.5444 11.8333 15.6 12 15.6ZM11.4 13.6H12.6V10.4H11.4V13.6Z" fill="#212121"/>
</g>
<defs>
<clipPath id="clip0_6013_33858">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>`):(q.innerHTML=`<g clip-path="url(#clip0_6083_34804)">
<path d="M11.4 15.2H12.6V11.2H11.4V15.2ZM12 10C12.1667 10 12.3056 9.94444 12.4167 9.83333C12.5389 9.71111 12.6 9.56667 12.6 9.4C12.6 9.23333 12.5389 9.09444 12.4167 8.98333C12.3056 8.86111 12.1667 8.8 12 8.8C11.8333 8.8 11.6889 8.86111 11.5667 8.98333C11.4556 9.09444 11.4 9.23333 11.4 9.4C11.4 9.56667 11.4556 9.71111 11.5667 9.83333C11.6889 9.94444 11.8333 10 12 10ZM12 18.4C11.1222 18.4 10.2944 18.2333 9.51667 17.9C8.73889 17.5667 8.05556 17.1111 7.46667 16.5333C6.88889 15.9444 6.43333 15.2611 6.1 14.4833C5.76667 13.7056 5.6 12.8778 5.6 12C5.6 11.1111 5.76667 10.2833 6.1 9.51667C6.43333 8.73889 6.88889 8.06111 7.46667 7.48333C8.05556 6.89444 8.73889 6.43333 9.51667 6.1C10.2944 5.76667 11.1222 5.6 12 5.6C12.8889 5.6 13.7167 5.76667 14.4833 6.1C15.2611 6.43333 15.9389 6.89444 16.5167 7.48333C17.1056 8.06111 17.5667 8.73889 17.9 9.51667C18.2333 10.2833 18.4 11.1111 18.4 12C18.4 12.8778 18.2333 13.7056 17.9 14.4833C17.5667 15.2611 17.1056 15.9444 16.5167 16.5333C15.9389 17.1111 15.2611 17.5667 14.4833 17.9C13.7167 18.2333 12.8889 18.4 12 18.4ZM12 17.2C13.4444 17.2 14.6722 16.6944 15.6833 15.6833C16.6944 14.6722 17.2 13.4444 17.2 12C17.2 10.5556 16.6944 9.32778 15.6833 8.31667C14.6722 7.30555 13.4444 6.8 12 6.8C10.5556 6.8 9.32778 7.30555 8.31667 8.31667C7.30556 9.32778 6.8 10.5556 6.8 12C6.8 13.4444 7.30556 14.6722 8.31667 15.6833C9.32778 16.6944 10.5556 17.2 12 17.2Z" fill="#212121"/>
</g>
<defs>
<clipPath id="clip0_6083_34804">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>`,D.innerText="Preview backend running in this workspace."),D.setAttribute("id",S)}document.readyState==="loading"?window.addEventListener("DOMContentLoaded",g):g()}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Sn(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function NI(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(Sn())}function Ll(){var t;const r=(t=li())==null?void 0:t.forceEnvironment;if(r==="node")return!0;if(r==="browser")return!1;try{return Object.prototype.toString.call(global.process)==="[object process]"}catch{return!1}}function kI(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function MI(){const r=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof r=="object"&&r.id!==void 0}function OI(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function FI(){const r=Sn();return r.indexOf("MSIE ")>=0||r.indexOf("Trident/")>=0}function Bl(){return!Ll()&&!!navigator.userAgent&&navigator.userAgent.includes("Safari")&&!navigator.userAgent.includes("Chrome")}function Ul(){return!Ll()&&!!navigator.userAgent&&(navigator.userAgent.includes("Safari")||navigator.userAgent.includes("WebKit"))&&!navigator.userAgent.includes("Chrome")}function ql(){try{return typeof indexedDB=="object"}catch{return!1}}function mm(){return new Promise((r,t)=>{try{let e=!0;const n="validate-browser-context-for-indexeddb-analytics-module",s=self.indexedDB.open(n);s.onsuccess=()=>{s.result.close(),e||self.indexedDB.deleteDatabase(n),r(!0)},s.onupgradeneeded=()=>{e=!1},s.onerror=()=>{var i;t(((i=s.error)==null?void 0:i.message)||"")}}catch(e){t(e)}})}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const gm="FirebaseError";class Hn extends Error{constructor(t,e,n){super(e),this.code=t,this.customData=n,this.name=gm,Object.setPrototypeOf(this,Hn.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,jl.prototype.create)}}class jl{constructor(t,e,n){this.service=t,this.serviceName=e,this.errors=n}create(t,...e){const n=e[0]||{},s=`${this.service}/${t}`,i=this.errors[t],a=i?pm(i,n):"Error",u=`${this.serviceName}: ${a} (${s}).`;return new Hn(s,u,n)}}function pm(r,t){return r.replace(_m,(e,n)=>{const s=t[n];return s!=null?String(s):`<${n}?>`})}const _m=/\{\$([^}]+)}/g;function LI(r){for(const t in r)if(Object.prototype.hasOwnProperty.call(r,t))return!1;return!0}function Pn(r,t){if(r===t)return!0;const e=Object.keys(r),n=Object.keys(t);for(const s of e){if(!n.includes(s))return!1;const i=r[s],a=t[s];if(ec(i)&&ec(a)){if(!Pn(i,a))return!1}else if(i!==a)return!1}for(const s of n)if(!e.includes(s))return!1;return!0}function ec(r){return r!==null&&typeof r=="object"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function BI(r){const t=[];for(const[e,n]of Object.entries(r))Array.isArray(n)?n.forEach(s=>{t.push(encodeURIComponent(e)+"="+encodeURIComponent(s))}):t.push(encodeURIComponent(e)+"="+encodeURIComponent(n));return t.length?"&"+t.join("&"):""}function UI(r,t){const e=new ym(r,t);return e.subscribe.bind(e)}class ym{constructor(t,e){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=e,this.task.then(()=>{t(this)}).catch(n=>{this.error(n)})}next(t){this.forEachObserver(e=>{e.next(t)})}error(t){this.forEachObserver(e=>{e.error(t)}),this.close(t)}complete(){this.forEachObserver(t=>{t.complete()}),this.close()}subscribe(t,e,n){let s;if(t===void 0&&e===void 0&&n===void 0)throw new Error("Missing Observer.");Im(t,["next","error","complete"])?s=t:s={next:t,error:e,complete:n},s.next===void 0&&(s.next=co),s.error===void 0&&(s.error=co),s.complete===void 0&&(s.complete=co);const i=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?s.error(this.finalError):s.complete()}catch{}}),this.observers.push(s),i}unsubscribeOne(t){this.observers===void 0||this.observers[t]===void 0||(delete this.observers[t],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(t){if(!this.finalized)for(let e=0;e<this.observers.length;e++)this.sendOne(e,t)}sendOne(t,e){this.task.then(()=>{if(this.observers!==void 0&&this.observers[t]!==void 0)try{e(this.observers[t])}catch(n){typeof console<"u"&&console.error&&console.error(n)}})}close(t){this.finalized||(this.finalized=!0,t!==void 0&&(this.finalError=t),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function Im(r,t){if(typeof r!="object"||r===null)return!1;for(const e of t)if(e in r&&typeof r[e]=="function")return!0;return!1}function co(){}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Qt(r){return r&&r._delegate?r._delegate:r}class Fr{constructor(t,e,n){this.name=t,this.instanceFactory=e,this.type=n,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(t){return this.instantiationMode=t,this}setMultipleInstances(t){return this.multipleInstances=t,this}setServiceProps(t){return this.serviceProps=t,this}setInstanceCreatedCallback(t){return this.onInstanceCreated=t,this}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ue="[DEFAULT]";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Em{constructor(t,e){this.name=t,this.container=e,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(t){const e=this.normalizeInstanceIdentifier(t);if(!this.instancesDeferred.has(e)){const n=new lm;if(this.instancesDeferred.set(e,n),this.isInitialized(e)||this.shouldAutoInitialize())try{const s=this.getOrInitializeService({instanceIdentifier:e});s&&n.resolve(s)}catch{}}return this.instancesDeferred.get(e).promise}getImmediate(t){const e=this.normalizeInstanceIdentifier(t==null?void 0:t.identifier),n=(t==null?void 0:t.optional)??!1;if(this.isInitialized(e)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:e})}catch(s){if(n)return null;throw s}else{if(n)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(t){if(t.name!==this.name)throw Error(`Mismatching Component ${t.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=t,!!this.shouldAutoInitialize()){if(wm(t))try{this.getOrInitializeService({instanceIdentifier:Ue})}catch{}for(const[e,n]of this.instancesDeferred.entries()){const s=this.normalizeInstanceIdentifier(e);try{const i=this.getOrInitializeService({instanceIdentifier:s});n.resolve(i)}catch{}}}}clearInstance(t=Ue){this.instancesDeferred.delete(t),this.instancesOptions.delete(t),this.instances.delete(t)}async delete(){const t=Array.from(this.instances.values());await Promise.all([...t.filter(e=>"INTERNAL"in e).map(e=>e.INTERNAL.delete()),...t.filter(e=>"_delete"in e).map(e=>e._delete())])}isComponentSet(){return this.component!=null}isInitialized(t=Ue){return this.instances.has(t)}getOptions(t=Ue){return this.instancesOptions.get(t)||{}}initialize(t={}){const{options:e={}}=t,n=this.normalizeInstanceIdentifier(t.instanceIdentifier);if(this.isInitialized(n))throw Error(`${this.name}(${n}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const s=this.getOrInitializeService({instanceIdentifier:n,options:e});for(const[i,a]of this.instancesDeferred.entries()){const u=this.normalizeInstanceIdentifier(i);n===u&&a.resolve(s)}return s}onInit(t,e){const n=this.normalizeInstanceIdentifier(e),s=this.onInitCallbacks.get(n)??new Set;s.add(t),this.onInitCallbacks.set(n,s);const i=this.instances.get(n);return i&&t(i,n),()=>{s.delete(t)}}invokeOnInitCallbacks(t,e){const n=this.onInitCallbacks.get(e);if(n)for(const s of n)try{s(t,e)}catch{}}getOrInitializeService({instanceIdentifier:t,options:e={}}){let n=this.instances.get(t);if(!n&&this.component&&(n=this.component.instanceFactory(this.container,{instanceIdentifier:Tm(t),options:e}),this.instances.set(t,n),this.instancesOptions.set(t,e),this.invokeOnInitCallbacks(n,t),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,t,n)}catch{}return n||null}normalizeInstanceIdentifier(t=Ue){return this.component?this.component.multipleInstances?t:Ue:t}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function Tm(r){return r===Ue?void 0:r}function wm(r){return r.instantiationMode==="EAGER"}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vm{constructor(t){this.name=t,this.providers=new Map}addComponent(t){const e=this.getProvider(t.name);if(e.isComponentSet())throw new Error(`Component ${t.name} has already been registered with ${this.name}`);e.setComponent(t)}addOrOverwriteComponent(t){this.getProvider(t.name).isComponentSet()&&this.providers.delete(t.name),this.addComponent(t)}getProvider(t){if(this.providers.has(t))return this.providers.get(t);const e=new Em(t,this);return this.providers.set(t,e),e}getProviders(){return Array.from(this.providers.values())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var W;(function(r){r[r.DEBUG=0]="DEBUG",r[r.VERBOSE=1]="VERBOSE",r[r.INFO=2]="INFO",r[r.WARN=3]="WARN",r[r.ERROR=4]="ERROR",r[r.SILENT=5]="SILENT"})(W||(W={}));const Am={debug:W.DEBUG,verbose:W.VERBOSE,info:W.INFO,warn:W.WARN,error:W.ERROR,silent:W.SILENT},bm=W.INFO,Rm={[W.DEBUG]:"log",[W.VERBOSE]:"log",[W.INFO]:"info",[W.WARN]:"warn",[W.ERROR]:"error"},Sm=(r,t,...e)=>{if(t<r.logLevel)return;const n=new Date().toISOString(),s=Rm[t];if(s)console[s](`[${n}]  ${r.name}:`,...e);else throw new Error(`Attempted to log a message with an invalid logType (value: ${t})`)};class zl{constructor(t){this.name=t,this._logLevel=bm,this._logHandler=Sm,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(t){if(!(t in W))throw new TypeError(`Invalid value "${t}" assigned to \`logLevel\``);this._logLevel=t}setLogLevel(t){this._logLevel=typeof t=="string"?Am[t]:t}get logHandler(){return this._logHandler}set logHandler(t){if(typeof t!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=t}get userLogHandler(){return this._userLogHandler}set userLogHandler(t){this._userLogHandler=t}debug(...t){this._userLogHandler&&this._userLogHandler(this,W.DEBUG,...t),this._logHandler(this,W.DEBUG,...t)}log(...t){this._userLogHandler&&this._userLogHandler(this,W.VERBOSE,...t),this._logHandler(this,W.VERBOSE,...t)}info(...t){this._userLogHandler&&this._userLogHandler(this,W.INFO,...t),this._logHandler(this,W.INFO,...t)}warn(...t){this._userLogHandler&&this._userLogHandler(this,W.WARN,...t),this._logHandler(this,W.WARN,...t)}error(...t){this._userLogHandler&&this._userLogHandler(this,W.ERROR,...t),this._logHandler(this,W.ERROR,...t)}}const Pm=(r,t)=>t.some(e=>r instanceof e);let nc,rc;function Vm(){return nc||(nc=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function Cm(){return rc||(rc=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const $l=new WeakMap,Ao=new WeakMap,Gl=new WeakMap,lo=new WeakMap,na=new WeakMap;function Dm(r){const t=new Promise((e,n)=>{const s=()=>{r.removeEventListener("success",i),r.removeEventListener("error",a)},i=()=>{e(_e(r.result)),s()},a=()=>{n(r.error),s()};r.addEventListener("success",i),r.addEventListener("error",a)});return t.then(e=>{e instanceof IDBCursor&&$l.set(e,r)}).catch(()=>{}),na.set(t,r),t}function xm(r){if(Ao.has(r))return;const t=new Promise((e,n)=>{const s=()=>{r.removeEventListener("complete",i),r.removeEventListener("error",a),r.removeEventListener("abort",a)},i=()=>{e(),s()},a=()=>{n(r.error||new DOMException("AbortError","AbortError")),s()};r.addEventListener("complete",i),r.addEventListener("error",a),r.addEventListener("abort",a)});Ao.set(r,t)}let bo={get(r,t,e){if(r instanceof IDBTransaction){if(t==="done")return Ao.get(r);if(t==="objectStoreNames")return r.objectStoreNames||Gl.get(r);if(t==="store")return e.objectStoreNames[1]?void 0:e.objectStore(e.objectStoreNames[0])}return _e(r[t])},set(r,t,e){return r[t]=e,!0},has(r,t){return r instanceof IDBTransaction&&(t==="done"||t==="store")?!0:t in r}};function Nm(r){bo=r(bo)}function km(r){return r===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(t,...e){const n=r.call(ho(this),t,...e);return Gl.set(n,t.sort?t.sort():[t]),_e(n)}:Cm().includes(r)?function(...t){return r.apply(ho(this),t),_e($l.get(this))}:function(...t){return _e(r.apply(ho(this),t))}}function Mm(r){return typeof r=="function"?km(r):(r instanceof IDBTransaction&&xm(r),Pm(r,Vm())?new Proxy(r,bo):r)}function _e(r){if(r instanceof IDBRequest)return Dm(r);if(lo.has(r))return lo.get(r);const t=Mm(r);return t!==r&&(lo.set(r,t),na.set(t,r)),t}const ho=r=>na.get(r);function Om(r,t,{blocked:e,upgrade:n,blocking:s,terminated:i}={}){const a=indexedDB.open(r,t),u=_e(a);return n&&a.addEventListener("upgradeneeded",l=>{n(_e(a.result),l.oldVersion,l.newVersion,_e(a.transaction),l)}),e&&a.addEventListener("blocked",l=>e(l.oldVersion,l.newVersion,l)),u.then(l=>{i&&l.addEventListener("close",()=>i()),s&&l.addEventListener("versionchange",d=>s(d.oldVersion,d.newVersion,d))}).catch(()=>{}),u}const Fm=["get","getKey","getAll","getAllKeys","count"],Lm=["put","add","delete","clear"],fo=new Map;function sc(r,t){if(!(r instanceof IDBDatabase&&!(t in r)&&typeof t=="string"))return;if(fo.get(t))return fo.get(t);const e=t.replace(/FromIndex$/,""),n=t!==e,s=Lm.includes(e);if(!(e in(n?IDBIndex:IDBObjectStore).prototype)||!(s||Fm.includes(e)))return;const i=async function(a,...u){const l=this.transaction(a,s?"readwrite":"readonly");let d=l.store;return n&&(d=d.index(u.shift())),(await Promise.all([d[e](...u),s&&l.done]))[0]};return fo.set(t,i),i}Nm(r=>({...r,get:(t,e,n)=>sc(t,e)||r.get(t,e,n),has:(t,e)=>!!sc(t,e)||r.has(t,e)}));/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Bm{constructor(t){this.container=t}getPlatformInfoString(){return this.container.getProviders().map(e=>{if(Um(e)){const n=e.getImmediate();return`${n.library}/${n.version}`}else return null}).filter(e=>e).join(" ")}}function Um(r){const t=r.getComponent();return(t==null?void 0:t.type)==="VERSION"}const Ro="@firebase/app",ic="0.14.7";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ee=new zl("@firebase/app"),qm="@firebase/app-compat",jm="@firebase/analytics-compat",zm="@firebase/analytics",$m="@firebase/app-check-compat",Gm="@firebase/app-check",Km="@firebase/auth",Hm="@firebase/auth-compat",Wm="@firebase/database",Qm="@firebase/data-connect",Jm="@firebase/database-compat",Ym="@firebase/functions",Xm="@firebase/functions-compat",Zm="@firebase/installations",tg="@firebase/installations-compat",eg="@firebase/messaging",ng="@firebase/messaging-compat",rg="@firebase/performance",sg="@firebase/performance-compat",ig="@firebase/remote-config",og="@firebase/remote-config-compat",ag="@firebase/storage",ug="@firebase/storage-compat",cg="@firebase/firestore",lg="@firebase/ai",hg="@firebase/firestore-compat",dg="firebase",fg="12.8.0";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const So="[DEFAULT]",mg={[Ro]:"fire-core",[qm]:"fire-core-compat",[zm]:"fire-analytics",[jm]:"fire-analytics-compat",[Gm]:"fire-app-check",[$m]:"fire-app-check-compat",[Km]:"fire-auth",[Hm]:"fire-auth-compat",[Wm]:"fire-rtdb",[Qm]:"fire-data-connect",[Jm]:"fire-rtdb-compat",[Ym]:"fire-fn",[Xm]:"fire-fn-compat",[Zm]:"fire-iid",[tg]:"fire-iid-compat",[eg]:"fire-fcm",[ng]:"fire-fcm-compat",[rg]:"fire-perf",[sg]:"fire-perf-compat",[ig]:"fire-rc",[og]:"fire-rc-compat",[ag]:"fire-gcs",[ug]:"fire-gcs-compat",[cg]:"fire-fst",[hg]:"fire-fst-compat",[lg]:"fire-vertex","fire-js":"fire-js",[dg]:"fire-js-all"};/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const js=new Map,gg=new Map,Po=new Map;function oc(r,t){try{r.container.addComponent(t)}catch(e){ee.debug(`Component ${t.name} failed to register with FirebaseApp ${r.name}`,e)}}function zs(r){const t=r.name;if(Po.has(t))return ee.debug(`There were multiple attempts to register component ${t}.`),!1;Po.set(t,r);for(const e of js.values())oc(e,r);for(const e of gg.values())oc(e,r);return!0}function pg(r,t){const e=r.container.getProvider("heartbeat").getImmediate({optional:!0});return e&&e.triggerHeartbeat(),r.container.getProvider(t)}function _g(r){return r==null?!1:r.settings!==void 0}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const yg={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},ye=new jl("app","Firebase",yg);/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ig{constructor(t,e,n){this._isDeleted=!1,this._options={...t},this._config={...e},this._name=e.name,this._automaticDataCollectionEnabled=e.automaticDataCollectionEnabled,this._container=n,this.container.addComponent(new Fr("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(t){this.checkDestroyed(),this._automaticDataCollectionEnabled=t}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(t){this._isDeleted=t}checkDestroyed(){if(this.isDeleted)throw ye.create("app-deleted",{appName:this._name})}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Eg=fg;function Tg(r,t={}){let e=r;typeof t!="object"&&(t={name:t});const n={name:So,automaticDataCollectionEnabled:!0,...t},s=n.name;if(typeof s!="string"||!s)throw ye.create("bad-app-name",{appName:String(s)});if(e||(e=Fl()),!e)throw ye.create("no-options");const i=js.get(s);if(i){if(Pn(e,i.options)&&Pn(n,i.config))return i;throw ye.create("duplicate-app",{appName:s})}const a=new vm(s);for(const l of Po.values())a.addComponent(l);const u=new Ig(e,n,a);return js.set(s,u),u}function qI(r=So){const t=js.get(r);if(!t&&r===So&&Fl())return Tg();if(!t)throw ye.create("no-app",{appName:r});return t}function An(r,t,e){let n=mg[r]??r;e&&(n+=`-${e}`);const s=n.match(/\s|\//),i=t.match(/\s|\//);if(s||i){const a=[`Unable to register library "${n}" with version "${t}":`];s&&a.push(`library name "${n}" contains illegal characters (whitespace or "/")`),s&&i&&a.push("and"),i&&a.push(`version name "${t}" contains illegal characters (whitespace or "/")`),ee.warn(a.join(" "));return}zs(new Fr(`${n}-version`,()=>({library:n,version:t}),"VERSION"))}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const wg="firebase-heartbeat-database",vg=1,Lr="firebase-heartbeat-store";let mo=null;function Kl(){return mo||(mo=Om(wg,vg,{upgrade:(r,t)=>{switch(t){case 0:try{r.createObjectStore(Lr)}catch(e){console.warn(e)}}}}).catch(r=>{throw ye.create("idb-open",{originalErrorMessage:r.message})})),mo}async function Ag(r){try{const e=(await Kl()).transaction(Lr),n=await e.objectStore(Lr).get(Hl(r));return await e.done,n}catch(t){if(t instanceof Hn)ee.warn(t.message);else{const e=ye.create("idb-get",{originalErrorMessage:t==null?void 0:t.message});ee.warn(e.message)}}}async function ac(r,t){try{const n=(await Kl()).transaction(Lr,"readwrite");await n.objectStore(Lr).put(t,Hl(r)),await n.done}catch(e){if(e instanceof Hn)ee.warn(e.message);else{const n=ye.create("idb-set",{originalErrorMessage:e==null?void 0:e.message});ee.warn(n.message)}}}function Hl(r){return`${r.name}!${r.options.appId}`}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const bg=1024,Rg=30;class Sg{constructor(t){this.container=t,this._heartbeatsCache=null;const e=this.container.getProvider("app").getImmediate();this._storage=new Vg(e),this._heartbeatsCachePromise=this._storage.read().then(n=>(this._heartbeatsCache=n,n))}async triggerHeartbeat(){var t,e;try{const s=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),i=uc();if(((t=this._heartbeatsCache)==null?void 0:t.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((e=this._heartbeatsCache)==null?void 0:e.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===i||this._heartbeatsCache.heartbeats.some(a=>a.date===i))return;if(this._heartbeatsCache.heartbeats.push({date:i,agent:s}),this._heartbeatsCache.heartbeats.length>Rg){const a=Cg(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(a,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(n){ee.warn(n)}}async getHeartbeatsHeader(){var t;try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((t=this._heartbeatsCache)==null?void 0:t.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const e=uc(),{heartbeatsToSend:n,unsentEntries:s}=Pg(this._heartbeatsCache.heartbeats),i=Ml(JSON.stringify({version:2,heartbeats:n}));return this._heartbeatsCache.lastSentHeartbeatDate=e,s.length>0?(this._heartbeatsCache.heartbeats=s,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),i}catch(e){return ee.warn(e),""}}}function uc(){return new Date().toISOString().substring(0,10)}function Pg(r,t=bg){const e=[];let n=r.slice();for(const s of r){const i=e.find(a=>a.agent===s.agent);if(i){if(i.dates.push(s.date),cc(e)>t){i.dates.pop();break}}else if(e.push({agent:s.agent,dates:[s.date]}),cc(e)>t){e.pop();break}n=n.slice(1)}return{heartbeatsToSend:e,unsentEntries:n}}class Vg{constructor(t){this.app=t,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return ql()?mm().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const e=await Ag(this.app);return e!=null&&e.heartbeats?e:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(t){if(await this._canUseIndexedDBPromise){const n=await this.read();return ac(this.app,{lastSentHeartbeatDate:t.lastSentHeartbeatDate??n.lastSentHeartbeatDate,heartbeats:t.heartbeats})}else return}async add(t){if(await this._canUseIndexedDBPromise){const n=await this.read();return ac(this.app,{lastSentHeartbeatDate:t.lastSentHeartbeatDate??n.lastSentHeartbeatDate,heartbeats:[...n.heartbeats,...t.heartbeats]})}else return}}function cc(r){return Ml(JSON.stringify({version:2,heartbeats:r})).length}function Cg(r){if(r.length===0)return-1;let t=0,e=r[0].date;for(let n=1;n<r.length;n++)r[n].date<e&&(e=r[n].date,t=n);return t}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Dg(r){zs(new Fr("platform-logger",t=>new Bm(t),"PRIVATE")),zs(new Fr("heartbeat",t=>new Sg(t),"PRIVATE")),An(Ro,ic,r),An(Ro,ic,"esm2020"),An("fire-js","")}Dg("");var xg="firebase",Ng="12.8.0";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */An(xg,Ng,"app");var lc=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var Ie,Wl;(function(){var r;/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/function t(E,p){function I(){}I.prototype=p.prototype,E.F=p.prototype,E.prototype=new I,E.prototype.constructor=E,E.D=function(w,T,b){for(var y=Array(arguments.length-2),Vt=2;Vt<arguments.length;Vt++)y[Vt-2]=arguments[Vt];return p.prototype[T].apply(w,y)}}function e(){this.blockSize=-1}function n(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.C=Array(this.blockSize),this.o=this.h=0,this.u()}t(n,e),n.prototype.u=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0};function s(E,p,I){I||(I=0);const w=Array(16);if(typeof p=="string")for(var T=0;T<16;++T)w[T]=p.charCodeAt(I++)|p.charCodeAt(I++)<<8|p.charCodeAt(I++)<<16|p.charCodeAt(I++)<<24;else for(T=0;T<16;++T)w[T]=p[I++]|p[I++]<<8|p[I++]<<16|p[I++]<<24;p=E.g[0],I=E.g[1],T=E.g[2];let b=E.g[3],y;y=p+(b^I&(T^b))+w[0]+3614090360&4294967295,p=I+(y<<7&4294967295|y>>>25),y=b+(T^p&(I^T))+w[1]+3905402710&4294967295,b=p+(y<<12&4294967295|y>>>20),y=T+(I^b&(p^I))+w[2]+606105819&4294967295,T=b+(y<<17&4294967295|y>>>15),y=I+(p^T&(b^p))+w[3]+3250441966&4294967295,I=T+(y<<22&4294967295|y>>>10),y=p+(b^I&(T^b))+w[4]+4118548399&4294967295,p=I+(y<<7&4294967295|y>>>25),y=b+(T^p&(I^T))+w[5]+1200080426&4294967295,b=p+(y<<12&4294967295|y>>>20),y=T+(I^b&(p^I))+w[6]+2821735955&4294967295,T=b+(y<<17&4294967295|y>>>15),y=I+(p^T&(b^p))+w[7]+4249261313&4294967295,I=T+(y<<22&4294967295|y>>>10),y=p+(b^I&(T^b))+w[8]+1770035416&4294967295,p=I+(y<<7&4294967295|y>>>25),y=b+(T^p&(I^T))+w[9]+2336552879&4294967295,b=p+(y<<12&4294967295|y>>>20),y=T+(I^b&(p^I))+w[10]+4294925233&4294967295,T=b+(y<<17&4294967295|y>>>15),y=I+(p^T&(b^p))+w[11]+2304563134&4294967295,I=T+(y<<22&4294967295|y>>>10),y=p+(b^I&(T^b))+w[12]+1804603682&4294967295,p=I+(y<<7&4294967295|y>>>25),y=b+(T^p&(I^T))+w[13]+4254626195&4294967295,b=p+(y<<12&4294967295|y>>>20),y=T+(I^b&(p^I))+w[14]+2792965006&4294967295,T=b+(y<<17&4294967295|y>>>15),y=I+(p^T&(b^p))+w[15]+1236535329&4294967295,I=T+(y<<22&4294967295|y>>>10),y=p+(T^b&(I^T))+w[1]+4129170786&4294967295,p=I+(y<<5&4294967295|y>>>27),y=b+(I^T&(p^I))+w[6]+3225465664&4294967295,b=p+(y<<9&4294967295|y>>>23),y=T+(p^I&(b^p))+w[11]+643717713&4294967295,T=b+(y<<14&4294967295|y>>>18),y=I+(b^p&(T^b))+w[0]+3921069994&4294967295,I=T+(y<<20&4294967295|y>>>12),y=p+(T^b&(I^T))+w[5]+3593408605&4294967295,p=I+(y<<5&4294967295|y>>>27),y=b+(I^T&(p^I))+w[10]+38016083&4294967295,b=p+(y<<9&4294967295|y>>>23),y=T+(p^I&(b^p))+w[15]+3634488961&4294967295,T=b+(y<<14&4294967295|y>>>18),y=I+(b^p&(T^b))+w[4]+3889429448&4294967295,I=T+(y<<20&4294967295|y>>>12),y=p+(T^b&(I^T))+w[9]+568446438&4294967295,p=I+(y<<5&4294967295|y>>>27),y=b+(I^T&(p^I))+w[14]+3275163606&4294967295,b=p+(y<<9&4294967295|y>>>23),y=T+(p^I&(b^p))+w[3]+4107603335&4294967295,T=b+(y<<14&4294967295|y>>>18),y=I+(b^p&(T^b))+w[8]+1163531501&4294967295,I=T+(y<<20&4294967295|y>>>12),y=p+(T^b&(I^T))+w[13]+2850285829&4294967295,p=I+(y<<5&4294967295|y>>>27),y=b+(I^T&(p^I))+w[2]+4243563512&4294967295,b=p+(y<<9&4294967295|y>>>23),y=T+(p^I&(b^p))+w[7]+1735328473&4294967295,T=b+(y<<14&4294967295|y>>>18),y=I+(b^p&(T^b))+w[12]+2368359562&4294967295,I=T+(y<<20&4294967295|y>>>12),y=p+(I^T^b)+w[5]+4294588738&4294967295,p=I+(y<<4&4294967295|y>>>28),y=b+(p^I^T)+w[8]+2272392833&4294967295,b=p+(y<<11&4294967295|y>>>21),y=T+(b^p^I)+w[11]+1839030562&4294967295,T=b+(y<<16&4294967295|y>>>16),y=I+(T^b^p)+w[14]+4259657740&4294967295,I=T+(y<<23&4294967295|y>>>9),y=p+(I^T^b)+w[1]+2763975236&4294967295,p=I+(y<<4&4294967295|y>>>28),y=b+(p^I^T)+w[4]+1272893353&4294967295,b=p+(y<<11&4294967295|y>>>21),y=T+(b^p^I)+w[7]+4139469664&4294967295,T=b+(y<<16&4294967295|y>>>16),y=I+(T^b^p)+w[10]+3200236656&4294967295,I=T+(y<<23&4294967295|y>>>9),y=p+(I^T^b)+w[13]+681279174&4294967295,p=I+(y<<4&4294967295|y>>>28),y=b+(p^I^T)+w[0]+3936430074&4294967295,b=p+(y<<11&4294967295|y>>>21),y=T+(b^p^I)+w[3]+3572445317&4294967295,T=b+(y<<16&4294967295|y>>>16),y=I+(T^b^p)+w[6]+76029189&4294967295,I=T+(y<<23&4294967295|y>>>9),y=p+(I^T^b)+w[9]+3654602809&4294967295,p=I+(y<<4&4294967295|y>>>28),y=b+(p^I^T)+w[12]+3873151461&4294967295,b=p+(y<<11&4294967295|y>>>21),y=T+(b^p^I)+w[15]+530742520&4294967295,T=b+(y<<16&4294967295|y>>>16),y=I+(T^b^p)+w[2]+3299628645&4294967295,I=T+(y<<23&4294967295|y>>>9),y=p+(T^(I|~b))+w[0]+4096336452&4294967295,p=I+(y<<6&4294967295|y>>>26),y=b+(I^(p|~T))+w[7]+1126891415&4294967295,b=p+(y<<10&4294967295|y>>>22),y=T+(p^(b|~I))+w[14]+2878612391&4294967295,T=b+(y<<15&4294967295|y>>>17),y=I+(b^(T|~p))+w[5]+4237533241&4294967295,I=T+(y<<21&4294967295|y>>>11),y=p+(T^(I|~b))+w[12]+1700485571&4294967295,p=I+(y<<6&4294967295|y>>>26),y=b+(I^(p|~T))+w[3]+2399980690&4294967295,b=p+(y<<10&4294967295|y>>>22),y=T+(p^(b|~I))+w[10]+4293915773&4294967295,T=b+(y<<15&4294967295|y>>>17),y=I+(b^(T|~p))+w[1]+2240044497&4294967295,I=T+(y<<21&4294967295|y>>>11),y=p+(T^(I|~b))+w[8]+1873313359&4294967295,p=I+(y<<6&4294967295|y>>>26),y=b+(I^(p|~T))+w[15]+4264355552&4294967295,b=p+(y<<10&4294967295|y>>>22),y=T+(p^(b|~I))+w[6]+2734768916&4294967295,T=b+(y<<15&4294967295|y>>>17),y=I+(b^(T|~p))+w[13]+1309151649&4294967295,I=T+(y<<21&4294967295|y>>>11),y=p+(T^(I|~b))+w[4]+4149444226&4294967295,p=I+(y<<6&4294967295|y>>>26),y=b+(I^(p|~T))+w[11]+3174756917&4294967295,b=p+(y<<10&4294967295|y>>>22),y=T+(p^(b|~I))+w[2]+718787259&4294967295,T=b+(y<<15&4294967295|y>>>17),y=I+(b^(T|~p))+w[9]+3951481745&4294967295,E.g[0]=E.g[0]+p&4294967295,E.g[1]=E.g[1]+(T+(y<<21&4294967295|y>>>11))&4294967295,E.g[2]=E.g[2]+T&4294967295,E.g[3]=E.g[3]+b&4294967295}n.prototype.v=function(E,p){p===void 0&&(p=E.length);const I=p-this.blockSize,w=this.C;let T=this.h,b=0;for(;b<p;){if(T==0)for(;b<=I;)s(this,E,b),b+=this.blockSize;if(typeof E=="string"){for(;b<p;)if(w[T++]=E.charCodeAt(b++),T==this.blockSize){s(this,w),T=0;break}}else for(;b<p;)if(w[T++]=E[b++],T==this.blockSize){s(this,w),T=0;break}}this.h=T,this.o+=p},n.prototype.A=function(){var E=Array((this.h<56?this.blockSize:this.blockSize*2)-this.h);E[0]=128;for(var p=1;p<E.length-8;++p)E[p]=0;p=this.o*8;for(var I=E.length-8;I<E.length;++I)E[I]=p&255,p/=256;for(this.v(E),E=Array(16),p=0,I=0;I<4;++I)for(let w=0;w<32;w+=8)E[p++]=this.g[I]>>>w&255;return E};function i(E,p){var I=u;return Object.prototype.hasOwnProperty.call(I,E)?I[E]:I[E]=p(E)}function a(E,p){this.h=p;const I=[];let w=!0;for(let T=E.length-1;T>=0;T--){const b=E[T]|0;w&&b==p||(I[T]=b,w=!1)}this.g=I}var u={};function l(E){return-128<=E&&E<128?i(E,function(p){return new a([p|0],p<0?-1:0)}):new a([E|0],E<0?-1:0)}function d(E){if(isNaN(E)||!isFinite(E))return g;if(E<0)return M(d(-E));const p=[];let I=1;for(let w=0;E>=I;w++)p[w]=E/I|0,I*=4294967296;return new a(p,0)}function f(E,p){if(E.length==0)throw Error("number format error: empty string");if(p=p||10,p<2||36<p)throw Error("radix out of range: "+p);if(E.charAt(0)=="-")return M(f(E.substring(1),p));if(E.indexOf("-")>=0)throw Error('number format error: interior "-" character');const I=d(Math.pow(p,8));let w=g;for(let b=0;b<E.length;b+=8){var T=Math.min(8,E.length-b);const y=parseInt(E.substring(b,b+T),p);T<8?(T=d(Math.pow(p,T)),w=w.j(T).add(d(y))):(w=w.j(I),w=w.add(d(y)))}return w}var g=l(0),_=l(1),S=l(16777216);r=a.prototype,r.m=function(){if(k(this))return-M(this).m();let E=0,p=1;for(let I=0;I<this.g.length;I++){const w=this.i(I);E+=(w>=0?w:4294967296+w)*p,p*=4294967296}return E},r.toString=function(E){if(E=E||10,E<2||36<E)throw Error("radix out of range: "+E);if(D(this))return"0";if(k(this))return"-"+M(this).toString(E);const p=d(Math.pow(E,6));var I=this;let w="";for(;;){const T=et(I,p).g;I=G(I,T.j(p));let b=((I.g.length>0?I.g[0]:I.h)>>>0).toString(E);if(I=T,D(I))return b+w;for(;b.length<6;)b="0"+b;w=b+w}},r.i=function(E){return E<0?0:E<this.g.length?this.g[E]:this.h};function D(E){if(E.h!=0)return!1;for(let p=0;p<E.g.length;p++)if(E.g[p]!=0)return!1;return!0}function k(E){return E.h==-1}r.l=function(E){return E=G(this,E),k(E)?-1:D(E)?0:1};function M(E){const p=E.g.length,I=[];for(let w=0;w<p;w++)I[w]=~E.g[w];return new a(I,~E.h).add(_)}r.abs=function(){return k(this)?M(this):this},r.add=function(E){const p=Math.max(this.g.length,E.g.length),I=[];let w=0;for(let T=0;T<=p;T++){let b=w+(this.i(T)&65535)+(E.i(T)&65535),y=(b>>>16)+(this.i(T)>>>16)+(E.i(T)>>>16);w=y>>>16,b&=65535,y&=65535,I[T]=y<<16|b}return new a(I,I[I.length-1]&-2147483648?-1:0)};function G(E,p){return E.add(M(p))}r.j=function(E){if(D(this)||D(E))return g;if(k(this))return k(E)?M(this).j(M(E)):M(M(this).j(E));if(k(E))return M(this.j(M(E)));if(this.l(S)<0&&E.l(S)<0)return d(this.m()*E.m());const p=this.g.length+E.g.length,I=[];for(var w=0;w<2*p;w++)I[w]=0;for(w=0;w<this.g.length;w++)for(let T=0;T<E.g.length;T++){const b=this.i(w)>>>16,y=this.i(w)&65535,Vt=E.i(T)>>>16,Ne=E.i(T)&65535;I[2*w+2*T]+=y*Ne,q(I,2*w+2*T),I[2*w+2*T+1]+=b*Ne,q(I,2*w+2*T+1),I[2*w+2*T+1]+=y*Vt,q(I,2*w+2*T+1),I[2*w+2*T+2]+=b*Vt,q(I,2*w+2*T+2)}for(E=0;E<p;E++)I[E]=I[2*E+1]<<16|I[2*E];for(E=p;E<2*p;E++)I[E]=0;return new a(I,0)};function q(E,p){for(;(E[p]&65535)!=E[p];)E[p+1]+=E[p]>>>16,E[p]&=65535,p++}function U(E,p){this.g=E,this.h=p}function et(E,p){if(D(p))throw Error("division by zero");if(D(E))return new U(g,g);if(k(E))return p=et(M(E),p),new U(M(p.g),M(p.h));if(k(p))return p=et(E,M(p)),new U(M(p.g),p.h);if(E.g.length>30){if(k(E)||k(p))throw Error("slowDivide_ only works with positive integers.");for(var I=_,w=p;w.l(E)<=0;)I=Y(I),w=Y(w);var T=Q(I,1),b=Q(w,1);for(w=Q(w,2),I=Q(I,2);!D(w);){var y=b.add(w);y.l(E)<=0&&(T=T.add(I),b=y),w=Q(w,1),I=Q(I,1)}return p=G(E,T.j(p)),new U(T,p)}for(T=g;E.l(p)>=0;){for(I=Math.max(1,Math.floor(E.m()/p.m())),w=Math.ceil(Math.log(I)/Math.LN2),w=w<=48?1:Math.pow(2,w-48),b=d(I),y=b.j(p);k(y)||y.l(E)>0;)I-=w,b=d(I),y=b.j(p);D(b)&&(b=_),T=T.add(b),E=G(E,y)}return new U(T,E)}r.B=function(E){return et(this,E).h},r.and=function(E){const p=Math.max(this.g.length,E.g.length),I=[];for(let w=0;w<p;w++)I[w]=this.i(w)&E.i(w);return new a(I,this.h&E.h)},r.or=function(E){const p=Math.max(this.g.length,E.g.length),I=[];for(let w=0;w<p;w++)I[w]=this.i(w)|E.i(w);return new a(I,this.h|E.h)},r.xor=function(E){const p=Math.max(this.g.length,E.g.length),I=[];for(let w=0;w<p;w++)I[w]=this.i(w)^E.i(w);return new a(I,this.h^E.h)};function Y(E){const p=E.g.length+1,I=[];for(let w=0;w<p;w++)I[w]=E.i(w)<<1|E.i(w-1)>>>31;return new a(I,E.h)}function Q(E,p){const I=p>>5;p%=32;const w=E.g.length-I,T=[];for(let b=0;b<w;b++)T[b]=p>0?E.i(b+I)>>>p|E.i(b+I+1)<<32-p:E.i(b+I);return new a(T,E.h)}n.prototype.digest=n.prototype.A,n.prototype.reset=n.prototype.u,n.prototype.update=n.prototype.v,Wl=n,a.prototype.add=a.prototype.add,a.prototype.multiply=a.prototype.j,a.prototype.modulo=a.prototype.B,a.prototype.compare=a.prototype.l,a.prototype.toNumber=a.prototype.m,a.prototype.toString=a.prototype.toString,a.prototype.getBits=a.prototype.i,a.fromNumber=d,a.fromString=f,Ie=a}).apply(typeof lc<"u"?lc:typeof self<"u"?self:typeof window<"u"?window:{});var As=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var Ql,wr,Jl,Ds,Vo,Yl,Xl,Zl;(function(){var r,t=Object.defineProperty;function e(o){o=[typeof globalThis=="object"&&globalThis,o,typeof window=="object"&&window,typeof self=="object"&&self,typeof As=="object"&&As];for(var c=0;c<o.length;++c){var h=o[c];if(h&&h.Math==Math)return h}throw Error("Cannot find global object")}var n=e(this);function s(o,c){if(c)t:{var h=n;o=o.split(".");for(var m=0;m<o.length-1;m++){var A=o[m];if(!(A in h))break t;h=h[A]}o=o[o.length-1],m=h[o],c=c(m),c!=m&&c!=null&&t(h,o,{configurable:!0,writable:!0,value:c})}}s("Symbol.dispose",function(o){return o||Symbol("Symbol.dispose")}),s("Array.prototype.values",function(o){return o||function(){return this[Symbol.iterator]()}}),s("Object.entries",function(o){return o||function(c){var h=[],m;for(m in c)Object.prototype.hasOwnProperty.call(c,m)&&h.push([m,c[m]]);return h}});/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/var i=i||{},a=this||self;function u(o){var c=typeof o;return c=="object"&&o!=null||c=="function"}function l(o,c,h){return o.call.apply(o.bind,arguments)}function d(o,c,h){return d=l,d.apply(null,arguments)}function f(o,c){var h=Array.prototype.slice.call(arguments,1);return function(){var m=h.slice();return m.push.apply(m,arguments),o.apply(this,m)}}function g(o,c){function h(){}h.prototype=c.prototype,o.Z=c.prototype,o.prototype=new h,o.prototype.constructor=o,o.Ob=function(m,A,R){for(var x=Array(arguments.length-2),z=2;z<arguments.length;z++)x[z-2]=arguments[z];return c.prototype[A].apply(m,x)}}var _=typeof AsyncContext<"u"&&typeof AsyncContext.Snapshot=="function"?o=>o&&AsyncContext.Snapshot.wrap(o):o=>o;function S(o){const c=o.length;if(c>0){const h=Array(c);for(let m=0;m<c;m++)h[m]=o[m];return h}return[]}function D(o,c){for(let m=1;m<arguments.length;m++){const A=arguments[m];var h=typeof A;if(h=h!="object"?h:A?Array.isArray(A)?"array":h:"null",h=="array"||h=="object"&&typeof A.length=="number"){h=o.length||0;const R=A.length||0;o.length=h+R;for(let x=0;x<R;x++)o[h+x]=A[x]}else o.push(A)}}class k{constructor(c,h){this.i=c,this.j=h,this.h=0,this.g=null}get(){let c;return this.h>0?(this.h--,c=this.g,this.g=c.next,c.next=null):c=this.i(),c}}function M(o){a.setTimeout(()=>{throw o},0)}function G(){var o=E;let c=null;return o.g&&(c=o.g,o.g=o.g.next,o.g||(o.h=null),c.next=null),c}class q{constructor(){this.h=this.g=null}add(c,h){const m=U.get();m.set(c,h),this.h?this.h.next=m:this.g=m,this.h=m}}var U=new k(()=>new et,o=>o.reset());class et{constructor(){this.next=this.g=this.h=null}set(c,h){this.h=c,this.g=h,this.next=null}reset(){this.next=this.g=this.h=null}}let Y,Q=!1,E=new q,p=()=>{const o=Promise.resolve(void 0);Y=()=>{o.then(I)}};function I(){for(var o;o=G();){try{o.h.call(o.g)}catch(h){M(h)}var c=U;c.j(o),c.h<100&&(c.h++,o.next=c.g,c.g=o)}Q=!1}function w(){this.u=this.u,this.C=this.C}w.prototype.u=!1,w.prototype.dispose=function(){this.u||(this.u=!0,this.N())},w.prototype[Symbol.dispose]=function(){this.dispose()},w.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()};function T(o,c){this.type=o,this.g=this.target=c,this.defaultPrevented=!1}T.prototype.h=function(){this.defaultPrevented=!0};var b=function(){if(!a.addEventListener||!Object.defineProperty)return!1;var o=!1,c=Object.defineProperty({},"passive",{get:function(){o=!0}});try{const h=()=>{};a.addEventListener("test",h,c),a.removeEventListener("test",h,c)}catch{}return o}();function y(o){return/^[\s\xa0]*$/.test(o)}function Vt(o,c){T.call(this,o?o.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,o&&this.init(o,c)}g(Vt,T),Vt.prototype.init=function(o,c){const h=this.type=o.type,m=o.changedTouches&&o.changedTouches.length?o.changedTouches[0]:null;this.target=o.target||o.srcElement,this.g=c,c=o.relatedTarget,c||(h=="mouseover"?c=o.fromElement:h=="mouseout"&&(c=o.toElement)),this.relatedTarget=c,m?(this.clientX=m.clientX!==void 0?m.clientX:m.pageX,this.clientY=m.clientY!==void 0?m.clientY:m.pageY,this.screenX=m.screenX||0,this.screenY=m.screenY||0):(this.clientX=o.clientX!==void 0?o.clientX:o.pageX,this.clientY=o.clientY!==void 0?o.clientY:o.pageY,this.screenX=o.screenX||0,this.screenY=o.screenY||0),this.button=o.button,this.key=o.key||"",this.ctrlKey=o.ctrlKey,this.altKey=o.altKey,this.shiftKey=o.shiftKey,this.metaKey=o.metaKey,this.pointerId=o.pointerId||0,this.pointerType=o.pointerType,this.state=o.state,this.i=o,o.defaultPrevented&&Vt.Z.h.call(this)},Vt.prototype.h=function(){Vt.Z.h.call(this);const o=this.i;o.preventDefault?o.preventDefault():o.returnValue=!1};var Ne="closure_listenable_"+(Math.random()*1e6|0),Af=0;function bf(o,c,h,m,A){this.listener=o,this.proxy=null,this.src=c,this.type=h,this.capture=!!m,this.ha=A,this.key=++Af,this.da=this.fa=!1}function cs(o){o.da=!0,o.listener=null,o.proxy=null,o.src=null,o.ha=null}function ls(o,c,h){for(const m in o)c.call(h,o[m],m,o)}function Rf(o,c){for(const h in o)c.call(void 0,o[h],h,o)}function Xa(o){const c={};for(const h in o)c[h]=o[h];return c}const Za="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function tu(o,c){let h,m;for(let A=1;A<arguments.length;A++){m=arguments[A];for(h in m)o[h]=m[h];for(let R=0;R<Za.length;R++)h=Za[R],Object.prototype.hasOwnProperty.call(m,h)&&(o[h]=m[h])}}function hs(o){this.src=o,this.g={},this.h=0}hs.prototype.add=function(o,c,h,m,A){const R=o.toString();o=this.g[R],o||(o=this.g[R]=[],this.h++);const x=Ui(o,c,m,A);return x>-1?(c=o[x],h||(c.fa=!1)):(c=new bf(c,this.src,R,!!m,A),c.fa=h,o.push(c)),c};function Bi(o,c){const h=c.type;if(h in o.g){var m=o.g[h],A=Array.prototype.indexOf.call(m,c,void 0),R;(R=A>=0)&&Array.prototype.splice.call(m,A,1),R&&(cs(c),o.g[h].length==0&&(delete o.g[h],o.h--))}}function Ui(o,c,h,m){for(let A=0;A<o.length;++A){const R=o[A];if(!R.da&&R.listener==c&&R.capture==!!h&&R.ha==m)return A}return-1}var qi="closure_lm_"+(Math.random()*1e6|0),ji={};function eu(o,c,h,m,A){if(Array.isArray(c)){for(let R=0;R<c.length;R++)eu(o,c[R],h,m,A);return null}return h=su(h),o&&o[Ne]?o.J(c,h,u(m)?!!m.capture:!1,A):Sf(o,c,h,!1,m,A)}function Sf(o,c,h,m,A,R){if(!c)throw Error("Invalid event type");const x=u(A)?!!A.capture:!!A;let z=$i(o);if(z||(o[qi]=z=new hs(o)),h=z.add(c,h,m,x,R),h.proxy)return h;if(m=Pf(),h.proxy=m,m.src=o,m.listener=h,o.addEventListener)b||(A=x),A===void 0&&(A=!1),o.addEventListener(c.toString(),m,A);else if(o.attachEvent)o.attachEvent(ru(c.toString()),m);else if(o.addListener&&o.removeListener)o.addListener(m);else throw Error("addEventListener and attachEvent are unavailable.");return h}function Pf(){function o(h){return c.call(o.src,o.listener,h)}const c=Vf;return o}function nu(o,c,h,m,A){if(Array.isArray(c))for(var R=0;R<c.length;R++)nu(o,c[R],h,m,A);else m=u(m)?!!m.capture:!!m,h=su(h),o&&o[Ne]?(o=o.i,R=String(c).toString(),R in o.g&&(c=o.g[R],h=Ui(c,h,m,A),h>-1&&(cs(c[h]),Array.prototype.splice.call(c,h,1),c.length==0&&(delete o.g[R],o.h--)))):o&&(o=$i(o))&&(c=o.g[c.toString()],o=-1,c&&(o=Ui(c,h,m,A)),(h=o>-1?c[o]:null)&&zi(h))}function zi(o){if(typeof o!="number"&&o&&!o.da){var c=o.src;if(c&&c[Ne])Bi(c.i,o);else{var h=o.type,m=o.proxy;c.removeEventListener?c.removeEventListener(h,m,o.capture):c.detachEvent?c.detachEvent(ru(h),m):c.addListener&&c.removeListener&&c.removeListener(m),(h=$i(c))?(Bi(h,o),h.h==0&&(h.src=null,c[qi]=null)):cs(o)}}}function ru(o){return o in ji?ji[o]:ji[o]="on"+o}function Vf(o,c){if(o.da)o=!0;else{c=new Vt(c,this);const h=o.listener,m=o.ha||o.src;o.fa&&zi(o),o=h.call(m,c)}return o}function $i(o){return o=o[qi],o instanceof hs?o:null}var Gi="__closure_events_fn_"+(Math.random()*1e9>>>0);function su(o){return typeof o=="function"?o:(o[Gi]||(o[Gi]=function(c){return o.handleEvent(c)}),o[Gi])}function It(){w.call(this),this.i=new hs(this),this.M=this,this.G=null}g(It,w),It.prototype[Ne]=!0,It.prototype.removeEventListener=function(o,c,h,m){nu(this,o,c,h,m)};function Rt(o,c){var h,m=o.G;if(m)for(h=[];m;m=m.G)h.push(m);if(o=o.M,m=c.type||c,typeof c=="string")c=new T(c,o);else if(c instanceof T)c.target=c.target||o;else{var A=c;c=new T(m,o),tu(c,A)}A=!0;let R,x;if(h)for(x=h.length-1;x>=0;x--)R=c.g=h[x],A=ds(R,m,!0,c)&&A;if(R=c.g=o,A=ds(R,m,!0,c)&&A,A=ds(R,m,!1,c)&&A,h)for(x=0;x<h.length;x++)R=c.g=h[x],A=ds(R,m,!1,c)&&A}It.prototype.N=function(){if(It.Z.N.call(this),this.i){var o=this.i;for(const c in o.g){const h=o.g[c];for(let m=0;m<h.length;m++)cs(h[m]);delete o.g[c],o.h--}}this.G=null},It.prototype.J=function(o,c,h,m){return this.i.add(String(o),c,!1,h,m)},It.prototype.K=function(o,c,h,m){return this.i.add(String(o),c,!0,h,m)};function ds(o,c,h,m){if(c=o.i.g[String(c)],!c)return!0;c=c.concat();let A=!0;for(let R=0;R<c.length;++R){const x=c[R];if(x&&!x.da&&x.capture==h){const z=x.listener,mt=x.ha||x.src;x.fa&&Bi(o.i,x),A=z.call(mt,m)!==!1&&A}}return A&&!m.defaultPrevented}function Cf(o,c){if(typeof o!="function")if(o&&typeof o.handleEvent=="function")o=d(o.handleEvent,o);else throw Error("Invalid listener argument");return Number(c)>2147483647?-1:a.setTimeout(o,c||0)}function iu(o){o.g=Cf(()=>{o.g=null,o.i&&(o.i=!1,iu(o))},o.l);const c=o.h;o.h=null,o.m.apply(null,c)}class Df extends w{constructor(c,h){super(),this.m=c,this.l=h,this.h=null,this.i=!1,this.g=null}j(c){this.h=arguments,this.g?this.i=!0:iu(this)}N(){super.N(),this.g&&(a.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function tr(o){w.call(this),this.h=o,this.g={}}g(tr,w);var ou=[];function au(o){ls(o.g,function(c,h){this.g.hasOwnProperty(h)&&zi(c)},o),o.g={}}tr.prototype.N=function(){tr.Z.N.call(this),au(this)},tr.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var Ki=a.JSON.stringify,xf=a.JSON.parse,Nf=class{stringify(o){return a.JSON.stringify(o,void 0)}parse(o){return a.JSON.parse(o,void 0)}};function uu(){}function cu(){}var er={OPEN:"a",hb:"b",ERROR:"c",tb:"d"};function Hi(){T.call(this,"d")}g(Hi,T);function Wi(){T.call(this,"c")}g(Wi,T);var ke={},lu=null;function fs(){return lu=lu||new It}ke.Ia="serverreachability";function hu(o){T.call(this,ke.Ia,o)}g(hu,T);function nr(o){const c=fs();Rt(c,new hu(c))}ke.STAT_EVENT="statevent";function du(o,c){T.call(this,ke.STAT_EVENT,o),this.stat=c}g(du,T);function St(o){const c=fs();Rt(c,new du(c,o))}ke.Ja="timingevent";function fu(o,c){T.call(this,ke.Ja,o),this.size=c}g(fu,T);function rr(o,c){if(typeof o!="function")throw Error("Fn must not be null and must be a function");return a.setTimeout(function(){o()},c)}function sr(){this.g=!0}sr.prototype.ua=function(){this.g=!1};function kf(o,c,h,m,A,R){o.info(function(){if(o.g)if(R){var x="",z=R.split("&");for(let nt=0;nt<z.length;nt++){var mt=z[nt].split("=");if(mt.length>1){const pt=mt[0];mt=mt[1];const zt=pt.split("_");x=zt.length>=2&&zt[1]=="type"?x+(pt+"="+mt+"&"):x+(pt+"=redacted&")}}}else x=null;else x=R;return"XMLHTTP REQ ("+m+") [attempt "+A+"]: "+c+`
`+h+`
`+x})}function Mf(o,c,h,m,A,R,x){o.info(function(){return"XMLHTTP RESP ("+m+") [ attempt "+A+"]: "+c+`
`+h+`
`+R+" "+x})}function cn(o,c,h,m){o.info(function(){return"XMLHTTP TEXT ("+c+"): "+Ff(o,h)+(m?" "+m:"")})}function Of(o,c){o.info(function(){return"TIMEOUT: "+c})}sr.prototype.info=function(){};function Ff(o,c){if(!o.g)return c;if(!c)return null;try{const R=JSON.parse(c);if(R){for(o=0;o<R.length;o++)if(Array.isArray(R[o])){var h=R[o];if(!(h.length<2)){var m=h[1];if(Array.isArray(m)&&!(m.length<1)){var A=m[0];if(A!="noop"&&A!="stop"&&A!="close")for(let x=1;x<m.length;x++)m[x]=""}}}}return Ki(R)}catch{return c}}var ms={NO_ERROR:0,cb:1,qb:2,pb:3,kb:4,ob:5,rb:6,Ga:7,TIMEOUT:8,ub:9},mu={ib:"complete",Fb:"success",ERROR:"error",Ga:"abort",xb:"ready",yb:"readystatechange",TIMEOUT:"timeout",sb:"incrementaldata",wb:"progress",lb:"downloadprogress",Nb:"uploadprogress"},gu;function Qi(){}g(Qi,uu),Qi.prototype.g=function(){return new XMLHttpRequest},gu=new Qi;function ir(o){return encodeURIComponent(String(o))}function Lf(o){var c=1;o=o.split(":");const h=[];for(;c>0&&o.length;)h.push(o.shift()),c--;return o.length&&h.push(o.join(":")),h}function oe(o,c,h,m){this.j=o,this.i=c,this.l=h,this.S=m||1,this.V=new tr(this),this.H=45e3,this.J=null,this.o=!1,this.u=this.B=this.A=this.M=this.F=this.T=this.D=null,this.G=[],this.g=null,this.C=0,this.m=this.v=null,this.X=-1,this.K=!1,this.P=0,this.O=null,this.W=this.L=this.U=this.R=!1,this.h=new pu}function pu(){this.i=null,this.g="",this.h=!1}var _u={},Ji={};function Yi(o,c,h){o.M=1,o.A=ps(jt(c)),o.u=h,o.R=!0,yu(o,null)}function yu(o,c){o.F=Date.now(),gs(o),o.B=jt(o.A);var h=o.B,m=o.S;Array.isArray(m)||(m=[String(m)]),Du(h.i,"t",m),o.C=0,h=o.j.L,o.h=new pu,o.g=Qu(o.j,h?c:null,!o.u),o.P>0&&(o.O=new Df(d(o.Y,o,o.g),o.P)),c=o.V,h=o.g,m=o.ba;var A="readystatechange";Array.isArray(A)||(A&&(ou[0]=A.toString()),A=ou);for(let R=0;R<A.length;R++){const x=eu(h,A[R],m||c.handleEvent,!1,c.h||c);if(!x)break;c.g[x.key]=x}c=o.J?Xa(o.J):{},o.u?(o.v||(o.v="POST"),c["Content-Type"]="application/x-www-form-urlencoded",o.g.ea(o.B,o.v,o.u,c)):(o.v="GET",o.g.ea(o.B,o.v,null,c)),nr(),kf(o.i,o.v,o.B,o.l,o.S,o.u)}oe.prototype.ba=function(o){o=o.target;const c=this.O;c&&ce(o)==3?c.j():this.Y(o)},oe.prototype.Y=function(o){try{if(o==this.g)t:{const z=ce(this.g),mt=this.g.ya(),nt=this.g.ca();if(!(z<3)&&(z!=3||this.g&&(this.h.h||this.g.la()||Lu(this.g)))){this.K||z!=4||mt==7||(mt==8||nt<=0?nr(3):nr(2)),Xi(this);var c=this.g.ca();this.X=c;var h=Bf(this);if(this.o=c==200,Mf(this.i,this.v,this.B,this.l,this.S,z,c),this.o){if(this.U&&!this.L){e:{if(this.g){var m,A=this.g;if((m=A.g?A.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!y(m)){var R=m;break e}}R=null}if(o=R)cn(this.i,this.l,o,"Initial handshake response via X-HTTP-Initial-Response"),this.L=!0,Zi(this,o);else{this.o=!1,this.m=3,St(12),Me(this),or(this);break t}}if(this.R){o=!0;let pt;for(;!this.K&&this.C<h.length;)if(pt=Uf(this,h),pt==Ji){z==4&&(this.m=4,St(14),o=!1),cn(this.i,this.l,null,"[Incomplete Response]");break}else if(pt==_u){this.m=4,St(15),cn(this.i,this.l,h,"[Invalid Chunk]"),o=!1;break}else cn(this.i,this.l,pt,null),Zi(this,pt);if(Iu(this)&&this.C!=0&&(this.h.g=this.h.g.slice(this.C),this.C=0),z!=4||h.length!=0||this.h.h||(this.m=1,St(16),o=!1),this.o=this.o&&o,!o)cn(this.i,this.l,h,"[Invalid Chunked Response]"),Me(this),or(this);else if(h.length>0&&!this.W){this.W=!0;var x=this.j;x.g==this&&x.aa&&!x.P&&(x.j.info("Great, no buffering proxy detected. Bytes received: "+h.length),ao(x),x.P=!0,St(11))}}else cn(this.i,this.l,h,null),Zi(this,h);z==4&&Me(this),this.o&&!this.K&&(z==4?Gu(this.j,this):(this.o=!1,gs(this)))}else tm(this.g),c==400&&h.indexOf("Unknown SID")>0?(this.m=3,St(12)):(this.m=0,St(13)),Me(this),or(this)}}}catch{}finally{}};function Bf(o){if(!Iu(o))return o.g.la();const c=Lu(o.g);if(c==="")return"";let h="";const m=c.length,A=ce(o.g)==4;if(!o.h.i){if(typeof TextDecoder>"u")return Me(o),or(o),"";o.h.i=new a.TextDecoder}for(let R=0;R<m;R++)o.h.h=!0,h+=o.h.i.decode(c[R],{stream:!(A&&R==m-1)});return c.length=0,o.h.g+=h,o.C=0,o.h.g}function Iu(o){return o.g?o.v=="GET"&&o.M!=2&&o.j.Aa:!1}function Uf(o,c){var h=o.C,m=c.indexOf(`
`,h);return m==-1?Ji:(h=Number(c.substring(h,m)),isNaN(h)?_u:(m+=1,m+h>c.length?Ji:(c=c.slice(m,m+h),o.C=m+h,c)))}oe.prototype.cancel=function(){this.K=!0,Me(this)};function gs(o){o.T=Date.now()+o.H,Eu(o,o.H)}function Eu(o,c){if(o.D!=null)throw Error("WatchDog timer not null");o.D=rr(d(o.aa,o),c)}function Xi(o){o.D&&(a.clearTimeout(o.D),o.D=null)}oe.prototype.aa=function(){this.D=null;const o=Date.now();o-this.T>=0?(Of(this.i,this.B),this.M!=2&&(nr(),St(17)),Me(this),this.m=2,or(this)):Eu(this,this.T-o)};function or(o){o.j.I==0||o.K||Gu(o.j,o)}function Me(o){Xi(o);var c=o.O;c&&typeof c.dispose=="function"&&c.dispose(),o.O=null,au(o.V),o.g&&(c=o.g,o.g=null,c.abort(),c.dispose())}function Zi(o,c){try{var h=o.j;if(h.I!=0&&(h.g==o||to(h.h,o))){if(!o.L&&to(h.h,o)&&h.I==3){try{var m=h.Ba.g.parse(c)}catch{m=null}if(Array.isArray(m)&&m.length==3){var A=m;if(A[0]==0){t:if(!h.v){if(h.g)if(h.g.F+3e3<o.F)Ts(h),Is(h);else break t;oo(h),St(18)}}else h.xa=A[1],0<h.xa-h.K&&A[2]<37500&&h.F&&h.A==0&&!h.C&&(h.C=rr(d(h.Va,h),6e3));vu(h.h)<=1&&h.ta&&(h.ta=void 0)}else Fe(h,11)}else if((o.L||h.g==o)&&Ts(h),!y(c))for(A=h.Ba.g.parse(c),c=0;c<A.length;c++){let nt=A[c];const pt=nt[0];if(!(pt<=h.K))if(h.K=pt,nt=nt[1],h.I==2)if(nt[0]=="c"){h.M=nt[1],h.ba=nt[2];const zt=nt[3];zt!=null&&(h.ka=zt,h.j.info("VER="+h.ka));const Le=nt[4];Le!=null&&(h.za=Le,h.j.info("SVER="+h.za));const le=nt[5];le!=null&&typeof le=="number"&&le>0&&(m=1.5*le,h.O=m,h.j.info("backChannelRequestTimeoutMs_="+m)),m=h;const he=o.g;if(he){const vs=he.g?he.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(vs){var R=m.h;R.g||vs.indexOf("spdy")==-1&&vs.indexOf("quic")==-1&&vs.indexOf("h2")==-1||(R.j=R.l,R.g=new Set,R.h&&(eo(R,R.h),R.h=null))}if(m.G){const uo=he.g?he.g.getResponseHeader("X-HTTP-Session-Id"):null;uo&&(m.wa=uo,st(m.J,m.G,uo))}}h.I=3,h.l&&h.l.ra(),h.aa&&(h.T=Date.now()-o.F,h.j.info("Handshake RTT: "+h.T+"ms")),m=h;var x=o;if(m.na=Wu(m,m.L?m.ba:null,m.W),x.L){Au(m.h,x);var z=x,mt=m.O;mt&&(z.H=mt),z.D&&(Xi(z),gs(z)),m.g=x}else zu(m);h.i.length>0&&Es(h)}else nt[0]!="stop"&&nt[0]!="close"||Fe(h,7);else h.I==3&&(nt[0]=="stop"||nt[0]=="close"?nt[0]=="stop"?Fe(h,7):io(h):nt[0]!="noop"&&h.l&&h.l.qa(nt),h.A=0)}}nr(4)}catch{}}var qf=class{constructor(o,c){this.g=o,this.map=c}};function Tu(o){this.l=o||10,a.PerformanceNavigationTiming?(o=a.performance.getEntriesByType("navigation"),o=o.length>0&&(o[0].nextHopProtocol=="hq"||o[0].nextHopProtocol=="h2")):o=!!(a.chrome&&a.chrome.loadTimes&&a.chrome.loadTimes()&&a.chrome.loadTimes().wasFetchedViaSpdy),this.j=o?this.l:1,this.g=null,this.j>1&&(this.g=new Set),this.h=null,this.i=[]}function wu(o){return o.h?!0:o.g?o.g.size>=o.j:!1}function vu(o){return o.h?1:o.g?o.g.size:0}function to(o,c){return o.h?o.h==c:o.g?o.g.has(c):!1}function eo(o,c){o.g?o.g.add(c):o.h=c}function Au(o,c){o.h&&o.h==c?o.h=null:o.g&&o.g.has(c)&&o.g.delete(c)}Tu.prototype.cancel=function(){if(this.i=bu(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&this.g.size!==0){for(const o of this.g.values())o.cancel();this.g.clear()}};function bu(o){if(o.h!=null)return o.i.concat(o.h.G);if(o.g!=null&&o.g.size!==0){let c=o.i;for(const h of o.g.values())c=c.concat(h.G);return c}return S(o.i)}var Ru=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function jf(o,c){if(o){o=o.split("&");for(let h=0;h<o.length;h++){const m=o[h].indexOf("=");let A,R=null;m>=0?(A=o[h].substring(0,m),R=o[h].substring(m+1)):A=o[h],c(A,R?decodeURIComponent(R.replace(/\+/g," ")):"")}}}function ae(o){this.g=this.o=this.j="",this.u=null,this.m=this.h="",this.l=!1;let c;o instanceof ae?(this.l=o.l,ar(this,o.j),this.o=o.o,this.g=o.g,ur(this,o.u),this.h=o.h,no(this,xu(o.i)),this.m=o.m):o&&(c=String(o).match(Ru))?(this.l=!1,ar(this,c[1]||"",!0),this.o=cr(c[2]||""),this.g=cr(c[3]||"",!0),ur(this,c[4]),this.h=cr(c[5]||"",!0),no(this,c[6]||"",!0),this.m=cr(c[7]||"")):(this.l=!1,this.i=new hr(null,this.l))}ae.prototype.toString=function(){const o=[];var c=this.j;c&&o.push(lr(c,Su,!0),":");var h=this.g;return(h||c=="file")&&(o.push("//"),(c=this.o)&&o.push(lr(c,Su,!0),"@"),o.push(ir(h).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),h=this.u,h!=null&&o.push(":",String(h))),(h=this.h)&&(this.g&&h.charAt(0)!="/"&&o.push("/"),o.push(lr(h,h.charAt(0)=="/"?Gf:$f,!0))),(h=this.i.toString())&&o.push("?",h),(h=this.m)&&o.push("#",lr(h,Hf)),o.join("")},ae.prototype.resolve=function(o){const c=jt(this);let h=!!o.j;h?ar(c,o.j):h=!!o.o,h?c.o=o.o:h=!!o.g,h?c.g=o.g:h=o.u!=null;var m=o.h;if(h)ur(c,o.u);else if(h=!!o.h){if(m.charAt(0)!="/")if(this.g&&!this.h)m="/"+m;else{var A=c.h.lastIndexOf("/");A!=-1&&(m=c.h.slice(0,A+1)+m)}if(A=m,A==".."||A==".")m="";else if(A.indexOf("./")!=-1||A.indexOf("/.")!=-1){m=A.lastIndexOf("/",0)==0,A=A.split("/");const R=[];for(let x=0;x<A.length;){const z=A[x++];z=="."?m&&x==A.length&&R.push(""):z==".."?((R.length>1||R.length==1&&R[0]!="")&&R.pop(),m&&x==A.length&&R.push("")):(R.push(z),m=!0)}m=R.join("/")}else m=A}return h?c.h=m:h=o.i.toString()!=="",h?no(c,xu(o.i)):h=!!o.m,h&&(c.m=o.m),c};function jt(o){return new ae(o)}function ar(o,c,h){o.j=h?cr(c,!0):c,o.j&&(o.j=o.j.replace(/:$/,""))}function ur(o,c){if(c){if(c=Number(c),isNaN(c)||c<0)throw Error("Bad port number "+c);o.u=c}else o.u=null}function no(o,c,h){c instanceof hr?(o.i=c,Wf(o.i,o.l)):(h||(c=lr(c,Kf)),o.i=new hr(c,o.l))}function st(o,c,h){o.i.set(c,h)}function ps(o){return st(o,"zx",Math.floor(Math.random()*2147483648).toString(36)+Math.abs(Math.floor(Math.random()*2147483648)^Date.now()).toString(36)),o}function cr(o,c){return o?c?decodeURI(o.replace(/%25/g,"%2525")):decodeURIComponent(o):""}function lr(o,c,h){return typeof o=="string"?(o=encodeURI(o).replace(c,zf),h&&(o=o.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),o):null}function zf(o){return o=o.charCodeAt(0),"%"+(o>>4&15).toString(16)+(o&15).toString(16)}var Su=/[#\/\?@]/g,$f=/[#\?:]/g,Gf=/[#\?]/g,Kf=/[#\?@]/g,Hf=/#/g;function hr(o,c){this.h=this.g=null,this.i=o||null,this.j=!!c}function Oe(o){o.g||(o.g=new Map,o.h=0,o.i&&jf(o.i,function(c,h){o.add(decodeURIComponent(c.replace(/\+/g," ")),h)}))}r=hr.prototype,r.add=function(o,c){Oe(this),this.i=null,o=ln(this,o);let h=this.g.get(o);return h||this.g.set(o,h=[]),h.push(c),this.h+=1,this};function Pu(o,c){Oe(o),c=ln(o,c),o.g.has(c)&&(o.i=null,o.h-=o.g.get(c).length,o.g.delete(c))}function Vu(o,c){return Oe(o),c=ln(o,c),o.g.has(c)}r.forEach=function(o,c){Oe(this),this.g.forEach(function(h,m){h.forEach(function(A){o.call(c,A,m,this)},this)},this)};function Cu(o,c){Oe(o);let h=[];if(typeof c=="string")Vu(o,c)&&(h=h.concat(o.g.get(ln(o,c))));else for(o=Array.from(o.g.values()),c=0;c<o.length;c++)h=h.concat(o[c]);return h}r.set=function(o,c){return Oe(this),this.i=null,o=ln(this,o),Vu(this,o)&&(this.h-=this.g.get(o).length),this.g.set(o,[c]),this.h+=1,this},r.get=function(o,c){return o?(o=Cu(this,o),o.length>0?String(o[0]):c):c};function Du(o,c,h){Pu(o,c),h.length>0&&(o.i=null,o.g.set(ln(o,c),S(h)),o.h+=h.length)}r.toString=function(){if(this.i)return this.i;if(!this.g)return"";const o=[],c=Array.from(this.g.keys());for(let m=0;m<c.length;m++){var h=c[m];const A=ir(h);h=Cu(this,h);for(let R=0;R<h.length;R++){let x=A;h[R]!==""&&(x+="="+ir(h[R])),o.push(x)}}return this.i=o.join("&")};function xu(o){const c=new hr;return c.i=o.i,o.g&&(c.g=new Map(o.g),c.h=o.h),c}function ln(o,c){return c=String(c),o.j&&(c=c.toLowerCase()),c}function Wf(o,c){c&&!o.j&&(Oe(o),o.i=null,o.g.forEach(function(h,m){const A=m.toLowerCase();m!=A&&(Pu(this,m),Du(this,A,h))},o)),o.j=c}function Qf(o,c){const h=new sr;if(a.Image){const m=new Image;m.onload=f(ue,h,"TestLoadImage: loaded",!0,c,m),m.onerror=f(ue,h,"TestLoadImage: error",!1,c,m),m.onabort=f(ue,h,"TestLoadImage: abort",!1,c,m),m.ontimeout=f(ue,h,"TestLoadImage: timeout",!1,c,m),a.setTimeout(function(){m.ontimeout&&m.ontimeout()},1e4),m.src=o}else c(!1)}function Jf(o,c){const h=new sr,m=new AbortController,A=setTimeout(()=>{m.abort(),ue(h,"TestPingServer: timeout",!1,c)},1e4);fetch(o,{signal:m.signal}).then(R=>{clearTimeout(A),R.ok?ue(h,"TestPingServer: ok",!0,c):ue(h,"TestPingServer: server error",!1,c)}).catch(()=>{clearTimeout(A),ue(h,"TestPingServer: error",!1,c)})}function ue(o,c,h,m,A){try{A&&(A.onload=null,A.onerror=null,A.onabort=null,A.ontimeout=null),m(h)}catch{}}function Yf(){this.g=new Nf}function ro(o){this.i=o.Sb||null,this.h=o.ab||!1}g(ro,uu),ro.prototype.g=function(){return new _s(this.i,this.h)};function _s(o,c){It.call(this),this.H=o,this.o=c,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.A=new Headers,this.h=null,this.F="GET",this.D="",this.g=!1,this.B=this.j=this.l=null,this.v=new AbortController}g(_s,It),r=_s.prototype,r.open=function(o,c){if(this.readyState!=0)throw this.abort(),Error("Error reopening a connection");this.F=o,this.D=c,this.readyState=1,fr(this)},r.send=function(o){if(this.readyState!=1)throw this.abort(),Error("need to call open() first. ");if(this.v.signal.aborted)throw this.abort(),Error("Request was aborted.");this.g=!0;const c={headers:this.A,method:this.F,credentials:this.m,cache:void 0,signal:this.v.signal};o&&(c.body=o),(this.H||a).fetch(new Request(this.D,c)).then(this.Pa.bind(this),this.ga.bind(this))},r.abort=function(){this.response=this.responseText="",this.A=new Headers,this.status=0,this.v.abort(),this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),this.readyState>=1&&this.g&&this.readyState!=4&&(this.g=!1,dr(this)),this.readyState=0},r.Pa=function(o){if(this.g&&(this.l=o,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=o.headers,this.readyState=2,fr(this)),this.g&&(this.readyState=3,fr(this),this.g)))if(this.responseType==="arraybuffer")o.arrayBuffer().then(this.Na.bind(this),this.ga.bind(this));else if(typeof a.ReadableStream<"u"&&"body"in o){if(this.j=o.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.B=new TextDecoder;Nu(this)}else o.text().then(this.Oa.bind(this),this.ga.bind(this))};function Nu(o){o.j.read().then(o.Ma.bind(o)).catch(o.ga.bind(o))}r.Ma=function(o){if(this.g){if(this.o&&o.value)this.response.push(o.value);else if(!this.o){var c=o.value?o.value:new Uint8Array(0);(c=this.B.decode(c,{stream:!o.done}))&&(this.response=this.responseText+=c)}o.done?dr(this):fr(this),this.readyState==3&&Nu(this)}},r.Oa=function(o){this.g&&(this.response=this.responseText=o,dr(this))},r.Na=function(o){this.g&&(this.response=o,dr(this))},r.ga=function(){this.g&&dr(this)};function dr(o){o.readyState=4,o.l=null,o.j=null,o.B=null,fr(o)}r.setRequestHeader=function(o,c){this.A.append(o,c)},r.getResponseHeader=function(o){return this.h&&this.h.get(o.toLowerCase())||""},r.getAllResponseHeaders=function(){if(!this.h)return"";const o=[],c=this.h.entries();for(var h=c.next();!h.done;)h=h.value,o.push(h[0]+": "+h[1]),h=c.next();return o.join(`\r
`)};function fr(o){o.onreadystatechange&&o.onreadystatechange.call(o)}Object.defineProperty(_s.prototype,"withCredentials",{get:function(){return this.m==="include"},set:function(o){this.m=o?"include":"same-origin"}});function ku(o){let c="";return ls(o,function(h,m){c+=m,c+=":",c+=h,c+=`\r
`}),c}function so(o,c,h){t:{for(m in h){var m=!1;break t}m=!0}m||(h=ku(h),typeof o=="string"?h!=null&&ir(h):st(o,c,h))}function ut(o){It.call(this),this.headers=new Map,this.L=o||null,this.h=!1,this.g=null,this.D="",this.o=0,this.l="",this.j=this.B=this.v=this.A=!1,this.m=null,this.F="",this.H=!1}g(ut,It);var Xf=/^https?$/i,Zf=["POST","PUT"];r=ut.prototype,r.Fa=function(o){this.H=o},r.ea=function(o,c,h,m){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+o);c=c?c.toUpperCase():"GET",this.D=o,this.l="",this.o=0,this.A=!1,this.h=!0,this.g=this.L?this.L.g():gu.g(),this.g.onreadystatechange=_(d(this.Ca,this));try{this.B=!0,this.g.open(c,String(o),!0),this.B=!1}catch(R){Mu(this,R);return}if(o=h||"",h=new Map(this.headers),m)if(Object.getPrototypeOf(m)===Object.prototype)for(var A in m)h.set(A,m[A]);else if(typeof m.keys=="function"&&typeof m.get=="function")for(const R of m.keys())h.set(R,m.get(R));else throw Error("Unknown input type for opt_headers: "+String(m));m=Array.from(h.keys()).find(R=>R.toLowerCase()=="content-type"),A=a.FormData&&o instanceof a.FormData,!(Array.prototype.indexOf.call(Zf,c,void 0)>=0)||m||A||h.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(const[R,x]of h)this.g.setRequestHeader(R,x);this.F&&(this.g.responseType=this.F),"withCredentials"in this.g&&this.g.withCredentials!==this.H&&(this.g.withCredentials=this.H);try{this.m&&(clearTimeout(this.m),this.m=null),this.v=!0,this.g.send(o),this.v=!1}catch(R){Mu(this,R)}};function Mu(o,c){o.h=!1,o.g&&(o.j=!0,o.g.abort(),o.j=!1),o.l=c,o.o=5,Ou(o),ys(o)}function Ou(o){o.A||(o.A=!0,Rt(o,"complete"),Rt(o,"error"))}r.abort=function(o){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.o=o||7,Rt(this,"complete"),Rt(this,"abort"),ys(this))},r.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),ys(this,!0)),ut.Z.N.call(this)},r.Ca=function(){this.u||(this.B||this.v||this.j?Fu(this):this.Xa())},r.Xa=function(){Fu(this)};function Fu(o){if(o.h&&typeof i<"u"){if(o.v&&ce(o)==4)setTimeout(o.Ca.bind(o),0);else if(Rt(o,"readystatechange"),ce(o)==4){o.h=!1;try{const R=o.ca();t:switch(R){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var c=!0;break t;default:c=!1}var h;if(!(h=c)){var m;if(m=R===0){let x=String(o.D).match(Ru)[1]||null;!x&&a.self&&a.self.location&&(x=a.self.location.protocol.slice(0,-1)),m=!Xf.test(x?x.toLowerCase():"")}h=m}if(h)Rt(o,"complete"),Rt(o,"success");else{o.o=6;try{var A=ce(o)>2?o.g.statusText:""}catch{A=""}o.l=A+" ["+o.ca()+"]",Ou(o)}}finally{ys(o)}}}}function ys(o,c){if(o.g){o.m&&(clearTimeout(o.m),o.m=null);const h=o.g;o.g=null,c||Rt(o,"ready");try{h.onreadystatechange=null}catch{}}}r.isActive=function(){return!!this.g};function ce(o){return o.g?o.g.readyState:0}r.ca=function(){try{return ce(this)>2?this.g.status:-1}catch{return-1}},r.la=function(){try{return this.g?this.g.responseText:""}catch{return""}},r.La=function(o){if(this.g){var c=this.g.responseText;return o&&c.indexOf(o)==0&&(c=c.substring(o.length)),xf(c)}};function Lu(o){try{if(!o.g)return null;if("response"in o.g)return o.g.response;switch(o.F){case"":case"text":return o.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in o.g)return o.g.mozResponseArrayBuffer}return null}catch{return null}}function tm(o){const c={};o=(o.g&&ce(o)>=2&&o.g.getAllResponseHeaders()||"").split(`\r
`);for(let m=0;m<o.length;m++){if(y(o[m]))continue;var h=Lf(o[m]);const A=h[0];if(h=h[1],typeof h!="string")continue;h=h.trim();const R=c[A]||[];c[A]=R,R.push(h)}Rf(c,function(m){return m.join(", ")})}r.ya=function(){return this.o},r.Ha=function(){return typeof this.l=="string"?this.l:String(this.l)};function mr(o,c,h){return h&&h.internalChannelParams&&h.internalChannelParams[o]||c}function Bu(o){this.za=0,this.i=[],this.j=new sr,this.ba=this.na=this.J=this.W=this.g=this.wa=this.G=this.H=this.u=this.U=this.o=null,this.Ya=this.V=0,this.Sa=mr("failFast",!1,o),this.F=this.C=this.v=this.m=this.l=null,this.X=!0,this.xa=this.K=-1,this.Y=this.A=this.D=0,this.Qa=mr("baseRetryDelayMs",5e3,o),this.Za=mr("retryDelaySeedMs",1e4,o),this.Ta=mr("forwardChannelMaxRetries",2,o),this.va=mr("forwardChannelRequestTimeoutMs",2e4,o),this.ma=o&&o.xmlHttpFactory||void 0,this.Ua=o&&o.Rb||void 0,this.Aa=o&&o.useFetchStreams||!1,this.O=void 0,this.L=o&&o.supportsCrossDomainXhr||!1,this.M="",this.h=new Tu(o&&o.concurrentRequestLimit),this.Ba=new Yf,this.S=o&&o.fastHandshake||!1,this.R=o&&o.encodeInitMessageHeaders||!1,this.S&&this.R&&(this.R=!1),this.Ra=o&&o.Pb||!1,o&&o.ua&&this.j.ua(),o&&o.forceLongPolling&&(this.X=!1),this.aa=!this.S&&this.X&&o&&o.detectBufferingProxy||!1,this.ia=void 0,o&&o.longPollingTimeout&&o.longPollingTimeout>0&&(this.ia=o.longPollingTimeout),this.ta=void 0,this.T=0,this.P=!1,this.ja=this.B=null}r=Bu.prototype,r.ka=8,r.I=1,r.connect=function(o,c,h,m){St(0),this.W=o,this.H=c||{},h&&m!==void 0&&(this.H.OSID=h,this.H.OAID=m),this.F=this.X,this.J=Wu(this,null,this.W),Es(this)};function io(o){if(Uu(o),o.I==3){var c=o.V++,h=jt(o.J);if(st(h,"SID",o.M),st(h,"RID",c),st(h,"TYPE","terminate"),gr(o,h),c=new oe(o,o.j,c),c.M=2,c.A=ps(jt(h)),h=!1,a.navigator&&a.navigator.sendBeacon)try{h=a.navigator.sendBeacon(c.A.toString(),"")}catch{}!h&&a.Image&&(new Image().src=c.A,h=!0),h||(c.g=Qu(c.j,null),c.g.ea(c.A)),c.F=Date.now(),gs(c)}Hu(o)}function Is(o){o.g&&(ao(o),o.g.cancel(),o.g=null)}function Uu(o){Is(o),o.v&&(a.clearTimeout(o.v),o.v=null),Ts(o),o.h.cancel(),o.m&&(typeof o.m=="number"&&a.clearTimeout(o.m),o.m=null)}function Es(o){if(!wu(o.h)&&!o.m){o.m=!0;var c=o.Ea;Y||p(),Q||(Y(),Q=!0),E.add(c,o),o.D=0}}function em(o,c){return vu(o.h)>=o.h.j-(o.m?1:0)?!1:o.m?(o.i=c.G.concat(o.i),!0):o.I==1||o.I==2||o.D>=(o.Sa?0:o.Ta)?!1:(o.m=rr(d(o.Ea,o,c),Ku(o,o.D)),o.D++,!0)}r.Ea=function(o){if(this.m)if(this.m=null,this.I==1){if(!o){this.V=Math.floor(Math.random()*1e5),o=this.V++;const A=new oe(this,this.j,o);let R=this.o;if(this.U&&(R?(R=Xa(R),tu(R,this.U)):R=this.U),this.u!==null||this.R||(A.J=R,R=null),this.S)t:{for(var c=0,h=0;h<this.i.length;h++){e:{var m=this.i[h];if("__data__"in m.map&&(m=m.map.__data__,typeof m=="string")){m=m.length;break e}m=void 0}if(m===void 0)break;if(c+=m,c>4096){c=h;break t}if(c===4096||h===this.i.length-1){c=h+1;break t}}c=1e3}else c=1e3;c=ju(this,A,c),h=jt(this.J),st(h,"RID",o),st(h,"CVER",22),this.G&&st(h,"X-HTTP-Session-Id",this.G),gr(this,h),R&&(this.R?c="headers="+ir(ku(R))+"&"+c:this.u&&so(h,this.u,R)),eo(this.h,A),this.Ra&&st(h,"TYPE","init"),this.S?(st(h,"$req",c),st(h,"SID","null"),A.U=!0,Yi(A,h,null)):Yi(A,h,c),this.I=2}}else this.I==3&&(o?qu(this,o):this.i.length==0||wu(this.h)||qu(this))};function qu(o,c){var h;c?h=c.l:h=o.V++;const m=jt(o.J);st(m,"SID",o.M),st(m,"RID",h),st(m,"AID",o.K),gr(o,m),o.u&&o.o&&so(m,o.u,o.o),h=new oe(o,o.j,h,o.D+1),o.u===null&&(h.J=o.o),c&&(o.i=c.G.concat(o.i)),c=ju(o,h,1e3),h.H=Math.round(o.va*.5)+Math.round(o.va*.5*Math.random()),eo(o.h,h),Yi(h,m,c)}function gr(o,c){o.H&&ls(o.H,function(h,m){st(c,m,h)}),o.l&&ls({},function(h,m){st(c,m,h)})}function ju(o,c,h){h=Math.min(o.i.length,h);const m=o.l?d(o.l.Ka,o.l,o):null;t:{var A=o.i;let z=-1;for(;;){const mt=["count="+h];z==-1?h>0?(z=A[0].g,mt.push("ofs="+z)):z=0:mt.push("ofs="+z);let nt=!0;for(let pt=0;pt<h;pt++){var R=A[pt].g;const zt=A[pt].map;if(R-=z,R<0)z=Math.max(0,A[pt].g-100),nt=!1;else try{R="req"+R+"_"||"";try{var x=zt instanceof Map?zt:Object.entries(zt);for(const[Le,le]of x){let he=le;u(le)&&(he=Ki(le)),mt.push(R+Le+"="+encodeURIComponent(he))}}catch(Le){throw mt.push(R+"type="+encodeURIComponent("_badmap")),Le}}catch{m&&m(zt)}}if(nt){x=mt.join("&");break t}}x=void 0}return o=o.i.splice(0,h),c.G=o,x}function zu(o){if(!o.g&&!o.v){o.Y=1;var c=o.Da;Y||p(),Q||(Y(),Q=!0),E.add(c,o),o.A=0}}function oo(o){return o.g||o.v||o.A>=3?!1:(o.Y++,o.v=rr(d(o.Da,o),Ku(o,o.A)),o.A++,!0)}r.Da=function(){if(this.v=null,$u(this),this.aa&&!(this.P||this.g==null||this.T<=0)){var o=4*this.T;this.j.info("BP detection timer enabled: "+o),this.B=rr(d(this.Wa,this),o)}},r.Wa=function(){this.B&&(this.B=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.P=!0,St(10),Is(this),$u(this))};function ao(o){o.B!=null&&(a.clearTimeout(o.B),o.B=null)}function $u(o){o.g=new oe(o,o.j,"rpc",o.Y),o.u===null&&(o.g.J=o.o),o.g.P=0;var c=jt(o.na);st(c,"RID","rpc"),st(c,"SID",o.M),st(c,"AID",o.K),st(c,"CI",o.F?"0":"1"),!o.F&&o.ia&&st(c,"TO",o.ia),st(c,"TYPE","xmlhttp"),gr(o,c),o.u&&o.o&&so(c,o.u,o.o),o.O&&(o.g.H=o.O);var h=o.g;o=o.ba,h.M=1,h.A=ps(jt(c)),h.u=null,h.R=!0,yu(h,o)}r.Va=function(){this.C!=null&&(this.C=null,Is(this),oo(this),St(19))};function Ts(o){o.C!=null&&(a.clearTimeout(o.C),o.C=null)}function Gu(o,c){var h=null;if(o.g==c){Ts(o),ao(o),o.g=null;var m=2}else if(to(o.h,c))h=c.G,Au(o.h,c),m=1;else return;if(o.I!=0){if(c.o)if(m==1){h=c.u?c.u.length:0,c=Date.now()-c.F;var A=o.D;m=fs(),Rt(m,new fu(m,h)),Es(o)}else zu(o);else if(A=c.m,A==3||A==0&&c.X>0||!(m==1&&em(o,c)||m==2&&oo(o)))switch(h&&h.length>0&&(c=o.h,c.i=c.i.concat(h)),A){case 1:Fe(o,5);break;case 4:Fe(o,10);break;case 3:Fe(o,6);break;default:Fe(o,2)}}}function Ku(o,c){let h=o.Qa+Math.floor(Math.random()*o.Za);return o.isActive()||(h*=2),h*c}function Fe(o,c){if(o.j.info("Error code "+c),c==2){var h=d(o.bb,o),m=o.Ua;const A=!m;m=new ae(m||"//www.google.com/images/cleardot.gif"),a.location&&a.location.protocol=="http"||ar(m,"https"),ps(m),A?Qf(m.toString(),h):Jf(m.toString(),h)}else St(2);o.I=0,o.l&&o.l.pa(c),Hu(o),Uu(o)}r.bb=function(o){o?(this.j.info("Successfully pinged google.com"),St(2)):(this.j.info("Failed to ping google.com"),St(1))};function Hu(o){if(o.I=0,o.ja=[],o.l){const c=bu(o.h);(c.length!=0||o.i.length!=0)&&(D(o.ja,c),D(o.ja,o.i),o.h.i.length=0,S(o.i),o.i.length=0),o.l.oa()}}function Wu(o,c,h){var m=h instanceof ae?jt(h):new ae(h);if(m.g!="")c&&(m.g=c+"."+m.g),ur(m,m.u);else{var A=a.location;m=A.protocol,c=c?c+"."+A.hostname:A.hostname,A=+A.port;const R=new ae(null);m&&ar(R,m),c&&(R.g=c),A&&ur(R,A),h&&(R.h=h),m=R}return h=o.G,c=o.wa,h&&c&&st(m,h,c),st(m,"VER",o.ka),gr(o,m),m}function Qu(o,c,h){if(c&&!o.L)throw Error("Can't create secondary domain capable XhrIo object.");return c=o.Aa&&!o.ma?new ut(new ro({ab:h})):new ut(o.ma),c.Fa(o.L),c}r.isActive=function(){return!!this.l&&this.l.isActive(this)};function Ju(){}r=Ju.prototype,r.ra=function(){},r.qa=function(){},r.pa=function(){},r.oa=function(){},r.isActive=function(){return!0},r.Ka=function(){};function ws(){}ws.prototype.g=function(o,c){return new Nt(o,c)};function Nt(o,c){It.call(this),this.g=new Bu(c),this.l=o,this.h=c&&c.messageUrlParams||null,o=c&&c.messageHeaders||null,c&&c.clientProtocolHeaderRequired&&(o?o["X-Client-Protocol"]="webchannel":o={"X-Client-Protocol":"webchannel"}),this.g.o=o,o=c&&c.initMessageHeaders||null,c&&c.messageContentType&&(o?o["X-WebChannel-Content-Type"]=c.messageContentType:o={"X-WebChannel-Content-Type":c.messageContentType}),c&&c.sa&&(o?o["X-WebChannel-Client-Profile"]=c.sa:o={"X-WebChannel-Client-Profile":c.sa}),this.g.U=o,(o=c&&c.Qb)&&!y(o)&&(this.g.u=o),this.A=c&&c.supportsCrossDomainXhr||!1,this.v=c&&c.sendRawJson||!1,(c=c&&c.httpSessionIdParam)&&!y(c)&&(this.g.G=c,o=this.h,o!==null&&c in o&&(o=this.h,c in o&&delete o[c])),this.j=new hn(this)}g(Nt,It),Nt.prototype.m=function(){this.g.l=this.j,this.A&&(this.g.L=!0),this.g.connect(this.l,this.h||void 0)},Nt.prototype.close=function(){io(this.g)},Nt.prototype.o=function(o){var c=this.g;if(typeof o=="string"){var h={};h.__data__=o,o=h}else this.v&&(h={},h.__data__=Ki(o),o=h);c.i.push(new qf(c.Ya++,o)),c.I==3&&Es(c)},Nt.prototype.N=function(){this.g.l=null,delete this.j,io(this.g),delete this.g,Nt.Z.N.call(this)};function Yu(o){Hi.call(this),o.__headers__&&(this.headers=o.__headers__,this.statusCode=o.__status__,delete o.__headers__,delete o.__status__);var c=o.__sm__;if(c){t:{for(const h in c){o=h;break t}o=void 0}(this.i=o)&&(o=this.i,c=c!==null&&o in c?c[o]:void 0),this.data=c}else this.data=o}g(Yu,Hi);function Xu(){Wi.call(this),this.status=1}g(Xu,Wi);function hn(o){this.g=o}g(hn,Ju),hn.prototype.ra=function(){Rt(this.g,"a")},hn.prototype.qa=function(o){Rt(this.g,new Yu(o))},hn.prototype.pa=function(o){Rt(this.g,new Xu)},hn.prototype.oa=function(){Rt(this.g,"b")},ws.prototype.createWebChannel=ws.prototype.g,Nt.prototype.send=Nt.prototype.o,Nt.prototype.open=Nt.prototype.m,Nt.prototype.close=Nt.prototype.close,Zl=function(){return new ws},Xl=function(){return fs()},Yl=ke,Vo={jb:0,mb:1,nb:2,Hb:3,Mb:4,Jb:5,Kb:6,Ib:7,Gb:8,Lb:9,PROXY:10,NOPROXY:11,Eb:12,Ab:13,Bb:14,zb:15,Cb:16,Db:17,fb:18,eb:19,gb:20},ms.NO_ERROR=0,ms.TIMEOUT=8,ms.HTTP_ERROR=6,Ds=ms,mu.COMPLETE="complete",Jl=mu,cu.EventType=er,er.OPEN="a",er.CLOSE="b",er.ERROR="c",er.MESSAGE="d",It.prototype.listen=It.prototype.J,wr=cu,ut.prototype.listenOnce=ut.prototype.K,ut.prototype.getLastError=ut.prototype.Ha,ut.prototype.getLastErrorCode=ut.prototype.ya,ut.prototype.getStatus=ut.prototype.ca,ut.prototype.getResponseJson=ut.prototype.La,ut.prototype.getResponseText=ut.prototype.la,ut.prototype.send=ut.prototype.ea,ut.prototype.setWithCredentials=ut.prototype.Fa,Ql=ut}).apply(typeof As<"u"?As:typeof self<"u"?self:typeof window<"u"?window:{});/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Tt{constructor(t){this.uid=t}isAuthenticated(){return this.uid!=null}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(t){return t.uid===this.uid}}Tt.UNAUTHENTICATED=new Tt(null),Tt.GOOGLE_CREDENTIALS=new Tt("google-credentials-uid"),Tt.FIRST_PARTY=new Tt("first-party-uid"),Tt.MOCK_USER=new Tt("mock-user");/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Wn="12.8.0";function kg(r){Wn=r}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ye=new zl("@firebase/firestore");function yn(){return Ye.logLevel}function V(r,...t){if(Ye.logLevel<=W.DEBUG){const e=t.map(ra);Ye.debug(`Firestore (${Wn}): ${r}`,...e)}}function ht(r,...t){if(Ye.logLevel<=W.ERROR){const e=t.map(ra);Ye.error(`Firestore (${Wn}): ${r}`,...e)}}function Vn(r,...t){if(Ye.logLevel<=W.WARN){const e=t.map(ra);Ye.warn(`Firestore (${Wn}): ${r}`,...e)}}function ra(r){if(typeof r=="string")return r;try{return function(e){return JSON.stringify(e)}(r)}catch{return r}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function O(r,t,e){let n="Unexpected state";typeof t=="string"?n=t:e=t,th(r,n,e)}function th(r,t,e){let n=`FIRESTORE (${Wn}) INTERNAL ASSERTION FAILED: ${t} (ID: ${r.toString(16)})`;if(e!==void 0)try{n+=" CONTEXT: "+JSON.stringify(e)}catch{n+=" CONTEXT: "+e}throw ht(n),new Error(n)}function L(r,t,e,n){let s="Unexpected state";typeof e=="string"?s=e:n=e,r||th(t,s,n)}function F(r,t){return r}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const P={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class C extends Hn{constructor(t,e){super(t,e),this.code=t,this.message=e,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Wt{constructor(){this.promise=new Promise((t,e)=>{this.resolve=t,this.reject=e})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Mg{constructor(t,e){this.user=e,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${t}`)}}class eh{getToken(){return Promise.resolve(null)}invalidateToken(){}start(t,e){t.enqueueRetryable(()=>e(Tt.UNAUTHENTICATED))}shutdown(){}}class Og{constructor(t){this.t=t,this.currentUser=Tt.UNAUTHENTICATED,this.i=0,this.forceRefresh=!1,this.auth=null}start(t,e){L(this.o===void 0,42304);let n=this.i;const s=l=>this.i!==n?(n=this.i,e(l)):Promise.resolve();let i=new Wt;this.o=()=>{this.i++,this.currentUser=this.u(),i.resolve(),i=new Wt,t.enqueueRetryable(()=>s(this.currentUser))};const a=()=>{const l=i;t.enqueueRetryable(async()=>{await l.promise,await s(this.currentUser)})},u=l=>{V("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=l,this.o&&(this.auth.addAuthTokenListener(this.o),a())};this.t.onInit(l=>u(l)),setTimeout(()=>{if(!this.auth){const l=this.t.getImmediate({optional:!0});l?u(l):(V("FirebaseAuthCredentialsProvider","Auth not yet detected"),i.resolve(),i=new Wt)}},0),a()}getToken(){const t=this.i,e=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(e).then(n=>this.i!==t?(V("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):n?(L(typeof n.accessToken=="string",31837,{l:n}),new Mg(n.accessToken,this.currentUser)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.o&&this.auth.removeAuthTokenListener(this.o),this.o=void 0}u(){const t=this.auth&&this.auth.getUid();return L(t===null||typeof t=="string",2055,{h:t}),new Tt(t)}}class Fg{constructor(t,e,n){this.P=t,this.T=e,this.I=n,this.type="FirstParty",this.user=Tt.FIRST_PARTY,this.R=new Map}A(){return this.I?this.I():null}get headers(){this.R.set("X-Goog-AuthUser",this.P);const t=this.A();return t&&this.R.set("Authorization",t),this.T&&this.R.set("X-Goog-Iam-Authorization-Token",this.T),this.R}}class Lg{constructor(t,e,n){this.P=t,this.T=e,this.I=n}getToken(){return Promise.resolve(new Fg(this.P,this.T,this.I))}start(t,e){t.enqueueRetryable(()=>e(Tt.FIRST_PARTY))}shutdown(){}invalidateToken(){}}class hc{constructor(t){this.value=t,this.type="AppCheck",this.headers=new Map,t&&t.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class Bg{constructor(t,e){this.V=e,this.forceRefresh=!1,this.appCheck=null,this.m=null,this.p=null,_g(t)&&t.settings.appCheckToken&&(this.p=t.settings.appCheckToken)}start(t,e){L(this.o===void 0,3512);const n=i=>{i.error!=null&&V("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${i.error.message}`);const a=i.token!==this.m;return this.m=i.token,V("FirebaseAppCheckTokenProvider",`Received ${a?"new":"existing"} token.`),a?e(i.token):Promise.resolve()};this.o=i=>{t.enqueueRetryable(()=>n(i))};const s=i=>{V("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=i,this.o&&this.appCheck.addTokenListener(this.o)};this.V.onInit(i=>s(i)),setTimeout(()=>{if(!this.appCheck){const i=this.V.getImmediate({optional:!0});i?s(i):V("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}},0)}getToken(){if(this.p)return Promise.resolve(new hc(this.p));const t=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(t).then(e=>e?(L(typeof e.token=="string",44558,{tokenResult:e}),this.m=e.token,new hc(e.token)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.o&&this.appCheck.removeTokenListener(this.o),this.o=void 0}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ug(r){const t=typeof self<"u"&&(self.crypto||self.msCrypto),e=new Uint8Array(r);if(t&&typeof t.getRandomValues=="function")t.getRandomValues(e);else for(let n=0;n<r;n++)e[n]=Math.floor(256*Math.random());return e}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class hi{static newId(){const t="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",e=62*Math.floor(4.129032258064516);let n="";for(;n.length<20;){const s=Ug(40);for(let i=0;i<s.length;++i)n.length<20&&s[i]<e&&(n+=t.charAt(s[i]%62))}return n}}function j(r,t){return r<t?-1:r>t?1:0}function Co(r,t){const e=Math.min(r.length,t.length);for(let n=0;n<e;n++){const s=r.charAt(n),i=t.charAt(n);if(s!==i)return go(s)===go(i)?j(s,i):go(s)?1:-1}return j(r.length,t.length)}const qg=55296,jg=57343;function go(r){const t=r.charCodeAt(0);return t>=qg&&t<=jg}function Cn(r,t,e){return r.length===t.length&&r.every((n,s)=>e(n,t[s]))}function nh(r){return r+"\0"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const dc="__name__";class $t{constructor(t,e,n){e===void 0?e=0:e>t.length&&O(637,{offset:e,range:t.length}),n===void 0?n=t.length-e:n>t.length-e&&O(1746,{length:n,range:t.length-e}),this.segments=t,this.offset=e,this.len=n}get length(){return this.len}isEqual(t){return $t.comparator(this,t)===0}child(t){const e=this.segments.slice(this.offset,this.limit());return t instanceof $t?t.forEach(n=>{e.push(n)}):e.push(t),this.construct(e)}limit(){return this.offset+this.length}popFirst(t){return t=t===void 0?1:t,this.construct(this.segments,this.offset+t,this.length-t)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(t){return this.segments[this.offset+t]}isEmpty(){return this.length===0}isPrefixOf(t){if(t.length<this.length)return!1;for(let e=0;e<this.length;e++)if(this.get(e)!==t.get(e))return!1;return!0}isImmediateParentOf(t){if(this.length+1!==t.length)return!1;for(let e=0;e<this.length;e++)if(this.get(e)!==t.get(e))return!1;return!0}forEach(t){for(let e=this.offset,n=this.limit();e<n;e++)t(this.segments[e])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(t,e){const n=Math.min(t.length,e.length);for(let s=0;s<n;s++){const i=$t.compareSegments(t.get(s),e.get(s));if(i!==0)return i}return j(t.length,e.length)}static compareSegments(t,e){const n=$t.isNumericId(t),s=$t.isNumericId(e);return n&&!s?-1:!n&&s?1:n&&s?$t.extractNumericId(t).compare($t.extractNumericId(e)):Co(t,e)}static isNumericId(t){return t.startsWith("__id")&&t.endsWith("__")}static extractNumericId(t){return Ie.fromString(t.substring(4,t.length-2))}}class J extends $t{construct(t,e,n){return new J(t,e,n)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...t){const e=[];for(const n of t){if(n.indexOf("//")>=0)throw new C(P.INVALID_ARGUMENT,`Invalid segment (${n}). Paths must not contain // in them.`);e.push(...n.split("/").filter(s=>s.length>0))}return new J(e)}static emptyPath(){return new J([])}}const zg=/^[_a-zA-Z][_a-zA-Z0-9]*$/;class ot extends $t{construct(t,e,n){return new ot(t,e,n)}static isValidIdentifier(t){return zg.test(t)}canonicalString(){return this.toArray().map(t=>(t=t.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),ot.isValidIdentifier(t)||(t="`"+t+"`"),t)).join(".")}toString(){return this.canonicalString()}isKeyField(){return this.length===1&&this.get(0)===dc}static keyField(){return new ot([dc])}static fromServerFormat(t){const e=[];let n="",s=0;const i=()=>{if(n.length===0)throw new C(P.INVALID_ARGUMENT,`Invalid field path (${t}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);e.push(n),n=""};let a=!1;for(;s<t.length;){const u=t[s];if(u==="\\"){if(s+1===t.length)throw new C(P.INVALID_ARGUMENT,"Path has trailing escape character: "+t);const l=t[s+1];if(l!=="\\"&&l!=="."&&l!=="`")throw new C(P.INVALID_ARGUMENT,"Path has invalid escape sequence: "+t);n+=l,s+=2}else u==="`"?(a=!a,s++):u!=="."||a?(n+=u,s++):(i(),s++)}if(i(),a)throw new C(P.INVALID_ARGUMENT,"Unterminated ` in path: "+t);return new ot(e)}static emptyPath(){return new ot([])}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class N{constructor(t){this.path=t}static fromPath(t){return new N(J.fromString(t))}static fromName(t){return new N(J.fromString(t).popFirst(5))}static empty(){return new N(J.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(t){return this.path.length>=2&&this.path.get(this.path.length-2)===t}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(t){return t!==null&&J.comparator(this.path,t.path)===0}toString(){return this.path.toString()}static comparator(t,e){return J.comparator(t.path,e.path)}static isDocumentKey(t){return t.length%2==0}static fromSegments(t){return new N(new J(t.slice()))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function rh(r,t,e){if(!e)throw new C(P.INVALID_ARGUMENT,`Function ${r}() cannot be called with an empty ${t}.`)}function sh(r,t,e,n){if(t===!0&&n===!0)throw new C(P.INVALID_ARGUMENT,`${r} and ${e} cannot be used together.`)}function fc(r){if(!N.isDocumentKey(r))throw new C(P.INVALID_ARGUMENT,`Invalid document reference. Document references must have an even number of segments, but ${r} has ${r.length}.`)}function mc(r){if(N.isDocumentKey(r))throw new C(P.INVALID_ARGUMENT,`Invalid collection reference. Collection references must have an odd number of segments, but ${r} has ${r.length}.`)}function ih(r){return typeof r=="object"&&r!==null&&(Object.getPrototypeOf(r)===Object.prototype||Object.getPrototypeOf(r)===null)}function di(r){if(r===void 0)return"undefined";if(r===null)return"null";if(typeof r=="string")return r.length>20&&(r=`${r.substring(0,20)}...`),JSON.stringify(r);if(typeof r=="number"||typeof r=="boolean")return""+r;if(typeof r=="object"){if(r instanceof Array)return"an array";{const t=function(n){return n.constructor?n.constructor.name:null}(r);return t?`a custom ${t} object`:"an object"}}return typeof r=="function"?"a function":O(12329,{type:typeof r})}function xt(r,t){if("_delegate"in r&&(r=r._delegate),!(r instanceof t)){if(t.name===r.constructor.name)throw new C(P.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{const e=di(r);throw new C(P.INVALID_ARGUMENT,`Expected type '${t.name}', but it was: ${e}`)}}return r}function $g(r,t){if(t<=0)throw new C(P.INVALID_ARGUMENT,`Function ${r}() requires a positive number, but it was: ${t}.`)}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ft(r,t){const e={typeString:r};return t&&(e.value=t),e}function Yr(r,t){if(!ih(r))throw new C(P.INVALID_ARGUMENT,"JSON must be an object");let e;for(const n in t)if(t[n]){const s=t[n].typeString,i="value"in t[n]?{value:t[n].value}:void 0;if(!(n in r)){e=`JSON missing required field: '${n}'`;break}const a=r[n];if(s&&typeof a!==s){e=`JSON field '${n}' must be a ${s}.`;break}if(i!==void 0&&a!==i.value){e=`Expected '${n}' field to equal '${i.value}'`;break}}if(e)throw new C(P.INVALID_ARGUMENT,e);return!0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const gc=-62135596800,pc=1e6;class X{static now(){return X.fromMillis(Date.now())}static fromDate(t){return X.fromMillis(t.getTime())}static fromMillis(t){const e=Math.floor(t/1e3),n=Math.floor((t-1e3*e)*pc);return new X(e,n)}constructor(t,e){if(this.seconds=t,this.nanoseconds=e,e<0)throw new C(P.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+e);if(e>=1e9)throw new C(P.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+e);if(t<gc)throw new C(P.INVALID_ARGUMENT,"Timestamp seconds out of range: "+t);if(t>=253402300800)throw new C(P.INVALID_ARGUMENT,"Timestamp seconds out of range: "+t)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/pc}_compareTo(t){return this.seconds===t.seconds?j(this.nanoseconds,t.nanoseconds):j(this.seconds,t.seconds)}isEqual(t){return t.seconds===this.seconds&&t.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{type:X._jsonSchemaVersion,seconds:this.seconds,nanoseconds:this.nanoseconds}}static fromJSON(t){if(Yr(t,X._jsonSchema))return new X(t.seconds,t.nanoseconds)}valueOf(){const t=this.seconds-gc;return String(t).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}}X._jsonSchemaVersion="firestore/timestamp/1.0",X._jsonSchema={type:ft("string",X._jsonSchemaVersion),seconds:ft("number"),nanoseconds:ft("number")};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class B{static fromTimestamp(t){return new B(t)}static min(){return new B(new X(0,0))}static max(){return new B(new X(253402300799,999999999))}constructor(t){this.timestamp=t}compareTo(t){return this.timestamp._compareTo(t.timestamp)}isEqual(t){return this.timestamp.isEqual(t.timestamp)}toMicroseconds(){return 1e6*this.timestamp.seconds+this.timestamp.nanoseconds/1e3}toString(){return"SnapshotVersion("+this.timestamp.toString()+")"}toTimestamp(){return this.timestamp}}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Dn=-1;class $s{constructor(t,e,n,s){this.indexId=t,this.collectionGroup=e,this.fields=n,this.indexState=s}}function Do(r){return r.fields.find(t=>t.kind===2)}function qe(r){return r.fields.filter(t=>t.kind!==2)}$s.UNKNOWN_ID=-1;class xs{constructor(t,e){this.fieldPath=t,this.kind=e}}class Br{constructor(t,e){this.sequenceNumber=t,this.offset=e}static empty(){return new Br(0,Lt.min())}}function oh(r,t){const e=r.toTimestamp().seconds,n=r.toTimestamp().nanoseconds+1,s=B.fromTimestamp(n===1e9?new X(e+1,0):new X(e,n));return new Lt(s,N.empty(),t)}function ah(r){return new Lt(r.readTime,r.key,Dn)}class Lt{constructor(t,e,n){this.readTime=t,this.documentKey=e,this.largestBatchId=n}static min(){return new Lt(B.min(),N.empty(),Dn)}static max(){return new Lt(B.max(),N.empty(),Dn)}}function sa(r,t){let e=r.readTime.compareTo(t.readTime);return e!==0?e:(e=N.comparator(r.documentKey,t.documentKey),e!==0?e:j(r.largestBatchId,t.largestBatchId))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const uh="The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.";class ch{constructor(){this.onCommittedListeners=[]}addOnCommittedListener(t){this.onCommittedListeners.push(t)}raiseOnCommittedEvent(){this.onCommittedListeners.forEach(t=>t())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Pe(r){if(r.code!==P.FAILED_PRECONDITION||r.message!==uh)throw r;V("LocalStore","Unexpectedly lost primary lease")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class v{constructor(t){this.nextCallback=null,this.catchCallback=null,this.result=void 0,this.error=void 0,this.isDone=!1,this.callbackAttached=!1,t(e=>{this.isDone=!0,this.result=e,this.nextCallback&&this.nextCallback(e)},e=>{this.isDone=!0,this.error=e,this.catchCallback&&this.catchCallback(e)})}catch(t){return this.next(void 0,t)}next(t,e){return this.callbackAttached&&O(59440),this.callbackAttached=!0,this.isDone?this.error?this.wrapFailure(e,this.error):this.wrapSuccess(t,this.result):new v((n,s)=>{this.nextCallback=i=>{this.wrapSuccess(t,i).next(n,s)},this.catchCallback=i=>{this.wrapFailure(e,i).next(n,s)}})}toPromise(){return new Promise((t,e)=>{this.next(t,e)})}wrapUserFunction(t){try{const e=t();return e instanceof v?e:v.resolve(e)}catch(e){return v.reject(e)}}wrapSuccess(t,e){return t?this.wrapUserFunction(()=>t(e)):v.resolve(e)}wrapFailure(t,e){return t?this.wrapUserFunction(()=>t(e)):v.reject(e)}static resolve(t){return new v((e,n)=>{e(t)})}static reject(t){return new v((e,n)=>{n(t)})}static waitFor(t){return new v((e,n)=>{let s=0,i=0,a=!1;t.forEach(u=>{++s,u.next(()=>{++i,a&&i===s&&e()},l=>n(l))}),a=!0,i===s&&e()})}static or(t){let e=v.resolve(!1);for(const n of t)e=e.next(s=>s?v.resolve(s):n());return e}static forEach(t,e){const n=[];return t.forEach((s,i)=>{n.push(e.call(this,s,i))}),this.waitFor(n)}static mapArray(t,e){return new v((n,s)=>{const i=t.length,a=new Array(i);let u=0;for(let l=0;l<i;l++){const d=l;e(t[d]).next(f=>{a[d]=f,++u,u===i&&n(a)},f=>s(f))}})}static doWhile(t,e){return new v((n,s)=>{const i=()=>{t()===!0?e().next(()=>{i()},s):n()};i()})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const kt="SimpleDb";class fi{static open(t,e,n,s){try{return new fi(e,t.transaction(s,n))}catch(i){throw new Sr(e,i)}}constructor(t,e){this.action=t,this.transaction=e,this.aborted=!1,this.S=new Wt,this.transaction.oncomplete=()=>{this.S.resolve()},this.transaction.onabort=()=>{e.error?this.S.reject(new Sr(t,e.error)):this.S.resolve()},this.transaction.onerror=n=>{const s=ia(n.target.error);this.S.reject(new Sr(t,s))}}get D(){return this.S.promise}abort(t){t&&this.S.reject(t),this.aborted||(V(kt,"Aborting transaction:",t?t.message:"Client-initiated abort"),this.aborted=!0,this.transaction.abort())}C(){const t=this.transaction;this.aborted||typeof t.commit!="function"||t.commit()}store(t){const e=this.transaction.objectStore(t);return new Kg(e)}}class Ee{static delete(t){return V(kt,"Removing database:",t),ze(Ol().indexedDB.deleteDatabase(t)).toPromise()}static v(){if(!ql())return!1;if(Ee.F())return!0;const t=Sn(),e=Ee.M(t),n=0<e&&e<10,s=lh(t),i=0<s&&s<4.5;return!(t.indexOf("MSIE ")>0||t.indexOf("Trident/")>0||t.indexOf("Edge/")>0||n||i)}static F(){var t;return typeof process<"u"&&((t=process.__PRIVATE_env)==null?void 0:t.__PRIVATE_USE_MOCK_PERSISTENCE)==="YES"}static O(t,e){return t.store(e)}static M(t){const e=t.match(/i(?:phone|pad|pod) os ([\d_]+)/i),n=e?e[1].split("_").slice(0,2).join("."):"-1";return Number(n)}constructor(t,e,n){this.name=t,this.version=e,this.N=n,this.B=null,Ee.M(Sn())===12.2&&ht("Firestore persistence suffers from a bug in iOS 12.2 Safari that may cause your app to stop working. See https://stackoverflow.com/q/56496296/110915 for details and a potential workaround.")}async L(t){return this.db||(V(kt,"Opening database:",this.name),this.db=await new Promise((e,n)=>{const s=indexedDB.open(this.name,this.version);s.onsuccess=i=>{const a=i.target.result;e(a)},s.onblocked=()=>{n(new Sr(t,"Cannot upgrade IndexedDB schema while another tab is open. Close all tabs that access Firestore and reload this page to proceed."))},s.onerror=i=>{const a=i.target.error;a.name==="VersionError"?n(new C(P.FAILED_PRECONDITION,"A newer version of the Firestore SDK was previously used and so the persisted data is not compatible with the version of the SDK you are now using. The SDK will operate with persistence disabled. If you need persistence, please re-upgrade to a newer version of the SDK or else clear the persisted IndexedDB data for your app to start fresh.")):a.name==="InvalidStateError"?n(new C(P.FAILED_PRECONDITION,"Unable to open an IndexedDB connection. This could be due to running in a private browsing session on a browser whose private browsing sessions do not support IndexedDB: "+a)):n(new Sr(t,a))},s.onupgradeneeded=i=>{V(kt,'Database "'+this.name+'" requires upgrade from version:',i.oldVersion);const a=i.target.result;this.N.k(a,s.transaction,i.oldVersion,this.version).next(()=>{V(kt,"Database upgrade to version "+this.version+" complete")})}})),this.K&&(this.db.onversionchange=e=>this.K(e)),this.db}q(t){this.K=t,this.db&&(this.db.onversionchange=e=>t(e))}async runTransaction(t,e,n,s){const i=e==="readonly";let a=0;for(;;){++a;try{this.db=await this.L(t);const u=fi.open(this.db,t,i?"readonly":"readwrite",n),l=s(u).next(d=>(u.C(),d)).catch(d=>(u.abort(d),v.reject(d))).toPromise();return l.catch(()=>{}),await u.D,l}catch(u){const l=u,d=l.name!=="FirebaseError"&&a<3;if(V(kt,"Transaction failed with error:",l.message,"Retrying:",d),this.close(),!d)return Promise.reject(l)}}}close(){this.db&&this.db.close(),this.db=void 0}}function lh(r){const t=r.match(/Android ([\d.]+)/i),e=t?t[1].split(".").slice(0,2).join("."):"-1";return Number(e)}class Gg{constructor(t){this.U=t,this.$=!1,this.W=null}get isDone(){return this.$}get G(){return this.W}set cursor(t){this.U=t}done(){this.$=!0}j(t){this.W=t}delete(){return ze(this.U.delete())}}class Sr extends C{constructor(t,e){super(P.UNAVAILABLE,`IndexedDB transaction '${t}' failed: ${e}`),this.name="IndexedDbTransactionError"}}function Ve(r){return r.name==="IndexedDbTransactionError"}class Kg{constructor(t){this.store=t}put(t,e){let n;return e!==void 0?(V(kt,"PUT",this.store.name,t,e),n=this.store.put(e,t)):(V(kt,"PUT",this.store.name,"<auto-key>",t),n=this.store.put(t)),ze(n)}add(t){return V(kt,"ADD",this.store.name,t,t),ze(this.store.add(t))}get(t){return ze(this.store.get(t)).next(e=>(e===void 0&&(e=null),V(kt,"GET",this.store.name,t,e),e))}delete(t){return V(kt,"DELETE",this.store.name,t),ze(this.store.delete(t))}count(){return V(kt,"COUNT",this.store.name),ze(this.store.count())}H(t,e){const n=this.options(t,e),s=n.index?this.store.index(n.index):this.store;if(typeof s.getAll=="function"){const i=s.getAll(n.range);return new v((a,u)=>{i.onerror=l=>{u(l.target.error)},i.onsuccess=l=>{a(l.target.result)}})}{const i=this.cursor(n),a=[];return this.J(i,(u,l)=>{a.push(l)}).next(()=>a)}}Z(t,e){const n=this.store.getAll(t,e===null?void 0:e);return new v((s,i)=>{n.onerror=a=>{i(a.target.error)},n.onsuccess=a=>{s(a.target.result)}})}X(t,e){V(kt,"DELETE ALL",this.store.name);const n=this.options(t,e);n.Y=!1;const s=this.cursor(n);return this.J(s,(i,a,u)=>u.delete())}ee(t,e){let n;e?n=t:(n={},e=t);const s=this.cursor(n);return this.J(s,e)}te(t){const e=this.cursor({});return new v((n,s)=>{e.onerror=i=>{const a=ia(i.target.error);s(a)},e.onsuccess=i=>{const a=i.target.result;a?t(a.primaryKey,a.value).next(u=>{u?a.continue():n()}):n()}})}J(t,e){const n=[];return new v((s,i)=>{t.onerror=a=>{i(a.target.error)},t.onsuccess=a=>{const u=a.target.result;if(!u)return void s();const l=new Gg(u),d=e(u.primaryKey,u.value,l);if(d instanceof v){const f=d.catch(g=>(l.done(),v.reject(g)));n.push(f)}l.isDone?s():l.G===null?u.continue():u.continue(l.G)}}).next(()=>v.waitFor(n))}options(t,e){let n;return t!==void 0&&(typeof t=="string"?n=t:e=t),{index:n,range:e}}cursor(t){let e="next";if(t.reverse&&(e="prev"),t.index){const n=this.store.index(t.index);return t.Y?n.openKeyCursor(t.range,e):n.openCursor(t.range,e)}return this.store.openCursor(t.range,e)}}function ze(r){return new v((t,e)=>{r.onsuccess=n=>{const s=n.target.result;t(s)},r.onerror=n=>{const s=ia(n.target.error);e(s)}})}let _c=!1;function ia(r){const t=Ee.M(Sn());if(t>=12.2&&t<13){const e="An internal error was encountered in the Indexed Database server";if(r.message.indexOf(e)>=0){const n=new C("internal",`IOS_INDEXEDDB_BUG1: IndexedDb has thrown '${e}'. This is likely due to an unavoidable bug in iOS. See https://stackoverflow.com/q/56496296/110915 for details and a potential workaround.`);return _c||(_c=!0,setTimeout(()=>{throw n},0)),n}}return r}const Pr="IndexBackfiller";class Hg{constructor(t,e){this.asyncQueue=t,this.ne=e,this.task=null}start(){this.re(15e3)}stop(){this.task&&(this.task.cancel(),this.task=null)}get started(){return this.task!==null}re(t){V(Pr,`Scheduled in ${t}ms`),this.task=this.asyncQueue.enqueueAfterDelay("index_backfill",t,async()=>{this.task=null;try{const e=await this.ne.ie();V(Pr,`Documents written: ${e}`)}catch(e){Ve(e)?V(Pr,"Ignoring IndexedDB error during index backfill: ",e):await Pe(e)}await this.re(6e4)})}}class Wg{constructor(t,e){this.localStore=t,this.persistence=e}async ie(t=50){return this.persistence.runTransaction("Backfill Indexes","readwrite-primary",e=>this.se(e,t))}se(t,e){const n=new Set;let s=e,i=!0;return v.doWhile(()=>i===!0&&s>0,()=>this.localStore.indexManager.getNextCollectionGroupToUpdate(t).next(a=>{if(a!==null&&!n.has(a))return V(Pr,`Processing collection: ${a}`),this.oe(t,a,s).next(u=>{s-=u,n.add(a)});i=!1})).next(()=>e-s)}oe(t,e,n){return this.localStore.indexManager.getMinOffsetFromCollectionGroup(t,e).next(s=>this.localStore.localDocuments.getNextDocuments(t,e,s,n).next(i=>{const a=i.changes;return this.localStore.indexManager.updateIndexEntries(t,a).next(()=>this._e(s,i)).next(u=>(V(Pr,`Updating offset: ${u}`),this.localStore.indexManager.updateCollectionGroup(t,e,u))).next(()=>a.size)}))}_e(t,e){let n=t;return e.changes.forEach((s,i)=>{const a=ah(i);sa(a,n)>0&&(n=a)}),new Lt(n.readTime,n.documentKey,Math.max(e.batchId,t.largestBatchId))}}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ct{constructor(t,e){this.previousValue=t,e&&(e.sequenceNumberHandler=n=>this.ae(n),this.ue=n=>e.writeSequenceNumber(n))}ae(t){return this.previousValue=Math.max(t,this.previousValue),this.previousValue}next(){const t=++this.previousValue;return this.ue&&this.ue(t),t}}Ct.ce=-1;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const We=-1;function mi(r){return r==null}function Ur(r){return r===0&&1/r==-1/0}function hh(r){return typeof r=="number"&&Number.isInteger(r)&&!Ur(r)&&r<=Number.MAX_SAFE_INTEGER&&r>=Number.MIN_SAFE_INTEGER}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Gs="";function bt(r){let t="";for(let e=0;e<r.length;e++)t.length>0&&(t=yc(t)),t=Qg(r.get(e),t);return yc(t)}function Qg(r,t){let e=t;const n=r.length;for(let s=0;s<n;s++){const i=r.charAt(s);switch(i){case"\0":e+="";break;case Gs:e+="";break;default:e+=i}}return e}function yc(r){return r+Gs+""}function Kt(r){const t=r.length;if(L(t>=2,64408,{path:r}),t===2)return L(r.charAt(0)===Gs&&r.charAt(1)==="",56145,{path:r}),J.emptyPath();const e=t-2,n=[];let s="";for(let i=0;i<t;){const a=r.indexOf(Gs,i);switch((a<0||a>e)&&O(50515,{path:r}),r.charAt(a+1)){case"":const u=r.substring(i,a);let l;s.length===0?l=u:(s+=u,l=s,s=""),n.push(l);break;case"":s+=r.substring(i,a),s+="\0";break;case"":s+=r.substring(i,a+1);break;default:O(61167,{path:r})}i=a+2}return new J(n)}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const je="remoteDocuments",Xr="owner",dn="owner",qr="mutationQueues",Jg="userId",Ut="mutations",Ic="batchId",He="userMutationsIndex",Ec=["userId","batchId"];/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ns(r,t){return[r,bt(t)]}function dh(r,t,e){return[r,bt(t),e]}const Yg={},xn="documentMutations",Ks="remoteDocumentsV14",Xg=["prefixPath","collectionGroup","readTime","documentId"],ks="documentKeyIndex",Zg=["prefixPath","collectionGroup","documentId"],fh="collectionGroupIndex",tp=["collectionGroup","readTime","prefixPath","documentId"],jr="remoteDocumentGlobal",xo="remoteDocumentGlobalKey",Nn="targets",mh="queryTargetsIndex",ep=["canonicalId","targetId"],kn="targetDocuments",np=["targetId","path"],oa="documentTargetsIndex",rp=["path","targetId"],Hs="targetGlobalKey",Qe="targetGlobal",zr="collectionParents",sp=["collectionId","parent"],Mn="clientMetadata",ip="clientId",gi="bundles",op="bundleId",pi="namedQueries",ap="name",aa="indexConfiguration",up="indexId",No="collectionGroupIndex",cp="collectionGroup",Vr="indexState",lp=["indexId","uid"],gh="sequenceNumberIndex",hp=["uid","sequenceNumber"],Cr="indexEntries",dp=["indexId","uid","arrayValue","directionalValue","orderedDocumentKey","documentKey"],ph="documentKeyIndex",fp=["indexId","uid","orderedDocumentKey"],_i="documentOverlays",mp=["userId","collectionPath","documentId"],ko="collectionPathOverlayIndex",gp=["userId","collectionPath","largestBatchId"],_h="collectionGroupOverlayIndex",pp=["userId","collectionGroup","largestBatchId"],ua="globals",_p="name",yh=[qr,Ut,xn,je,Nn,Xr,Qe,kn,Mn,jr,zr,gi,pi],yp=[...yh,_i],Ih=[qr,Ut,xn,Ks,Nn,Xr,Qe,kn,Mn,jr,zr,gi,pi,_i],Eh=Ih,ca=[...Eh,aa,Vr,Cr],Ip=ca,Th=[...ca,ua],Ep=Th;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Mo extends ch{constructor(t,e){super(),this.le=t,this.currentSequenceNumber=e}}function gt(r,t){const e=F(r);return Ee.O(e.le,t)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Tc(r){let t=0;for(const e in r)Object.prototype.hasOwnProperty.call(r,e)&&t++;return t}function Ce(r,t){for(const e in r)Object.prototype.hasOwnProperty.call(r,e)&&t(e,r[e])}function wh(r){for(const t in r)if(Object.prototype.hasOwnProperty.call(r,t))return!1;return!0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rt{constructor(t,e){this.comparator=t,this.root=e||yt.EMPTY}insert(t,e){return new rt(this.comparator,this.root.insert(t,e,this.comparator).copy(null,null,yt.BLACK,null,null))}remove(t){return new rt(this.comparator,this.root.remove(t,this.comparator).copy(null,null,yt.BLACK,null,null))}get(t){let e=this.root;for(;!e.isEmpty();){const n=this.comparator(t,e.key);if(n===0)return e.value;n<0?e=e.left:n>0&&(e=e.right)}return null}indexOf(t){let e=0,n=this.root;for(;!n.isEmpty();){const s=this.comparator(t,n.key);if(s===0)return e+n.left.size;s<0?n=n.left:(e+=n.left.size+1,n=n.right)}return-1}isEmpty(){return this.root.isEmpty()}get size(){return this.root.size}minKey(){return this.root.minKey()}maxKey(){return this.root.maxKey()}inorderTraversal(t){return this.root.inorderTraversal(t)}forEach(t){this.inorderTraversal((e,n)=>(t(e,n),!1))}toString(){const t=[];return this.inorderTraversal((e,n)=>(t.push(`${e}:${n}`),!1)),`{${t.join(", ")}}`}reverseTraversal(t){return this.root.reverseTraversal(t)}getIterator(){return new bs(this.root,null,this.comparator,!1)}getIteratorFrom(t){return new bs(this.root,t,this.comparator,!1)}getReverseIterator(){return new bs(this.root,null,this.comparator,!0)}getReverseIteratorFrom(t){return new bs(this.root,t,this.comparator,!0)}}class bs{constructor(t,e,n,s){this.isReverse=s,this.nodeStack=[];let i=1;for(;!t.isEmpty();)if(i=e?n(t.key,e):1,e&&s&&(i*=-1),i<0)t=this.isReverse?t.left:t.right;else{if(i===0){this.nodeStack.push(t);break}this.nodeStack.push(t),t=this.isReverse?t.right:t.left}}getNext(){let t=this.nodeStack.pop();const e={key:t.key,value:t.value};if(this.isReverse)for(t=t.left;!t.isEmpty();)this.nodeStack.push(t),t=t.right;else for(t=t.right;!t.isEmpty();)this.nodeStack.push(t),t=t.left;return e}hasNext(){return this.nodeStack.length>0}peek(){if(this.nodeStack.length===0)return null;const t=this.nodeStack[this.nodeStack.length-1];return{key:t.key,value:t.value}}}class yt{constructor(t,e,n,s,i){this.key=t,this.value=e,this.color=n??yt.RED,this.left=s??yt.EMPTY,this.right=i??yt.EMPTY,this.size=this.left.size+1+this.right.size}copy(t,e,n,s,i){return new yt(t??this.key,e??this.value,n??this.color,s??this.left,i??this.right)}isEmpty(){return!1}inorderTraversal(t){return this.left.inorderTraversal(t)||t(this.key,this.value)||this.right.inorderTraversal(t)}reverseTraversal(t){return this.right.reverseTraversal(t)||t(this.key,this.value)||this.left.reverseTraversal(t)}min(){return this.left.isEmpty()?this:this.left.min()}minKey(){return this.min().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(t,e,n){let s=this;const i=n(t,s.key);return s=i<0?s.copy(null,null,null,s.left.insert(t,e,n),null):i===0?s.copy(null,e,null,null,null):s.copy(null,null,null,null,s.right.insert(t,e,n)),s.fixUp()}removeMin(){if(this.left.isEmpty())return yt.EMPTY;let t=this;return t.left.isRed()||t.left.left.isRed()||(t=t.moveRedLeft()),t=t.copy(null,null,null,t.left.removeMin(),null),t.fixUp()}remove(t,e){let n,s=this;if(e(t,s.key)<0)s.left.isEmpty()||s.left.isRed()||s.left.left.isRed()||(s=s.moveRedLeft()),s=s.copy(null,null,null,s.left.remove(t,e),null);else{if(s.left.isRed()&&(s=s.rotateRight()),s.right.isEmpty()||s.right.isRed()||s.right.left.isRed()||(s=s.moveRedRight()),e(t,s.key)===0){if(s.right.isEmpty())return yt.EMPTY;n=s.right.min(),s=s.copy(n.key,n.value,null,null,s.right.removeMin())}s=s.copy(null,null,null,null,s.right.remove(t,e))}return s.fixUp()}isRed(){return this.color}fixUp(){let t=this;return t.right.isRed()&&!t.left.isRed()&&(t=t.rotateLeft()),t.left.isRed()&&t.left.left.isRed()&&(t=t.rotateRight()),t.left.isRed()&&t.right.isRed()&&(t=t.colorFlip()),t}moveRedLeft(){let t=this.colorFlip();return t.right.left.isRed()&&(t=t.copy(null,null,null,null,t.right.rotateRight()),t=t.rotateLeft(),t=t.colorFlip()),t}moveRedRight(){let t=this.colorFlip();return t.left.left.isRed()&&(t=t.rotateRight(),t=t.colorFlip()),t}rotateLeft(){const t=this.copy(null,null,yt.RED,null,this.right.left);return this.right.copy(null,null,this.color,t,null)}rotateRight(){const t=this.copy(null,null,yt.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,t)}colorFlip(){const t=this.left.copy(null,null,!this.left.color,null,null),e=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,t,e)}checkMaxDepth(){const t=this.check();return Math.pow(2,t)<=this.size+1}check(){if(this.isRed()&&this.left.isRed())throw O(43730,{key:this.key,value:this.value});if(this.right.isRed())throw O(14113,{key:this.key,value:this.value});const t=this.left.check();if(t!==this.right.check())throw O(27949);return t+(this.isRed()?0:1)}}yt.EMPTY=null,yt.RED=!0,yt.BLACK=!1;yt.EMPTY=new class{constructor(){this.size=0}get key(){throw O(57766)}get value(){throw O(16141)}get color(){throw O(16727)}get left(){throw O(29726)}get right(){throw O(36894)}copy(t,e,n,s,i){return this}insert(t,e,n){return new yt(t,e)}remove(t,e){return this}isEmpty(){return!0}inorderTraversal(t){return!1}reverseTraversal(t){return!1}minKey(){return null}maxKey(){return null}isRed(){return!1}checkMaxDepth(){return!0}check(){return 0}};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class tt{constructor(t){this.comparator=t,this.data=new rt(this.comparator)}has(t){return this.data.get(t)!==null}first(){return this.data.minKey()}last(){return this.data.maxKey()}get size(){return this.data.size}indexOf(t){return this.data.indexOf(t)}forEach(t){this.data.inorderTraversal((e,n)=>(t(e),!1))}forEachInRange(t,e){const n=this.data.getIteratorFrom(t[0]);for(;n.hasNext();){const s=n.getNext();if(this.comparator(s.key,t[1])>=0)return;e(s.key)}}forEachWhile(t,e){let n;for(n=e!==void 0?this.data.getIteratorFrom(e):this.data.getIterator();n.hasNext();)if(!t(n.getNext().key))return}firstAfterOrEqual(t){const e=this.data.getIteratorFrom(t);return e.hasNext()?e.getNext().key:null}getIterator(){return new wc(this.data.getIterator())}getIteratorFrom(t){return new wc(this.data.getIteratorFrom(t))}add(t){return this.copy(this.data.remove(t).insert(t,!0))}delete(t){return this.has(t)?this.copy(this.data.remove(t)):this}isEmpty(){return this.data.isEmpty()}unionWith(t){let e=this;return e.size<t.size&&(e=t,t=this),t.forEach(n=>{e=e.add(n)}),e}isEqual(t){if(!(t instanceof tt)||this.size!==t.size)return!1;const e=this.data.getIterator(),n=t.data.getIterator();for(;e.hasNext();){const s=e.getNext().key,i=n.getNext().key;if(this.comparator(s,i)!==0)return!1}return!0}toArray(){const t=[];return this.forEach(e=>{t.push(e)}),t}toString(){const t=[];return this.forEach(e=>t.push(e)),"SortedSet("+t.toString()+")"}copy(t){const e=new tt(this.comparator);return e.data=t,e}}class wc{constructor(t){this.iter=t}getNext(){return this.iter.getNext().key}hasNext(){return this.iter.hasNext()}}function fn(r){return r.hasNext()?r.getNext():void 0}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Dt{constructor(t){this.fields=t,t.sort(ot.comparator)}static empty(){return new Dt([])}unionWith(t){let e=new tt(ot.comparator);for(const n of this.fields)e=e.add(n);for(const n of t)e=e.add(n);return new Dt(e.toArray())}covers(t){for(const e of this.fields)if(e.isPrefixOf(t))return!0;return!1}isEqual(t){return Cn(this.fields,t.fields,(e,n)=>e.isEqual(n))}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vh extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class lt{constructor(t){this.binaryString=t}static fromBase64String(t){const e=function(s){try{return atob(s)}catch(i){throw typeof DOMException<"u"&&i instanceof DOMException?new vh("Invalid base64 string: "+i):i}}(t);return new lt(e)}static fromUint8Array(t){const e=function(s){let i="";for(let a=0;a<s.length;++a)i+=String.fromCharCode(s[a]);return i}(t);return new lt(e)}[Symbol.iterator](){let t=0;return{next:()=>t<this.binaryString.length?{value:this.binaryString.charCodeAt(t++),done:!1}:{value:void 0,done:!0}}}toBase64(){return function(e){return btoa(e)}(this.binaryString)}toUint8Array(){return function(e){const n=new Uint8Array(e.length);for(let s=0;s<e.length;s++)n[s]=e.charCodeAt(s);return n}(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(t){return j(this.binaryString,t.binaryString)}isEqual(t){return this.binaryString===t.binaryString}}lt.EMPTY_BYTE_STRING=new lt("");const Tp=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function ne(r){if(L(!!r,39018),typeof r=="string"){let t=0;const e=Tp.exec(r);if(L(!!e,46558,{timestamp:r}),e[1]){let s=e[1];s=(s+"000000000").substr(0,9),t=Number(s)}const n=new Date(r);return{seconds:Math.floor(n.getTime()/1e3),nanos:t}}return{seconds:it(r.seconds),nanos:it(r.nanos)}}function it(r){return typeof r=="number"?r:typeof r=="string"?Number(r):0}function re(r){return typeof r=="string"?lt.fromBase64String(r):lt.fromUint8Array(r)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ah="server_timestamp",bh="__type__",Rh="__previous_value__",Sh="__local_write_time__";function la(r){var e,n;return((n=(((e=r==null?void 0:r.mapValue)==null?void 0:e.fields)||{})[bh])==null?void 0:n.stringValue)===Ah}function yi(r){const t=r.mapValue.fields[Rh];return la(t)?yi(t):t}function $r(r){const t=ne(r.mapValue.fields[Sh].timestampValue);return new X(t.seconds,t.nanos)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class wp{constructor(t,e,n,s,i,a,u,l,d,f,g){this.databaseId=t,this.appId=e,this.persistenceKey=n,this.host=s,this.ssl=i,this.forceLongPolling=a,this.autoDetectLongPolling=u,this.longPollingOptions=l,this.useFetchStreams=d,this.isUsingEmulator=f,this.apiKey=g}}const Ws="(default)";class ve{constructor(t,e){this.projectId=t,this.database=e||Ws}static empty(){return new ve("","")}get isDefaultDatabase(){return this.database===Ws}isEqual(t){return t instanceof ve&&t.projectId===this.projectId&&t.database===this.database}}function vp(r,t){if(!Object.prototype.hasOwnProperty.apply(r.options,["projectId"]))throw new C(P.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new ve(r.options.projectId,t)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ha="__type__",Ph="__max__",pe={mapValue:{fields:{__type__:{stringValue:Ph}}}},da="__vector__",On="value",Ms={nullValue:"NULL_VALUE"};function Ae(r){return"nullValue"in r?0:"booleanValue"in r?1:"integerValue"in r||"doubleValue"in r?2:"timestampValue"in r?3:"stringValue"in r?5:"bytesValue"in r?6:"referenceValue"in r?7:"geoPointValue"in r?8:"arrayValue"in r?9:"mapValue"in r?la(r)?4:Vh(r)?9007199254740991:Ii(r)?10:11:O(28295,{value:r})}function Jt(r,t){if(r===t)return!0;const e=Ae(r);if(e!==Ae(t))return!1;switch(e){case 0:case 9007199254740991:return!0;case 1:return r.booleanValue===t.booleanValue;case 4:return $r(r).isEqual($r(t));case 3:return function(s,i){if(typeof s.timestampValue=="string"&&typeof i.timestampValue=="string"&&s.timestampValue.length===i.timestampValue.length)return s.timestampValue===i.timestampValue;const a=ne(s.timestampValue),u=ne(i.timestampValue);return a.seconds===u.seconds&&a.nanos===u.nanos}(r,t);case 5:return r.stringValue===t.stringValue;case 6:return function(s,i){return re(s.bytesValue).isEqual(re(i.bytesValue))}(r,t);case 7:return r.referenceValue===t.referenceValue;case 8:return function(s,i){return it(s.geoPointValue.latitude)===it(i.geoPointValue.latitude)&&it(s.geoPointValue.longitude)===it(i.geoPointValue.longitude)}(r,t);case 2:return function(s,i){if("integerValue"in s&&"integerValue"in i)return it(s.integerValue)===it(i.integerValue);if("doubleValue"in s&&"doubleValue"in i){const a=it(s.doubleValue),u=it(i.doubleValue);return a===u?Ur(a)===Ur(u):isNaN(a)&&isNaN(u)}return!1}(r,t);case 9:return Cn(r.arrayValue.values||[],t.arrayValue.values||[],Jt);case 10:case 11:return function(s,i){const a=s.mapValue.fields||{},u=i.mapValue.fields||{};if(Tc(a)!==Tc(u))return!1;for(const l in a)if(a.hasOwnProperty(l)&&(u[l]===void 0||!Jt(a[l],u[l])))return!1;return!0}(r,t);default:return O(52216,{left:r})}}function Gr(r,t){return(r.values||[]).find(e=>Jt(e,t))!==void 0}function be(r,t){if(r===t)return 0;const e=Ae(r),n=Ae(t);if(e!==n)return j(e,n);switch(e){case 0:case 9007199254740991:return 0;case 1:return j(r.booleanValue,t.booleanValue);case 2:return function(i,a){const u=it(i.integerValue||i.doubleValue),l=it(a.integerValue||a.doubleValue);return u<l?-1:u>l?1:u===l?0:isNaN(u)?isNaN(l)?0:-1:1}(r,t);case 3:return vc(r.timestampValue,t.timestampValue);case 4:return vc($r(r),$r(t));case 5:return Co(r.stringValue,t.stringValue);case 6:return function(i,a){const u=re(i),l=re(a);return u.compareTo(l)}(r.bytesValue,t.bytesValue);case 7:return function(i,a){const u=i.split("/"),l=a.split("/");for(let d=0;d<u.length&&d<l.length;d++){const f=j(u[d],l[d]);if(f!==0)return f}return j(u.length,l.length)}(r.referenceValue,t.referenceValue);case 8:return function(i,a){const u=j(it(i.latitude),it(a.latitude));return u!==0?u:j(it(i.longitude),it(a.longitude))}(r.geoPointValue,t.geoPointValue);case 9:return Ac(r.arrayValue,t.arrayValue);case 10:return function(i,a){var _,S,D,k;const u=i.fields||{},l=a.fields||{},d=(_=u[On])==null?void 0:_.arrayValue,f=(S=l[On])==null?void 0:S.arrayValue,g=j(((D=d==null?void 0:d.values)==null?void 0:D.length)||0,((k=f==null?void 0:f.values)==null?void 0:k.length)||0);return g!==0?g:Ac(d,f)}(r.mapValue,t.mapValue);case 11:return function(i,a){if(i===pe.mapValue&&a===pe.mapValue)return 0;if(i===pe.mapValue)return 1;if(a===pe.mapValue)return-1;const u=i.fields||{},l=Object.keys(u),d=a.fields||{},f=Object.keys(d);l.sort(),f.sort();for(let g=0;g<l.length&&g<f.length;++g){const _=Co(l[g],f[g]);if(_!==0)return _;const S=be(u[l[g]],d[f[g]]);if(S!==0)return S}return j(l.length,f.length)}(r.mapValue,t.mapValue);default:throw O(23264,{he:e})}}function vc(r,t){if(typeof r=="string"&&typeof t=="string"&&r.length===t.length)return j(r,t);const e=ne(r),n=ne(t),s=j(e.seconds,n.seconds);return s!==0?s:j(e.nanos,n.nanos)}function Ac(r,t){const e=r.values||[],n=t.values||[];for(let s=0;s<e.length&&s<n.length;++s){const i=be(e[s],n[s]);if(i)return i}return j(e.length,n.length)}function Fn(r){return Oo(r)}function Oo(r){return"nullValue"in r?"null":"booleanValue"in r?""+r.booleanValue:"integerValue"in r?""+r.integerValue:"doubleValue"in r?""+r.doubleValue:"timestampValue"in r?function(e){const n=ne(e);return`time(${n.seconds},${n.nanos})`}(r.timestampValue):"stringValue"in r?r.stringValue:"bytesValue"in r?function(e){return re(e).toBase64()}(r.bytesValue):"referenceValue"in r?function(e){return N.fromName(e).toString()}(r.referenceValue):"geoPointValue"in r?function(e){return`geo(${e.latitude},${e.longitude})`}(r.geoPointValue):"arrayValue"in r?function(e){let n="[",s=!0;for(const i of e.values||[])s?s=!1:n+=",",n+=Oo(i);return n+"]"}(r.arrayValue):"mapValue"in r?function(e){const n=Object.keys(e.fields||{}).sort();let s="{",i=!0;for(const a of n)i?i=!1:s+=",",s+=`${a}:${Oo(e.fields[a])}`;return s+"}"}(r.mapValue):O(61005,{value:r})}function Os(r){switch(Ae(r)){case 0:case 1:return 4;case 2:return 8;case 3:case 8:return 16;case 4:const t=yi(r);return t?16+Os(t):16;case 5:return 2*r.stringValue.length;case 6:return re(r.bytesValue).approximateByteSize();case 7:return r.referenceValue.length;case 9:return function(n){return(n.values||[]).reduce((s,i)=>s+Os(i),0)}(r.arrayValue);case 10:case 11:return function(n){let s=0;return Ce(n.fields,(i,a)=>{s+=i.length+Os(a)}),s}(r.mapValue);default:throw O(13486,{value:r})}}function Kr(r,t){return{referenceValue:`projects/${r.projectId}/databases/${r.database}/documents/${t.path.canonicalString()}`}}function Fo(r){return!!r&&"integerValue"in r}function Hr(r){return!!r&&"arrayValue"in r}function bc(r){return!!r&&"nullValue"in r}function Rc(r){return!!r&&"doubleValue"in r&&isNaN(Number(r.doubleValue))}function Fs(r){return!!r&&"mapValue"in r}function Ii(r){var e,n;return((n=(((e=r==null?void 0:r.mapValue)==null?void 0:e.fields)||{})[ha])==null?void 0:n.stringValue)===da}function Dr(r){if(r.geoPointValue)return{geoPointValue:{...r.geoPointValue}};if(r.timestampValue&&typeof r.timestampValue=="object")return{timestampValue:{...r.timestampValue}};if(r.mapValue){const t={mapValue:{fields:{}}};return Ce(r.mapValue.fields,(e,n)=>t.mapValue.fields[e]=Dr(n)),t}if(r.arrayValue){const t={arrayValue:{values:[]}};for(let e=0;e<(r.arrayValue.values||[]).length;++e)t.arrayValue.values[e]=Dr(r.arrayValue.values[e]);return t}return{...r}}function Vh(r){return(((r.mapValue||{}).fields||{}).__type__||{}).stringValue===Ph}const Ch={mapValue:{fields:{[ha]:{stringValue:da},[On]:{arrayValue:{}}}}};function Ap(r){return"nullValue"in r?Ms:"booleanValue"in r?{booleanValue:!1}:"integerValue"in r||"doubleValue"in r?{doubleValue:NaN}:"timestampValue"in r?{timestampValue:{seconds:Number.MIN_SAFE_INTEGER}}:"stringValue"in r?{stringValue:""}:"bytesValue"in r?{bytesValue:""}:"referenceValue"in r?Kr(ve.empty(),N.empty()):"geoPointValue"in r?{geoPointValue:{latitude:-90,longitude:-180}}:"arrayValue"in r?{arrayValue:{}}:"mapValue"in r?Ii(r)?Ch:{mapValue:{}}:O(35942,{value:r})}function bp(r){return"nullValue"in r?{booleanValue:!1}:"booleanValue"in r?{doubleValue:NaN}:"integerValue"in r||"doubleValue"in r?{timestampValue:{seconds:Number.MIN_SAFE_INTEGER}}:"timestampValue"in r?{stringValue:""}:"stringValue"in r?{bytesValue:""}:"bytesValue"in r?Kr(ve.empty(),N.empty()):"referenceValue"in r?{geoPointValue:{latitude:-90,longitude:-180}}:"geoPointValue"in r?{arrayValue:{}}:"arrayValue"in r?Ch:"mapValue"in r?Ii(r)?{mapValue:{}}:pe:O(61959,{value:r})}function Sc(r,t){const e=be(r.value,t.value);return e!==0?e:r.inclusive&&!t.inclusive?-1:!r.inclusive&&t.inclusive?1:0}function Pc(r,t){const e=be(r.value,t.value);return e!==0?e:r.inclusive&&!t.inclusive?1:!r.inclusive&&t.inclusive?-1:0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vt{constructor(t){this.value=t}static empty(){return new vt({mapValue:{}})}field(t){if(t.isEmpty())return this.value;{let e=this.value;for(let n=0;n<t.length-1;++n)if(e=(e.mapValue.fields||{})[t.get(n)],!Fs(e))return null;return e=(e.mapValue.fields||{})[t.lastSegment()],e||null}}set(t,e){this.getFieldsMap(t.popLast())[t.lastSegment()]=Dr(e)}setAll(t){let e=ot.emptyPath(),n={},s=[];t.forEach((a,u)=>{if(!e.isImmediateParentOf(u)){const l=this.getFieldsMap(e);this.applyChanges(l,n,s),n={},s=[],e=u.popLast()}a?n[u.lastSegment()]=Dr(a):s.push(u.lastSegment())});const i=this.getFieldsMap(e);this.applyChanges(i,n,s)}delete(t){const e=this.field(t.popLast());Fs(e)&&e.mapValue.fields&&delete e.mapValue.fields[t.lastSegment()]}isEqual(t){return Jt(this.value,t.value)}getFieldsMap(t){let e=this.value;e.mapValue.fields||(e.mapValue={fields:{}});for(let n=0;n<t.length;++n){let s=e.mapValue.fields[t.get(n)];Fs(s)&&s.mapValue.fields||(s={mapValue:{fields:{}}},e.mapValue.fields[t.get(n)]=s),e=s}return e.mapValue.fields}applyChanges(t,e,n){Ce(e,(s,i)=>t[s]=i);for(const s of n)delete t[s]}clone(){return new vt(Dr(this.value))}}function Dh(r){const t=[];return Ce(r.fields,(e,n)=>{const s=new ot([e]);if(Fs(n)){const i=Dh(n.mapValue).fields;if(i.length===0)t.push(s);else for(const a of i)t.push(s.child(a))}else t.push(s)}),new Dt(t)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ct{constructor(t,e,n,s,i,a,u){this.key=t,this.documentType=e,this.version=n,this.readTime=s,this.createTime=i,this.data=a,this.documentState=u}static newInvalidDocument(t){return new ct(t,0,B.min(),B.min(),B.min(),vt.empty(),0)}static newFoundDocument(t,e,n,s){return new ct(t,1,e,B.min(),n,s,0)}static newNoDocument(t,e){return new ct(t,2,e,B.min(),B.min(),vt.empty(),0)}static newUnknownDocument(t,e){return new ct(t,3,e,B.min(),B.min(),vt.empty(),2)}convertToFoundDocument(t,e){return!this.createTime.isEqual(B.min())||this.documentType!==2&&this.documentType!==0||(this.createTime=t),this.version=t,this.documentType=1,this.data=e,this.documentState=0,this}convertToNoDocument(t){return this.version=t,this.documentType=2,this.data=vt.empty(),this.documentState=0,this}convertToUnknownDocument(t){return this.version=t,this.documentType=3,this.data=vt.empty(),this.documentState=2,this}setHasCommittedMutations(){return this.documentState=2,this}setHasLocalMutations(){return this.documentState=1,this.version=B.min(),this}setReadTime(t){return this.readTime=t,this}get hasLocalMutations(){return this.documentState===1}get hasCommittedMutations(){return this.documentState===2}get hasPendingWrites(){return this.hasLocalMutations||this.hasCommittedMutations}isValidDocument(){return this.documentType!==0}isFoundDocument(){return this.documentType===1}isNoDocument(){return this.documentType===2}isUnknownDocument(){return this.documentType===3}isEqual(t){return t instanceof ct&&this.key.isEqual(t.key)&&this.version.isEqual(t.version)&&this.documentType===t.documentType&&this.documentState===t.documentState&&this.data.isEqual(t.data)}mutableCopy(){return new ct(this.key,this.documentType,this.version,this.readTime,this.createTime,this.data.clone(),this.documentState)}toString(){return`Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ln{constructor(t,e){this.position=t,this.inclusive=e}}function Vc(r,t,e){let n=0;for(let s=0;s<r.position.length;s++){const i=t[s],a=r.position[s];if(i.field.isKeyField()?n=N.comparator(N.fromName(a.referenceValue),e.key):n=be(a,e.data.field(i.field)),i.dir==="desc"&&(n*=-1),n!==0)break}return n}function Cc(r,t){if(r===null)return t===null;if(t===null||r.inclusive!==t.inclusive||r.position.length!==t.position.length)return!1;for(let e=0;e<r.position.length;e++)if(!Jt(r.position[e],t.position[e]))return!1;return!0}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Wr{constructor(t,e="asc"){this.field=t,this.dir=e}}function Rp(r,t){return r.dir===t.dir&&r.field.isEqual(t.field)}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xh{}class K extends xh{constructor(t,e,n){super(),this.field=t,this.op=e,this.value=n}static create(t,e,n){return t.isKeyField()?e==="in"||e==="not-in"?this.createKeyFieldInFilter(t,e,n):new Sp(t,e,n):e==="array-contains"?new Cp(t,n):e==="in"?new Lh(t,n):e==="not-in"?new Dp(t,n):e==="array-contains-any"?new xp(t,n):new K(t,e,n)}static createKeyFieldInFilter(t,e,n){return e==="in"?new Pp(t,n):new Vp(t,n)}matches(t){const e=t.data.field(this.field);return this.op==="!="?e!==null&&e.nullValue===void 0&&this.matchesComparison(be(e,this.value)):e!==null&&Ae(this.value)===Ae(e)&&this.matchesComparison(be(e,this.value))}matchesComparison(t){switch(this.op){case"<":return t<0;case"<=":return t<=0;case"==":return t===0;case"!=":return t!==0;case">":return t>0;case">=":return t>=0;default:return O(47266,{operator:this.op})}}isInequality(){return["<","<=",">",">=","!=","not-in"].indexOf(this.op)>=0}getFlattenedFilters(){return[this]}getFilters(){return[this]}}class Z extends xh{constructor(t,e){super(),this.filters=t,this.op=e,this.Pe=null}static create(t,e){return new Z(t,e)}matches(t){return Bn(this)?this.filters.find(e=>!e.matches(t))===void 0:this.filters.find(e=>e.matches(t))!==void 0}getFlattenedFilters(){return this.Pe!==null||(this.Pe=this.filters.reduce((t,e)=>t.concat(e.getFlattenedFilters()),[])),this.Pe}getFilters(){return Object.assign([],this.filters)}}function Bn(r){return r.op==="and"}function Lo(r){return r.op==="or"}function fa(r){return Nh(r)&&Bn(r)}function Nh(r){for(const t of r.filters)if(t instanceof Z)return!1;return!0}function Bo(r){if(r instanceof K)return r.field.canonicalString()+r.op.toString()+Fn(r.value);if(fa(r))return r.filters.map(t=>Bo(t)).join(",");{const t=r.filters.map(e=>Bo(e)).join(",");return`${r.op}(${t})`}}function kh(r,t){return r instanceof K?function(n,s){return s instanceof K&&n.op===s.op&&n.field.isEqual(s.field)&&Jt(n.value,s.value)}(r,t):r instanceof Z?function(n,s){return s instanceof Z&&n.op===s.op&&n.filters.length===s.filters.length?n.filters.reduce((i,a,u)=>i&&kh(a,s.filters[u]),!0):!1}(r,t):void O(19439)}function Mh(r,t){const e=r.filters.concat(t);return Z.create(e,r.op)}function Oh(r){return r instanceof K?function(e){return`${e.field.canonicalString()} ${e.op} ${Fn(e.value)}`}(r):r instanceof Z?function(e){return e.op.toString()+" {"+e.getFilters().map(Oh).join(" ,")+"}"}(r):"Filter"}class Sp extends K{constructor(t,e,n){super(t,e,n),this.key=N.fromName(n.referenceValue)}matches(t){const e=N.comparator(t.key,this.key);return this.matchesComparison(e)}}class Pp extends K{constructor(t,e){super(t,"in",e),this.keys=Fh("in",e)}matches(t){return this.keys.some(e=>e.isEqual(t.key))}}class Vp extends K{constructor(t,e){super(t,"not-in",e),this.keys=Fh("not-in",e)}matches(t){return!this.keys.some(e=>e.isEqual(t.key))}}function Fh(r,t){var e;return(((e=t.arrayValue)==null?void 0:e.values)||[]).map(n=>N.fromName(n.referenceValue))}class Cp extends K{constructor(t,e){super(t,"array-contains",e)}matches(t){const e=t.data.field(this.field);return Hr(e)&&Gr(e.arrayValue,this.value)}}class Lh extends K{constructor(t,e){super(t,"in",e)}matches(t){const e=t.data.field(this.field);return e!==null&&Gr(this.value.arrayValue,e)}}class Dp extends K{constructor(t,e){super(t,"not-in",e)}matches(t){if(Gr(this.value.arrayValue,{nullValue:"NULL_VALUE"}))return!1;const e=t.data.field(this.field);return e!==null&&e.nullValue===void 0&&!Gr(this.value.arrayValue,e)}}class xp extends K{constructor(t,e){super(t,"array-contains-any",e)}matches(t){const e=t.data.field(this.field);return!(!Hr(e)||!e.arrayValue.values)&&e.arrayValue.values.some(n=>Gr(this.value.arrayValue,n))}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Np{constructor(t,e=null,n=[],s=[],i=null,a=null,u=null){this.path=t,this.collectionGroup=e,this.orderBy=n,this.filters=s,this.limit=i,this.startAt=a,this.endAt=u,this.Te=null}}function Uo(r,t=null,e=[],n=[],s=null,i=null,a=null){return new Np(r,t,e,n,s,i,a)}function Xe(r){const t=F(r);if(t.Te===null){let e=t.path.canonicalString();t.collectionGroup!==null&&(e+="|cg:"+t.collectionGroup),e+="|f:",e+=t.filters.map(n=>Bo(n)).join(","),e+="|ob:",e+=t.orderBy.map(n=>function(i){return i.field.canonicalString()+i.dir}(n)).join(","),mi(t.limit)||(e+="|l:",e+=t.limit),t.startAt&&(e+="|lb:",e+=t.startAt.inclusive?"b:":"a:",e+=t.startAt.position.map(n=>Fn(n)).join(",")),t.endAt&&(e+="|ub:",e+=t.endAt.inclusive?"a:":"b:",e+=t.endAt.position.map(n=>Fn(n)).join(",")),t.Te=e}return t.Te}function Zr(r,t){if(r.limit!==t.limit||r.orderBy.length!==t.orderBy.length)return!1;for(let e=0;e<r.orderBy.length;e++)if(!Rp(r.orderBy[e],t.orderBy[e]))return!1;if(r.filters.length!==t.filters.length)return!1;for(let e=0;e<r.filters.length;e++)if(!kh(r.filters[e],t.filters[e]))return!1;return r.collectionGroup===t.collectionGroup&&!!r.path.isEqual(t.path)&&!!Cc(r.startAt,t.startAt)&&Cc(r.endAt,t.endAt)}function Qs(r){return N.isDocumentKey(r.path)&&r.collectionGroup===null&&r.filters.length===0}function Js(r,t){return r.filters.filter(e=>e instanceof K&&e.field.isEqual(t))}function Dc(r,t,e){let n=Ms,s=!0;for(const i of Js(r,t)){let a=Ms,u=!0;switch(i.op){case"<":case"<=":a=Ap(i.value);break;case"==":case"in":case">=":a=i.value;break;case">":a=i.value,u=!1;break;case"!=":case"not-in":a=Ms}Sc({value:n,inclusive:s},{value:a,inclusive:u})<0&&(n=a,s=u)}if(e!==null){for(let i=0;i<r.orderBy.length;++i)if(r.orderBy[i].field.isEqual(t)){const a=e.position[i];Sc({value:n,inclusive:s},{value:a,inclusive:e.inclusive})<0&&(n=a,s=e.inclusive);break}}return{value:n,inclusive:s}}function xc(r,t,e){let n=pe,s=!0;for(const i of Js(r,t)){let a=pe,u=!0;switch(i.op){case">=":case">":a=bp(i.value),u=!1;break;case"==":case"in":case"<=":a=i.value;break;case"<":a=i.value,u=!1;break;case"!=":case"not-in":a=pe}Pc({value:n,inclusive:s},{value:a,inclusive:u})>0&&(n=a,s=u)}if(e!==null){for(let i=0;i<r.orderBy.length;++i)if(r.orderBy[i].field.isEqual(t)){const a=e.position[i];Pc({value:n,inclusive:s},{value:a,inclusive:e.inclusive})>0&&(n=a,s=e.inclusive);break}}return{value:n,inclusive:s}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Qn{constructor(t,e=null,n=[],s=[],i=null,a="F",u=null,l=null){this.path=t,this.collectionGroup=e,this.explicitOrderBy=n,this.filters=s,this.limit=i,this.limitType=a,this.startAt=u,this.endAt=l,this.Ie=null,this.Ee=null,this.Re=null,this.startAt,this.endAt}}function Bh(r,t,e,n,s,i,a,u){return new Qn(r,t,e,n,s,i,a,u)}function ts(r){return new Qn(r)}function Nc(r){return r.filters.length===0&&r.limit===null&&r.startAt==null&&r.endAt==null&&(r.explicitOrderBy.length===0||r.explicitOrderBy.length===1&&r.explicitOrderBy[0].field.isKeyField())}function kp(r){return N.isDocumentKey(r.path)&&r.collectionGroup===null&&r.filters.length===0}function Uh(r){return r.collectionGroup!==null}function xr(r){const t=F(r);if(t.Ie===null){t.Ie=[];const e=new Set;for(const i of t.explicitOrderBy)t.Ie.push(i),e.add(i.field.canonicalString());const n=t.explicitOrderBy.length>0?t.explicitOrderBy[t.explicitOrderBy.length-1].dir:"asc";(function(a){let u=new tt(ot.comparator);return a.filters.forEach(l=>{l.getFlattenedFilters().forEach(d=>{d.isInequality()&&(u=u.add(d.field))})}),u})(t).forEach(i=>{e.has(i.canonicalString())||i.isKeyField()||t.Ie.push(new Wr(i,n))}),e.has(ot.keyField().canonicalString())||t.Ie.push(new Wr(ot.keyField(),n))}return t.Ie}function Ft(r){const t=F(r);return t.Ee||(t.Ee=Mp(t,xr(r))),t.Ee}function Mp(r,t){if(r.limitType==="F")return Uo(r.path,r.collectionGroup,t,r.filters,r.limit,r.startAt,r.endAt);{t=t.map(s=>{const i=s.dir==="desc"?"asc":"desc";return new Wr(s.field,i)});const e=r.endAt?new Ln(r.endAt.position,r.endAt.inclusive):null,n=r.startAt?new Ln(r.startAt.position,r.startAt.inclusive):null;return Uo(r.path,r.collectionGroup,t,r.filters,r.limit,e,n)}}function qo(r,t){const e=r.filters.concat([t]);return new Qn(r.path,r.collectionGroup,r.explicitOrderBy.slice(),e,r.limit,r.limitType,r.startAt,r.endAt)}function Op(r,t){const e=r.explicitOrderBy.concat([t]);return new Qn(r.path,r.collectionGroup,e,r.filters.slice(),r.limit,r.limitType,r.startAt,r.endAt)}function Ys(r,t,e){return new Qn(r.path,r.collectionGroup,r.explicitOrderBy.slice(),r.filters.slice(),t,e,r.startAt,r.endAt)}function Ei(r,t){return Zr(Ft(r),Ft(t))&&r.limitType===t.limitType}function qh(r){return`${Xe(Ft(r))}|lt:${r.limitType}`}function In(r){return`Query(target=${function(e){let n=e.path.canonicalString();return e.collectionGroup!==null&&(n+=" collectionGroup="+e.collectionGroup),e.filters.length>0&&(n+=`, filters: [${e.filters.map(s=>Oh(s)).join(", ")}]`),mi(e.limit)||(n+=", limit: "+e.limit),e.orderBy.length>0&&(n+=`, orderBy: [${e.orderBy.map(s=>function(a){return`${a.field.canonicalString()} (${a.dir})`}(s)).join(", ")}]`),e.startAt&&(n+=", startAt: ",n+=e.startAt.inclusive?"b:":"a:",n+=e.startAt.position.map(s=>Fn(s)).join(",")),e.endAt&&(n+=", endAt: ",n+=e.endAt.inclusive?"a:":"b:",n+=e.endAt.position.map(s=>Fn(s)).join(",")),`Target(${n})`}(Ft(r))}; limitType=${r.limitType})`}function es(r,t){return t.isFoundDocument()&&function(n,s){const i=s.key.path;return n.collectionGroup!==null?s.key.hasCollectionId(n.collectionGroup)&&n.path.isPrefixOf(i):N.isDocumentKey(n.path)?n.path.isEqual(i):n.path.isImmediateParentOf(i)}(r,t)&&function(n,s){for(const i of xr(n))if(!i.field.isKeyField()&&s.data.field(i.field)===null)return!1;return!0}(r,t)&&function(n,s){for(const i of n.filters)if(!i.matches(s))return!1;return!0}(r,t)&&function(n,s){return!(n.startAt&&!function(a,u,l){const d=Vc(a,u,l);return a.inclusive?d<=0:d<0}(n.startAt,xr(n),s)||n.endAt&&!function(a,u,l){const d=Vc(a,u,l);return a.inclusive?d>=0:d>0}(n.endAt,xr(n),s))}(r,t)}function jh(r){return r.collectionGroup||(r.path.length%2==1?r.path.lastSegment():r.path.get(r.path.length-2))}function zh(r){return(t,e)=>{let n=!1;for(const s of xr(r)){const i=Fp(s,t,e);if(i!==0)return i;n=n||s.field.isKeyField()}return 0}}function Fp(r,t,e){const n=r.field.isKeyField()?N.comparator(t.key,e.key):function(i,a,u){const l=a.data.field(i),d=u.data.field(i);return l!==null&&d!==null?be(l,d):O(42886)}(r.field,t,e);switch(r.dir){case"asc":return n;case"desc":return-1*n;default:return O(19790,{direction:r.dir})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class se{constructor(t,e){this.mapKeyFn=t,this.equalsFn=e,this.inner={},this.innerSize=0}get(t){const e=this.mapKeyFn(t),n=this.inner[e];if(n!==void 0){for(const[s,i]of n)if(this.equalsFn(s,t))return i}}has(t){return this.get(t)!==void 0}set(t,e){const n=this.mapKeyFn(t),s=this.inner[n];if(s===void 0)return this.inner[n]=[[t,e]],void this.innerSize++;for(let i=0;i<s.length;i++)if(this.equalsFn(s[i][0],t))return void(s[i]=[t,e]);s.push([t,e]),this.innerSize++}delete(t){const e=this.mapKeyFn(t),n=this.inner[e];if(n===void 0)return!1;for(let s=0;s<n.length;s++)if(this.equalsFn(n[s][0],t))return n.length===1?delete this.inner[e]:n.splice(s,1),this.innerSize--,!0;return!1}forEach(t){Ce(this.inner,(e,n)=>{for(const[s,i]of n)t(s,i)})}isEmpty(){return wh(this.inner)}size(){return this.innerSize}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Lp=new rt(N.comparator);function Ot(){return Lp}const $h=new rt(N.comparator);function vr(...r){let t=$h;for(const e of r)t=t.insert(e.key,e);return t}function Gh(r){let t=$h;return r.forEach((e,n)=>t=t.insert(e,n.overlayedDocument)),t}function Ht(){return Nr()}function Kh(){return Nr()}function Nr(){return new se(r=>r.toString(),(r,t)=>r.isEqual(t))}const Bp=new rt(N.comparator),Up=new tt(N.comparator);function $(...r){let t=Up;for(const e of r)t=t.add(e);return t}const qp=new tt(j);function ma(){return qp}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ga(r,t){if(r.useProto3Json){if(isNaN(t))return{doubleValue:"NaN"};if(t===1/0)return{doubleValue:"Infinity"};if(t===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:Ur(t)?"-0":t}}function Hh(r){return{integerValue:""+r}}function Wh(r,t){return hh(t)?Hh(t):ga(r,t)}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ti{constructor(){this._=void 0}}function jp(r,t,e){return r instanceof Un?function(s,i){const a={fields:{[bh]:{stringValue:Ah},[Sh]:{timestampValue:{seconds:s.seconds,nanos:s.nanoseconds}}}};return i&&la(i)&&(i=yi(i)),i&&(a.fields[Rh]=i),{mapValue:a}}(e,t):r instanceof Ze?Jh(r,t):r instanceof tn?Yh(r,t):function(s,i){const a=Qh(s,i),u=kc(a)+kc(s.Ae);return Fo(a)&&Fo(s.Ae)?Hh(u):ga(s.serializer,u)}(r,t)}function zp(r,t,e){return r instanceof Ze?Jh(r,t):r instanceof tn?Yh(r,t):e}function Qh(r,t){return r instanceof qn?function(n){return Fo(n)||function(i){return!!i&&"doubleValue"in i}(n)}(t)?t:{integerValue:0}:null}class Un extends Ti{}class Ze extends Ti{constructor(t){super(),this.elements=t}}function Jh(r,t){const e=Xh(t);for(const n of r.elements)e.some(s=>Jt(s,n))||e.push(n);return{arrayValue:{values:e}}}class tn extends Ti{constructor(t){super(),this.elements=t}}function Yh(r,t){let e=Xh(t);for(const n of r.elements)e=e.filter(s=>!Jt(s,n));return{arrayValue:{values:e}}}class qn extends Ti{constructor(t,e){super(),this.serializer=t,this.Ae=e}}function kc(r){return it(r.integerValue||r.doubleValue)}function Xh(r){return Hr(r)&&r.arrayValue.values?r.arrayValue.values.slice():[]}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ns{constructor(t,e){this.field=t,this.transform=e}}function $p(r,t){return r.field.isEqual(t.field)&&function(n,s){return n instanceof Ze&&s instanceof Ze||n instanceof tn&&s instanceof tn?Cn(n.elements,s.elements,Jt):n instanceof qn&&s instanceof qn?Jt(n.Ae,s.Ae):n instanceof Un&&s instanceof Un}(r.transform,t.transform)}class Gp{constructor(t,e){this.version=t,this.transformResults=e}}class At{constructor(t,e){this.updateTime=t,this.exists=e}static none(){return new At}static exists(t){return new At(void 0,t)}static updateTime(t){return new At(t)}get isNone(){return this.updateTime===void 0&&this.exists===void 0}isEqual(t){return this.exists===t.exists&&(this.updateTime?!!t.updateTime&&this.updateTime.isEqual(t.updateTime):!t.updateTime)}}function Ls(r,t){return r.updateTime!==void 0?t.isFoundDocument()&&t.version.isEqual(r.updateTime):r.exists===void 0||r.exists===t.isFoundDocument()}class wi{}function Zh(r,t){if(!r.hasLocalMutations||t&&t.fields.length===0)return null;if(t===null)return r.isNoDocument()?new vi(r.key,At.none()):new Jn(r.key,r.data,At.none());{const e=r.data,n=vt.empty();let s=new tt(ot.comparator);for(let i of t.fields)if(!s.has(i)){let a=e.field(i);a===null&&i.length>1&&(i=i.popLast(),a=e.field(i)),a===null?n.delete(i):n.set(i,a),s=s.add(i)}return new ie(r.key,n,new Dt(s.toArray()),At.none())}}function Kp(r,t,e){r instanceof Jn?function(s,i,a){const u=s.value.clone(),l=Oc(s.fieldTransforms,i,a.transformResults);u.setAll(l),i.convertToFoundDocument(a.version,u).setHasCommittedMutations()}(r,t,e):r instanceof ie?function(s,i,a){if(!Ls(s.precondition,i))return void i.convertToUnknownDocument(a.version);const u=Oc(s.fieldTransforms,i,a.transformResults),l=i.data;l.setAll(td(s)),l.setAll(u),i.convertToFoundDocument(a.version,l).setHasCommittedMutations()}(r,t,e):function(s,i,a){i.convertToNoDocument(a.version).setHasCommittedMutations()}(0,t,e)}function kr(r,t,e,n){return r instanceof Jn?function(i,a,u,l){if(!Ls(i.precondition,a))return u;const d=i.value.clone(),f=Fc(i.fieldTransforms,l,a);return d.setAll(f),a.convertToFoundDocument(a.version,d).setHasLocalMutations(),null}(r,t,e,n):r instanceof ie?function(i,a,u,l){if(!Ls(i.precondition,a))return u;const d=Fc(i.fieldTransforms,l,a),f=a.data;return f.setAll(td(i)),f.setAll(d),a.convertToFoundDocument(a.version,f).setHasLocalMutations(),u===null?null:u.unionWith(i.fieldMask.fields).unionWith(i.fieldTransforms.map(g=>g.field))}(r,t,e,n):function(i,a,u){return Ls(i.precondition,a)?(a.convertToNoDocument(a.version).setHasLocalMutations(),null):u}(r,t,e)}function Hp(r,t){let e=null;for(const n of r.fieldTransforms){const s=t.data.field(n.field),i=Qh(n.transform,s||null);i!=null&&(e===null&&(e=vt.empty()),e.set(n.field,i))}return e||null}function Mc(r,t){return r.type===t.type&&!!r.key.isEqual(t.key)&&!!r.precondition.isEqual(t.precondition)&&!!function(n,s){return n===void 0&&s===void 0||!(!n||!s)&&Cn(n,s,(i,a)=>$p(i,a))}(r.fieldTransforms,t.fieldTransforms)&&(r.type===0?r.value.isEqual(t.value):r.type!==1||r.data.isEqual(t.data)&&r.fieldMask.isEqual(t.fieldMask))}class Jn extends wi{constructor(t,e,n,s=[]){super(),this.key=t,this.value=e,this.precondition=n,this.fieldTransforms=s,this.type=0}getFieldMask(){return null}}class ie extends wi{constructor(t,e,n,s,i=[]){super(),this.key=t,this.data=e,this.fieldMask=n,this.precondition=s,this.fieldTransforms=i,this.type=1}getFieldMask(){return this.fieldMask}}function td(r){const t=new Map;return r.fieldMask.fields.forEach(e=>{if(!e.isEmpty()){const n=r.data.field(e);t.set(e,n)}}),t}function Oc(r,t,e){const n=new Map;L(r.length===e.length,32656,{Ve:e.length,de:r.length});for(let s=0;s<e.length;s++){const i=r[s],a=i.transform,u=t.data.field(i.field);n.set(i.field,zp(a,u,e[s]))}return n}function Fc(r,t,e){const n=new Map;for(const s of r){const i=s.transform,a=e.data.field(s.field);n.set(s.field,jp(i,a,t))}return n}class vi extends wi{constructor(t,e){super(),this.key=t,this.precondition=e,this.type=2,this.fieldTransforms=[]}getFieldMask(){return null}}class ed extends wi{constructor(t,e){super(),this.key=t,this.precondition=e,this.type=3,this.fieldTransforms=[]}getFieldMask(){return null}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class pa{constructor(t,e,n,s){this.batchId=t,this.localWriteTime=e,this.baseMutations=n,this.mutations=s}applyToRemoteDocument(t,e){const n=e.mutationResults;for(let s=0;s<this.mutations.length;s++){const i=this.mutations[s];i.key.isEqual(t.key)&&Kp(i,t,n[s])}}applyToLocalView(t,e){for(const n of this.baseMutations)n.key.isEqual(t.key)&&(e=kr(n,t,e,this.localWriteTime));for(const n of this.mutations)n.key.isEqual(t.key)&&(e=kr(n,t,e,this.localWriteTime));return e}applyToLocalDocumentSet(t,e){const n=Kh();return this.mutations.forEach(s=>{const i=t.get(s.key),a=i.overlayedDocument;let u=this.applyToLocalView(a,i.mutatedFields);u=e.has(s.key)?null:u;const l=Zh(a,u);l!==null&&n.set(s.key,l),a.isValidDocument()||a.convertToNoDocument(B.min())}),n}keys(){return this.mutations.reduce((t,e)=>t.add(e.key),$())}isEqual(t){return this.batchId===t.batchId&&Cn(this.mutations,t.mutations,(e,n)=>Mc(e,n))&&Cn(this.baseMutations,t.baseMutations,(e,n)=>Mc(e,n))}}class _a{constructor(t,e,n,s){this.batch=t,this.commitVersion=e,this.mutationResults=n,this.docVersions=s}static from(t,e,n){L(t.mutations.length===n.length,58842,{me:t.mutations.length,fe:n.length});let s=function(){return Bp}();const i=t.mutations;for(let a=0;a<i.length;a++)s=s.insert(i[a].key,n[a].version);return new _a(t,e,n,s)}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ya{constructor(t,e){this.largestBatchId=t,this.mutation=e}getKey(){return this.mutation.key}isEqual(t){return t!==null&&this.mutation===t.mutation}toString(){return`Overlay{
      largestBatchId: ${this.largestBatchId},
      mutation: ${this.mutation.toString()}
    }`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Wp{constructor(t,e){this.count=t,this.unchangedNames=e}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var dt,H;function Qp(r){switch(r){case P.OK:return O(64938);case P.CANCELLED:case P.UNKNOWN:case P.DEADLINE_EXCEEDED:case P.RESOURCE_EXHAUSTED:case P.INTERNAL:case P.UNAVAILABLE:case P.UNAUTHENTICATED:return!1;case P.INVALID_ARGUMENT:case P.NOT_FOUND:case P.ALREADY_EXISTS:case P.PERMISSION_DENIED:case P.FAILED_PRECONDITION:case P.ABORTED:case P.OUT_OF_RANGE:case P.UNIMPLEMENTED:case P.DATA_LOSS:return!0;default:return O(15467,{code:r})}}function nd(r){if(r===void 0)return ht("GRPC error has no .code"),P.UNKNOWN;switch(r){case dt.OK:return P.OK;case dt.CANCELLED:return P.CANCELLED;case dt.UNKNOWN:return P.UNKNOWN;case dt.DEADLINE_EXCEEDED:return P.DEADLINE_EXCEEDED;case dt.RESOURCE_EXHAUSTED:return P.RESOURCE_EXHAUSTED;case dt.INTERNAL:return P.INTERNAL;case dt.UNAVAILABLE:return P.UNAVAILABLE;case dt.UNAUTHENTICATED:return P.UNAUTHENTICATED;case dt.INVALID_ARGUMENT:return P.INVALID_ARGUMENT;case dt.NOT_FOUND:return P.NOT_FOUND;case dt.ALREADY_EXISTS:return P.ALREADY_EXISTS;case dt.PERMISSION_DENIED:return P.PERMISSION_DENIED;case dt.FAILED_PRECONDITION:return P.FAILED_PRECONDITION;case dt.ABORTED:return P.ABORTED;case dt.OUT_OF_RANGE:return P.OUT_OF_RANGE;case dt.UNIMPLEMENTED:return P.UNIMPLEMENTED;case dt.DATA_LOSS:return P.DATA_LOSS;default:return O(39323,{code:r})}}(H=dt||(dt={}))[H.OK=0]="OK",H[H.CANCELLED=1]="CANCELLED",H[H.UNKNOWN=2]="UNKNOWN",H[H.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",H[H.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",H[H.NOT_FOUND=5]="NOT_FOUND",H[H.ALREADY_EXISTS=6]="ALREADY_EXISTS",H[H.PERMISSION_DENIED=7]="PERMISSION_DENIED",H[H.UNAUTHENTICATED=16]="UNAUTHENTICATED",H[H.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",H[H.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",H[H.ABORTED=10]="ABORTED",H[H.OUT_OF_RANGE=11]="OUT_OF_RANGE",H[H.UNIMPLEMENTED=12]="UNIMPLEMENTED",H[H.INTERNAL=13]="INTERNAL",H[H.UNAVAILABLE=14]="UNAVAILABLE",H[H.DATA_LOSS=15]="DATA_LOSS";/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Jp(){return new TextEncoder}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Yp=new Ie([4294967295,4294967295],0);function Lc(r){const t=Jp().encode(r),e=new Wl;return e.update(t),new Uint8Array(e.digest())}function Bc(r){const t=new DataView(r.buffer),e=t.getUint32(0,!0),n=t.getUint32(4,!0),s=t.getUint32(8,!0),i=t.getUint32(12,!0);return[new Ie([e,n],0),new Ie([s,i],0)]}class Ia{constructor(t,e,n){if(this.bitmap=t,this.padding=e,this.hashCount=n,e<0||e>=8)throw new Ar(`Invalid padding: ${e}`);if(n<0)throw new Ar(`Invalid hash count: ${n}`);if(t.length>0&&this.hashCount===0)throw new Ar(`Invalid hash count: ${n}`);if(t.length===0&&e!==0)throw new Ar(`Invalid padding when bitmap length is 0: ${e}`);this.ge=8*t.length-e,this.pe=Ie.fromNumber(this.ge)}ye(t,e,n){let s=t.add(e.multiply(Ie.fromNumber(n)));return s.compare(Yp)===1&&(s=new Ie([s.getBits(0),s.getBits(1)],0)),s.modulo(this.pe).toNumber()}we(t){return!!(this.bitmap[Math.floor(t/8)]&1<<t%8)}mightContain(t){if(this.ge===0)return!1;const e=Lc(t),[n,s]=Bc(e);for(let i=0;i<this.hashCount;i++){const a=this.ye(n,s,i);if(!this.we(a))return!1}return!0}static create(t,e,n){const s=t%8==0?0:8-t%8,i=new Uint8Array(Math.ceil(t/8)),a=new Ia(i,s,e);return n.forEach(u=>a.insert(u)),a}insert(t){if(this.ge===0)return;const e=Lc(t),[n,s]=Bc(e);for(let i=0;i<this.hashCount;i++){const a=this.ye(n,s,i);this.be(a)}}be(t){const e=Math.floor(t/8),n=t%8;this.bitmap[e]|=1<<n}}class Ar extends Error{constructor(){super(...arguments),this.name="BloomFilterError"}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rs{constructor(t,e,n,s,i){this.snapshotVersion=t,this.targetChanges=e,this.targetMismatches=n,this.documentUpdates=s,this.resolvedLimboDocuments=i}static createSynthesizedRemoteEventForCurrentChange(t,e,n){const s=new Map;return s.set(t,ss.createSynthesizedTargetChangeForCurrentChange(t,e,n)),new rs(B.min(),s,new rt(j),Ot(),$())}}class ss{constructor(t,e,n,s,i){this.resumeToken=t,this.current=e,this.addedDocuments=n,this.modifiedDocuments=s,this.removedDocuments=i}static createSynthesizedTargetChangeForCurrentChange(t,e,n){return new ss(n,e,$(),$(),$())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Bs{constructor(t,e,n,s){this.Se=t,this.removedTargetIds=e,this.key=n,this.De=s}}class rd{constructor(t,e){this.targetId=t,this.Ce=e}}class sd{constructor(t,e,n=lt.EMPTY_BYTE_STRING,s=null){this.state=t,this.targetIds=e,this.resumeToken=n,this.cause=s}}class Uc{constructor(){this.ve=0,this.Fe=qc(),this.Me=lt.EMPTY_BYTE_STRING,this.xe=!1,this.Oe=!0}get current(){return this.xe}get resumeToken(){return this.Me}get Ne(){return this.ve!==0}get Be(){return this.Oe}Le(t){t.approximateByteSize()>0&&(this.Oe=!0,this.Me=t)}ke(){let t=$(),e=$(),n=$();return this.Fe.forEach((s,i)=>{switch(i){case 0:t=t.add(s);break;case 2:e=e.add(s);break;case 1:n=n.add(s);break;default:O(38017,{changeType:i})}}),new ss(this.Me,this.xe,t,e,n)}Ke(){this.Oe=!1,this.Fe=qc()}qe(t,e){this.Oe=!0,this.Fe=this.Fe.insert(t,e)}Ue(t){this.Oe=!0,this.Fe=this.Fe.remove(t)}$e(){this.ve+=1}We(){this.ve-=1,L(this.ve>=0,3241,{ve:this.ve})}Qe(){this.Oe=!0,this.xe=!0}}class Xp{constructor(t){this.Ge=t,this.ze=new Map,this.je=Ot(),this.He=Rs(),this.Je=Rs(),this.Ze=new rt(j)}Xe(t){for(const e of t.Se)t.De&&t.De.isFoundDocument()?this.Ye(e,t.De):this.et(e,t.key,t.De);for(const e of t.removedTargetIds)this.et(e,t.key,t.De)}tt(t){this.forEachTarget(t,e=>{const n=this.nt(e);switch(t.state){case 0:this.rt(e)&&n.Le(t.resumeToken);break;case 1:n.We(),n.Ne||n.Ke(),n.Le(t.resumeToken);break;case 2:n.We(),n.Ne||this.removeTarget(e);break;case 3:this.rt(e)&&(n.Qe(),n.Le(t.resumeToken));break;case 4:this.rt(e)&&(this.it(e),n.Le(t.resumeToken));break;default:O(56790,{state:t.state})}})}forEachTarget(t,e){t.targetIds.length>0?t.targetIds.forEach(e):this.ze.forEach((n,s)=>{this.rt(s)&&e(s)})}st(t){const e=t.targetId,n=t.Ce.count,s=this.ot(e);if(s){const i=s.target;if(Qs(i))if(n===0){const a=new N(i.path);this.et(e,a,ct.newNoDocument(a,B.min()))}else L(n===1,20013,{expectedCount:n});else{const a=this._t(e);if(a!==n){const u=this.ut(t),l=u?this.ct(u,t,a):1;if(l!==0){this.it(e);const d=l===2?"TargetPurposeExistenceFilterMismatchBloom":"TargetPurposeExistenceFilterMismatch";this.Ze=this.Ze.insert(e,d)}}}}}ut(t){const e=t.Ce.unchangedNames;if(!e||!e.bits)return null;const{bits:{bitmap:n="",padding:s=0},hashCount:i=0}=e;let a,u;try{a=re(n).toUint8Array()}catch(l){if(l instanceof vh)return Vn("Decoding the base64 bloom filter in existence filter failed ("+l.message+"); ignoring the bloom filter and falling back to full re-query."),null;throw l}try{u=new Ia(a,s,i)}catch(l){return Vn(l instanceof Ar?"BloomFilter error: ":"Applying bloom filter failed: ",l),null}return u.ge===0?null:u}ct(t,e,n){return e.Ce.count===n-this.Pt(t,e.targetId)?0:2}Pt(t,e){const n=this.Ge.getRemoteKeysForTarget(e);let s=0;return n.forEach(i=>{const a=this.Ge.ht(),u=`projects/${a.projectId}/databases/${a.database}/documents/${i.path.canonicalString()}`;t.mightContain(u)||(this.et(e,i,null),s++)}),s}Tt(t){const e=new Map;this.ze.forEach((i,a)=>{const u=this.ot(a);if(u){if(i.current&&Qs(u.target)){const l=new N(u.target.path);this.It(l).has(a)||this.Et(a,l)||this.et(a,l,ct.newNoDocument(l,t))}i.Be&&(e.set(a,i.ke()),i.Ke())}});let n=$();this.Je.forEach((i,a)=>{let u=!0;a.forEachWhile(l=>{const d=this.ot(l);return!d||d.purpose==="TargetPurposeLimboResolution"||(u=!1,!1)}),u&&(n=n.add(i))}),this.je.forEach((i,a)=>a.setReadTime(t));const s=new rs(t,e,this.Ze,this.je,n);return this.je=Ot(),this.He=Rs(),this.Je=Rs(),this.Ze=new rt(j),s}Ye(t,e){if(!this.rt(t))return;const n=this.Et(t,e.key)?2:0;this.nt(t).qe(e.key,n),this.je=this.je.insert(e.key,e),this.He=this.He.insert(e.key,this.It(e.key).add(t)),this.Je=this.Je.insert(e.key,this.Rt(e.key).add(t))}et(t,e,n){if(!this.rt(t))return;const s=this.nt(t);this.Et(t,e)?s.qe(e,1):s.Ue(e),this.Je=this.Je.insert(e,this.Rt(e).delete(t)),this.Je=this.Je.insert(e,this.Rt(e).add(t)),n&&(this.je=this.je.insert(e,n))}removeTarget(t){this.ze.delete(t)}_t(t){const e=this.nt(t).ke();return this.Ge.getRemoteKeysForTarget(t).size+e.addedDocuments.size-e.removedDocuments.size}$e(t){this.nt(t).$e()}nt(t){let e=this.ze.get(t);return e||(e=new Uc,this.ze.set(t,e)),e}Rt(t){let e=this.Je.get(t);return e||(e=new tt(j),this.Je=this.Je.insert(t,e)),e}It(t){let e=this.He.get(t);return e||(e=new tt(j),this.He=this.He.insert(t,e)),e}rt(t){const e=this.ot(t)!==null;return e||V("WatchChangeAggregator","Detected inactive target",t),e}ot(t){const e=this.ze.get(t);return e&&e.Ne?null:this.Ge.At(t)}it(t){this.ze.set(t,new Uc),this.Ge.getRemoteKeysForTarget(t).forEach(e=>{this.et(t,e,null)})}Et(t,e){return this.Ge.getRemoteKeysForTarget(t).has(e)}}function Rs(){return new rt(N.comparator)}function qc(){return new rt(N.comparator)}const Zp={asc:"ASCENDING",desc:"DESCENDING"},t_={"<":"LESS_THAN","<=":"LESS_THAN_OR_EQUAL",">":"GREATER_THAN",">=":"GREATER_THAN_OR_EQUAL","==":"EQUAL","!=":"NOT_EQUAL","array-contains":"ARRAY_CONTAINS",in:"IN","not-in":"NOT_IN","array-contains-any":"ARRAY_CONTAINS_ANY"},e_={and:"AND",or:"OR"};class n_{constructor(t,e){this.databaseId=t,this.useProto3Json=e}}function jo(r,t){return r.useProto3Json||mi(t)?t:{value:t}}function jn(r,t){return r.useProto3Json?`${new Date(1e3*t.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+t.nanoseconds).slice(-9)}Z`:{seconds:""+t.seconds,nanos:t.nanoseconds}}function id(r,t){return r.useProto3Json?t.toBase64():t.toUint8Array()}function r_(r,t){return jn(r,t.toTimestamp())}function Pt(r){return L(!!r,49232),B.fromTimestamp(function(e){const n=ne(e);return new X(n.seconds,n.nanos)}(r))}function Ea(r,t){return zo(r,t).canonicalString()}function zo(r,t){const e=function(s){return new J(["projects",s.projectId,"databases",s.database])}(r).child("documents");return t===void 0?e:e.child(t)}function od(r){const t=J.fromString(r);return L(gd(t),10190,{key:t.toString()}),t}function Xs(r,t){return Ea(r.databaseId,t.path)}function Je(r,t){const e=od(t);if(e.get(1)!==r.databaseId.projectId)throw new C(P.INVALID_ARGUMENT,"Tried to deserialize key from different project: "+e.get(1)+" vs "+r.databaseId.projectId);if(e.get(3)!==r.databaseId.database)throw new C(P.INVALID_ARGUMENT,"Tried to deserialize key from different database: "+e.get(3)+" vs "+r.databaseId.database);return new N(cd(e))}function ad(r,t){return Ea(r.databaseId,t)}function ud(r){const t=od(r);return t.length===4?J.emptyPath():cd(t)}function $o(r){return new J(["projects",r.databaseId.projectId,"databases",r.databaseId.database]).canonicalString()}function cd(r){return L(r.length>4&&r.get(4)==="documents",29091,{key:r.toString()}),r.popFirst(5)}function jc(r,t,e){return{name:Xs(r,t),fields:e.value.mapValue.fields}}function s_(r,t,e){const n=Je(r,t.name),s=Pt(t.updateTime),i=t.createTime?Pt(t.createTime):B.min(),a=new vt({mapValue:{fields:t.fields}}),u=ct.newFoundDocument(n,s,i,a);return e&&u.setHasCommittedMutations(),e?u.setHasCommittedMutations():u}function i_(r,t){let e;if("targetChange"in t){t.targetChange;const n=function(d){return d==="NO_CHANGE"?0:d==="ADD"?1:d==="REMOVE"?2:d==="CURRENT"?3:d==="RESET"?4:O(39313,{state:d})}(t.targetChange.targetChangeType||"NO_CHANGE"),s=t.targetChange.targetIds||[],i=function(d,f){return d.useProto3Json?(L(f===void 0||typeof f=="string",58123),lt.fromBase64String(f||"")):(L(f===void 0||f instanceof Buffer||f instanceof Uint8Array,16193),lt.fromUint8Array(f||new Uint8Array))}(r,t.targetChange.resumeToken),a=t.targetChange.cause,u=a&&function(d){const f=d.code===void 0?P.UNKNOWN:nd(d.code);return new C(f,d.message||"")}(a);e=new sd(n,s,i,u||null)}else if("documentChange"in t){t.documentChange;const n=t.documentChange;n.document,n.document.name,n.document.updateTime;const s=Je(r,n.document.name),i=Pt(n.document.updateTime),a=n.document.createTime?Pt(n.document.createTime):B.min(),u=new vt({mapValue:{fields:n.document.fields}}),l=ct.newFoundDocument(s,i,a,u),d=n.targetIds||[],f=n.removedTargetIds||[];e=new Bs(d,f,l.key,l)}else if("documentDelete"in t){t.documentDelete;const n=t.documentDelete;n.document;const s=Je(r,n.document),i=n.readTime?Pt(n.readTime):B.min(),a=ct.newNoDocument(s,i),u=n.removedTargetIds||[];e=new Bs([],u,a.key,a)}else if("documentRemove"in t){t.documentRemove;const n=t.documentRemove;n.document;const s=Je(r,n.document),i=n.removedTargetIds||[];e=new Bs([],i,s,null)}else{if(!("filter"in t))return O(11601,{Vt:t});{t.filter;const n=t.filter;n.targetId;const{count:s=0,unchangedNames:i}=n,a=new Wp(s,i),u=n.targetId;e=new rd(u,a)}}return e}function Zs(r,t){let e;if(t instanceof Jn)e={update:jc(r,t.key,t.value)};else if(t instanceof vi)e={delete:Xs(r,t.key)};else if(t instanceof ie)e={update:jc(r,t.key,t.data),updateMask:h_(t.fieldMask)};else{if(!(t instanceof ed))return O(16599,{dt:t.type});e={verify:Xs(r,t.key)}}return t.fieldTransforms.length>0&&(e.updateTransforms=t.fieldTransforms.map(n=>function(i,a){const u=a.transform;if(u instanceof Un)return{fieldPath:a.field.canonicalString(),setToServerValue:"REQUEST_TIME"};if(u instanceof Ze)return{fieldPath:a.field.canonicalString(),appendMissingElements:{values:u.elements}};if(u instanceof tn)return{fieldPath:a.field.canonicalString(),removeAllFromArray:{values:u.elements}};if(u instanceof qn)return{fieldPath:a.field.canonicalString(),increment:u.Ae};throw O(20930,{transform:a.transform})}(0,n))),t.precondition.isNone||(e.currentDocument=function(s,i){return i.updateTime!==void 0?{updateTime:r_(s,i.updateTime)}:i.exists!==void 0?{exists:i.exists}:O(27497)}(r,t.precondition)),e}function Go(r,t){const e=t.currentDocument?function(i){return i.updateTime!==void 0?At.updateTime(Pt(i.updateTime)):i.exists!==void 0?At.exists(i.exists):At.none()}(t.currentDocument):At.none(),n=t.updateTransforms?t.updateTransforms.map(s=>function(a,u){let l=null;if("setToServerValue"in u)L(u.setToServerValue==="REQUEST_TIME",16630,{proto:u}),l=new Un;else if("appendMissingElements"in u){const f=u.appendMissingElements.values||[];l=new Ze(f)}else if("removeAllFromArray"in u){const f=u.removeAllFromArray.values||[];l=new tn(f)}else"increment"in u?l=new qn(a,u.increment):O(16584,{proto:u});const d=ot.fromServerFormat(u.fieldPath);return new ns(d,l)}(r,s)):[];if(t.update){t.update.name;const s=Je(r,t.update.name),i=new vt({mapValue:{fields:t.update.fields}});if(t.updateMask){const a=function(l){const d=l.fieldPaths||[];return new Dt(d.map(f=>ot.fromServerFormat(f)))}(t.updateMask);return new ie(s,i,a,e,n)}return new Jn(s,i,e,n)}if(t.delete){const s=Je(r,t.delete);return new vi(s,e)}if(t.verify){const s=Je(r,t.verify);return new ed(s,e)}return O(1463,{proto:t})}function o_(r,t){return r&&r.length>0?(L(t!==void 0,14353),r.map(e=>function(s,i){let a=s.updateTime?Pt(s.updateTime):Pt(i);return a.isEqual(B.min())&&(a=Pt(i)),new Gp(a,s.transformResults||[])}(e,t))):[]}function ld(r,t){return{documents:[ad(r,t.path)]}}function hd(r,t){const e={structuredQuery:{}},n=t.path;let s;t.collectionGroup!==null?(s=n,e.structuredQuery.from=[{collectionId:t.collectionGroup,allDescendants:!0}]):(s=n.popLast(),e.structuredQuery.from=[{collectionId:n.lastSegment()}]),e.parent=ad(r,s);const i=function(d){if(d.length!==0)return md(Z.create(d,"and"))}(t.filters);i&&(e.structuredQuery.where=i);const a=function(d){if(d.length!==0)return d.map(f=>function(_){return{field:En(_.field),direction:u_(_.dir)}}(f))}(t.orderBy);a&&(e.structuredQuery.orderBy=a);const u=jo(r,t.limit);return u!==null&&(e.structuredQuery.limit=u),t.startAt&&(e.structuredQuery.startAt=function(d){return{before:d.inclusive,values:d.position}}(t.startAt)),t.endAt&&(e.structuredQuery.endAt=function(d){return{before:!d.inclusive,values:d.position}}(t.endAt)),{ft:e,parent:s}}function dd(r){let t=ud(r.parent);const e=r.structuredQuery,n=e.from?e.from.length:0;let s=null;if(n>0){L(n===1,65062);const f=e.from[0];f.allDescendants?s=f.collectionId:t=t.child(f.collectionId)}let i=[];e.where&&(i=function(g){const _=fd(g);return _ instanceof Z&&fa(_)?_.getFilters():[_]}(e.where));let a=[];e.orderBy&&(a=function(g){return g.map(_=>function(D){return new Wr(Tn(D.field),function(M){switch(M){case"ASCENDING":return"asc";case"DESCENDING":return"desc";default:return}}(D.direction))}(_))}(e.orderBy));let u=null;e.limit&&(u=function(g){let _;return _=typeof g=="object"?g.value:g,mi(_)?null:_}(e.limit));let l=null;e.startAt&&(l=function(g){const _=!!g.before,S=g.values||[];return new Ln(S,_)}(e.startAt));let d=null;return e.endAt&&(d=function(g){const _=!g.before,S=g.values||[];return new Ln(S,_)}(e.endAt)),Bh(t,s,a,i,u,"F",l,d)}function a_(r,t){const e=function(s){switch(s){case"TargetPurposeListen":return null;case"TargetPurposeExistenceFilterMismatch":return"existence-filter-mismatch";case"TargetPurposeExistenceFilterMismatchBloom":return"existence-filter-mismatch-bloom";case"TargetPurposeLimboResolution":return"limbo-document";default:return O(28987,{purpose:s})}}(t.purpose);return e==null?null:{"goog-listen-tags":e}}function fd(r){return r.unaryFilter!==void 0?function(e){switch(e.unaryFilter.op){case"IS_NAN":const n=Tn(e.unaryFilter.field);return K.create(n,"==",{doubleValue:NaN});case"IS_NULL":const s=Tn(e.unaryFilter.field);return K.create(s,"==",{nullValue:"NULL_VALUE"});case"IS_NOT_NAN":const i=Tn(e.unaryFilter.field);return K.create(i,"!=",{doubleValue:NaN});case"IS_NOT_NULL":const a=Tn(e.unaryFilter.field);return K.create(a,"!=",{nullValue:"NULL_VALUE"});case"OPERATOR_UNSPECIFIED":return O(61313);default:return O(60726)}}(r):r.fieldFilter!==void 0?function(e){return K.create(Tn(e.fieldFilter.field),function(s){switch(s){case"EQUAL":return"==";case"NOT_EQUAL":return"!=";case"GREATER_THAN":return">";case"GREATER_THAN_OR_EQUAL":return">=";case"LESS_THAN":return"<";case"LESS_THAN_OR_EQUAL":return"<=";case"ARRAY_CONTAINS":return"array-contains";case"IN":return"in";case"NOT_IN":return"not-in";case"ARRAY_CONTAINS_ANY":return"array-contains-any";case"OPERATOR_UNSPECIFIED":return O(58110);default:return O(50506)}}(e.fieldFilter.op),e.fieldFilter.value)}(r):r.compositeFilter!==void 0?function(e){return Z.create(e.compositeFilter.filters.map(n=>fd(n)),function(s){switch(s){case"AND":return"and";case"OR":return"or";default:return O(1026)}}(e.compositeFilter.op))}(r):O(30097,{filter:r})}function u_(r){return Zp[r]}function c_(r){return t_[r]}function l_(r){return e_[r]}function En(r){return{fieldPath:r.canonicalString()}}function Tn(r){return ot.fromServerFormat(r.fieldPath)}function md(r){return r instanceof K?function(e){if(e.op==="=="){if(Rc(e.value))return{unaryFilter:{field:En(e.field),op:"IS_NAN"}};if(bc(e.value))return{unaryFilter:{field:En(e.field),op:"IS_NULL"}}}else if(e.op==="!="){if(Rc(e.value))return{unaryFilter:{field:En(e.field),op:"IS_NOT_NAN"}};if(bc(e.value))return{unaryFilter:{field:En(e.field),op:"IS_NOT_NULL"}}}return{fieldFilter:{field:En(e.field),op:c_(e.op),value:e.value}}}(r):r instanceof Z?function(e){const n=e.getFilters().map(s=>md(s));return n.length===1?n[0]:{compositeFilter:{op:l_(e.op),filters:n}}}(r):O(54877,{filter:r})}function h_(r){const t=[];return r.fields.forEach(e=>t.push(e.canonicalString())),{fieldPaths:t}}function gd(r){return r.length>=4&&r.get(0)==="projects"&&r.get(2)==="databases"}function pd(r){return!!r&&typeof r._toProto=="function"&&r._protoValueType==="ProtoValue"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Zt{constructor(t,e,n,s,i=B.min(),a=B.min(),u=lt.EMPTY_BYTE_STRING,l=null){this.target=t,this.targetId=e,this.purpose=n,this.sequenceNumber=s,this.snapshotVersion=i,this.lastLimboFreeSnapshotVersion=a,this.resumeToken=u,this.expectedCount=l}withSequenceNumber(t){return new Zt(this.target,this.targetId,this.purpose,t,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,this.expectedCount)}withResumeToken(t,e){return new Zt(this.target,this.targetId,this.purpose,this.sequenceNumber,e,this.lastLimboFreeSnapshotVersion,t,null)}withExpectedCount(t){return new Zt(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,t)}withLastLimboFreeSnapshotVersion(t){return new Zt(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,t,this.resumeToken,this.expectedCount)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _d{constructor(t){this.yt=t}}function d_(r,t){let e;if(t.document)e=s_(r.yt,t.document,!!t.hasCommittedMutations);else if(t.noDocument){const n=N.fromSegments(t.noDocument.path),s=nn(t.noDocument.readTime);e=ct.newNoDocument(n,s),t.hasCommittedMutations&&e.setHasCommittedMutations()}else{if(!t.unknownDocument)return O(56709);{const n=N.fromSegments(t.unknownDocument.path),s=nn(t.unknownDocument.version);e=ct.newUnknownDocument(n,s)}}return t.readTime&&e.setReadTime(function(s){const i=new X(s[0],s[1]);return B.fromTimestamp(i)}(t.readTime)),e}function zc(r,t){const e=t.key,n={prefixPath:e.getCollectionPath().popLast().toArray(),collectionGroup:e.collectionGroup,documentId:e.path.lastSegment(),readTime:ti(t.readTime),hasCommittedMutations:t.hasCommittedMutations};if(t.isFoundDocument())n.document=function(i,a){return{name:Xs(i,a.key),fields:a.data.value.mapValue.fields,updateTime:jn(i,a.version.toTimestamp()),createTime:jn(i,a.createTime.toTimestamp())}}(r.yt,t);else if(t.isNoDocument())n.noDocument={path:e.path.toArray(),readTime:en(t.version)};else{if(!t.isUnknownDocument())return O(57904,{document:t});n.unknownDocument={path:e.path.toArray(),version:en(t.version)}}return n}function ti(r){const t=r.toTimestamp();return[t.seconds,t.nanoseconds]}function en(r){const t=r.toTimestamp();return{seconds:t.seconds,nanoseconds:t.nanoseconds}}function nn(r){const t=new X(r.seconds,r.nanoseconds);return B.fromTimestamp(t)}function $e(r,t){const e=(t.baseMutations||[]).map(i=>Go(r.yt,i));for(let i=0;i<t.mutations.length-1;++i){const a=t.mutations[i];if(i+1<t.mutations.length&&t.mutations[i+1].transform!==void 0){const u=t.mutations[i+1];a.updateTransforms=u.transform.fieldTransforms,t.mutations.splice(i+1,1),++i}}const n=t.mutations.map(i=>Go(r.yt,i)),s=X.fromMillis(t.localWriteTimeMs);return new pa(t.batchId,s,e,n)}function br(r){const t=nn(r.readTime),e=r.lastLimboFreeSnapshotVersion!==void 0?nn(r.lastLimboFreeSnapshotVersion):B.min();let n;return n=function(i){return i.documents!==void 0}(r.query)?function(i){const a=i.documents.length;return L(a===1,1966,{count:a}),Ft(ts(ud(i.documents[0])))}(r.query):function(i){return Ft(dd(i))}(r.query),new Zt(n,r.targetId,"TargetPurposeListen",r.lastListenSequenceNumber,t,e,lt.fromBase64String(r.resumeToken))}function yd(r,t){const e=en(t.snapshotVersion),n=en(t.lastLimboFreeSnapshotVersion);let s;s=Qs(t.target)?ld(r.yt,t.target):hd(r.yt,t.target).ft;const i=t.resumeToken.toBase64();return{targetId:t.targetId,canonicalId:Xe(t.target),readTime:e,resumeToken:i,lastListenSequenceNumber:t.sequenceNumber,lastLimboFreeSnapshotVersion:n,query:s}}function Id(r){const t=dd({parent:r.parent,structuredQuery:r.structuredQuery});return r.limitType==="LAST"?Ys(t,t.limit,"L"):t}function po(r,t){return new ya(t.largestBatchId,Go(r.yt,t.overlayMutation))}function $c(r,t){const e=t.path.lastSegment();return[r,bt(t.path.popLast()),e]}function Gc(r,t,e,n){return{indexId:r,uid:t,sequenceNumber:e,readTime:en(n.readTime),documentKey:bt(n.documentKey.path),largestBatchId:n.largestBatchId}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class f_{getBundleMetadata(t,e){return Kc(t).get(e).next(n=>{if(n)return function(i){return{id:i.bundleId,createTime:nn(i.createTime),version:i.version}}(n)})}saveBundleMetadata(t,e){return Kc(t).put(function(s){return{bundleId:s.id,createTime:en(Pt(s.createTime)),version:s.version}}(e))}getNamedQuery(t,e){return Hc(t).get(e).next(n=>{if(n)return function(i){return{name:i.name,query:Id(i.bundledQuery),readTime:nn(i.readTime)}}(n)})}saveNamedQuery(t,e){return Hc(t).put(function(s){return{name:s.name,readTime:en(Pt(s.readTime)),bundledQuery:s.bundledQuery}}(e))}}function Kc(r){return gt(r,gi)}function Hc(r){return gt(r,pi)}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ai{constructor(t,e){this.serializer=t,this.userId=e}static wt(t,e){const n=e.uid||"";return new Ai(t,n)}getOverlay(t,e){return pr(t).get($c(this.userId,e)).next(n=>n?po(this.serializer,n):null)}getOverlays(t,e){const n=Ht();return v.forEach(e,s=>this.getOverlay(t,s).next(i=>{i!==null&&n.set(s,i)})).next(()=>n)}saveOverlays(t,e,n){const s=[];return n.forEach((i,a)=>{const u=new ya(e,a);s.push(this.bt(t,u))}),v.waitFor(s)}removeOverlaysForBatchId(t,e,n){const s=new Set;e.forEach(a=>s.add(bt(a.getCollectionPath())));const i=[];return s.forEach(a=>{const u=IDBKeyRange.bound([this.userId,a,n],[this.userId,a,n+1],!1,!0);i.push(pr(t).X(ko,u))}),v.waitFor(i)}getOverlaysForCollection(t,e,n){const s=Ht(),i=bt(e),a=IDBKeyRange.bound([this.userId,i,n],[this.userId,i,Number.POSITIVE_INFINITY],!0);return pr(t).H(ko,a).next(u=>{for(const l of u){const d=po(this.serializer,l);s.set(d.getKey(),d)}return s})}getOverlaysForCollectionGroup(t,e,n,s){const i=Ht();let a;const u=IDBKeyRange.bound([this.userId,e,n],[this.userId,e,Number.POSITIVE_INFINITY],!0);return pr(t).ee({index:_h,range:u},(l,d,f)=>{const g=po(this.serializer,d);i.size()<s||g.largestBatchId===a?(i.set(g.getKey(),g),a=g.largestBatchId):f.done()}).next(()=>i)}bt(t,e){return pr(t).put(function(s,i,a){const[u,l,d]=$c(i,a.mutation.key);return{userId:i,collectionPath:l,documentId:d,collectionGroup:a.mutation.key.getCollectionGroup(),largestBatchId:a.largestBatchId,overlayMutation:Zs(s.yt,a.mutation)}}(this.serializer,this.userId,e))}}function pr(r){return gt(r,_i)}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class m_{St(t){return gt(t,ua)}getSessionToken(t){return this.St(t).get("sessionToken").next(e=>{const n=e==null?void 0:e.value;return n?lt.fromUint8Array(n):lt.EMPTY_BYTE_STRING})}setSessionToken(t,e){return this.St(t).put({name:"sessionToken",value:e.toUint8Array()})}}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ge{constructor(){}Dt(t,e){this.Ct(t,e),e.vt()}Ct(t,e){if("nullValue"in t)this.Ft(e,5);else if("booleanValue"in t)this.Ft(e,10),e.Mt(t.booleanValue?1:0);else if("integerValue"in t)this.Ft(e,15),e.Mt(it(t.integerValue));else if("doubleValue"in t){const n=it(t.doubleValue);isNaN(n)?this.Ft(e,13):(this.Ft(e,15),Ur(n)?e.Mt(0):e.Mt(n))}else if("timestampValue"in t){let n=t.timestampValue;this.Ft(e,20),typeof n=="string"&&(n=ne(n)),e.xt(`${n.seconds||""}`),e.Mt(n.nanos||0)}else if("stringValue"in t)this.Ot(t.stringValue,e),this.Nt(e);else if("bytesValue"in t)this.Ft(e,30),e.Bt(re(t.bytesValue)),this.Nt(e);else if("referenceValue"in t)this.Lt(t.referenceValue,e);else if("geoPointValue"in t){const n=t.geoPointValue;this.Ft(e,45),e.Mt(n.latitude||0),e.Mt(n.longitude||0)}else"mapValue"in t?Vh(t)?this.Ft(e,Number.MAX_SAFE_INTEGER):Ii(t)?this.kt(t.mapValue,e):(this.Kt(t.mapValue,e),this.Nt(e)):"arrayValue"in t?(this.qt(t.arrayValue,e),this.Nt(e)):O(19022,{Ut:t})}Ot(t,e){this.Ft(e,25),this.$t(t,e)}$t(t,e){e.xt(t)}Kt(t,e){const n=t.fields||{};this.Ft(e,55);for(const s of Object.keys(n))this.Ot(s,e),this.Ct(n[s],e)}kt(t,e){var a,u;const n=t.fields||{};this.Ft(e,53);const s=On,i=((u=(a=n[s].arrayValue)==null?void 0:a.values)==null?void 0:u.length)||0;this.Ft(e,15),e.Mt(it(i)),this.Ot(s,e),this.Ct(n[s],e)}qt(t,e){const n=t.values||[];this.Ft(e,50);for(const s of n)this.Ct(s,e)}Lt(t,e){this.Ft(e,37),N.fromName(t).path.forEach(n=>{this.Ft(e,60),this.$t(n,e)})}Ft(t,e){t.Mt(e)}Nt(t){t.Mt(2)}}Ge.Wt=new Ge;/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law | agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES | CONDITIONS OF ANY KIND, either express | implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const mn=255;function g_(r){if(r===0)return 8;let t=0;return r>>4||(t+=4,r<<=4),r>>6||(t+=2,r<<=2),r>>7||(t+=1),t}function Wc(r){const t=64-function(n){let s=0;for(let i=0;i<8;++i){const a=g_(255&n[i]);if(s+=a,a!==8)break}return s}(r);return Math.ceil(t/8)}class p_{constructor(){this.buffer=new Uint8Array(1024),this.position=0}Qt(t){const e=t[Symbol.iterator]();let n=e.next();for(;!n.done;)this.Gt(n.value),n=e.next();this.zt()}jt(t){const e=t[Symbol.iterator]();let n=e.next();for(;!n.done;)this.Ht(n.value),n=e.next();this.Jt()}Zt(t){for(const e of t){const n=e.charCodeAt(0);if(n<128)this.Gt(n);else if(n<2048)this.Gt(960|n>>>6),this.Gt(128|63&n);else if(e<"\uD800"||"\uDBFF"<e)this.Gt(480|n>>>12),this.Gt(128|63&n>>>6),this.Gt(128|63&n);else{const s=e.codePointAt(0);this.Gt(240|s>>>18),this.Gt(128|63&s>>>12),this.Gt(128|63&s>>>6),this.Gt(128|63&s)}}this.zt()}Xt(t){for(const e of t){const n=e.charCodeAt(0);if(n<128)this.Ht(n);else if(n<2048)this.Ht(960|n>>>6),this.Ht(128|63&n);else if(e<"\uD800"||"\uDBFF"<e)this.Ht(480|n>>>12),this.Ht(128|63&n>>>6),this.Ht(128|63&n);else{const s=e.codePointAt(0);this.Ht(240|s>>>18),this.Ht(128|63&s>>>12),this.Ht(128|63&s>>>6),this.Ht(128|63&s)}}this.Jt()}Yt(t){const e=this.en(t),n=Wc(e);this.tn(1+n),this.buffer[this.position++]=255&n;for(let s=e.length-n;s<e.length;++s)this.buffer[this.position++]=255&e[s]}nn(t){const e=this.en(t),n=Wc(e);this.tn(1+n),this.buffer[this.position++]=~(255&n);for(let s=e.length-n;s<e.length;++s)this.buffer[this.position++]=~(255&e[s])}rn(){this.sn(mn),this.sn(255)}_n(){this.an(mn),this.an(255)}reset(){this.position=0}seed(t){this.tn(t.length),this.buffer.set(t,this.position),this.position+=t.length}un(){return this.buffer.slice(0,this.position)}en(t){const e=function(i){const a=new DataView(new ArrayBuffer(8));return a.setFloat64(0,i,!1),new Uint8Array(a.buffer)}(t),n=!!(128&e[0]);e[0]^=n?255:128;for(let s=1;s<e.length;++s)e[s]^=n?255:0;return e}Gt(t){const e=255&t;e===0?(this.sn(0),this.sn(255)):e===mn?(this.sn(mn),this.sn(0)):this.sn(e)}Ht(t){const e=255&t;e===0?(this.an(0),this.an(255)):e===mn?(this.an(mn),this.an(0)):this.an(t)}zt(){this.sn(0),this.sn(1)}Jt(){this.an(0),this.an(1)}sn(t){this.tn(1),this.buffer[this.position++]=t}an(t){this.tn(1),this.buffer[this.position++]=~t}tn(t){const e=t+this.position;if(e<=this.buffer.length)return;let n=2*this.buffer.length;n<e&&(n=e);const s=new Uint8Array(n);s.set(this.buffer),this.buffer=s}}class __{constructor(t){this.cn=t}Bt(t){this.cn.Qt(t)}xt(t){this.cn.Zt(t)}Mt(t){this.cn.Yt(t)}vt(){this.cn.rn()}}class y_{constructor(t){this.cn=t}Bt(t){this.cn.jt(t)}xt(t){this.cn.Xt(t)}Mt(t){this.cn.nn(t)}vt(){this.cn._n()}}class _r{constructor(){this.cn=new p_,this.ascending=new __(this.cn),this.descending=new y_(this.cn)}seed(t){this.cn.seed(t)}ln(t){return t===0?this.ascending:this.descending}un(){return this.cn.un()}reset(){this.cn.reset()}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ke{constructor(t,e,n,s){this.hn=t,this.Pn=e,this.Tn=n,this.In=s}En(){const t=this.In.length,e=t===0||this.In[t-1]===255?t+1:t,n=new Uint8Array(e);return n.set(this.In,0),e!==t?n.set([0],this.In.length):++n[n.length-1],new Ke(this.hn,this.Pn,this.Tn,n)}Rn(t,e,n){return{indexId:this.hn,uid:t,arrayValue:Us(this.Tn),directionalValue:Us(this.In),orderedDocumentKey:Us(e),documentKey:n.path.toArray()}}An(t,e,n){const s=this.Rn(t,e,n);return[s.indexId,s.uid,s.arrayValue,s.directionalValue,s.orderedDocumentKey,s.documentKey]}}function de(r,t){let e=r.hn-t.hn;return e!==0?e:(e=Qc(r.Tn,t.Tn),e!==0?e:(e=Qc(r.In,t.In),e!==0?e:N.comparator(r.Pn,t.Pn)))}function Qc(r,t){for(let e=0;e<r.length&&e<t.length;++e){const n=r[e]-t[e];if(n!==0)return n}return r.length-t.length}function Us(r){return Ul()?function(e){let n="";for(let s=0;s<e.length;s++)n+=String.fromCharCode(e[s]);return n}(r):r}function Jc(r){return typeof r!="string"?r:function(e){const n=new Uint8Array(e.length);for(let s=0;s<e.length;s++)n[s]=e.charCodeAt(s);return n}(r)}class Yc{constructor(t){this.Vn=new tt((e,n)=>ot.comparator(e.field,n.field)),this.collectionId=t.collectionGroup!=null?t.collectionGroup:t.path.lastSegment(),this.dn=t.orderBy,this.mn=[];for(const e of t.filters){const n=e;n.isInequality()?this.Vn=this.Vn.add(n):this.mn.push(n)}}get fn(){return this.Vn.size>1}gn(t){if(L(t.collectionGroup===this.collectionId,49279),this.fn)return!1;const e=Do(t);if(e!==void 0&&!this.pn(e))return!1;const n=qe(t);let s=new Set,i=0,a=0;for(;i<n.length&&this.pn(n[i]);++i)s=s.add(n[i].fieldPath.canonicalString());if(i===n.length)return!0;if(this.Vn.size>0){const u=this.Vn.getIterator().getNext();if(!s.has(u.field.canonicalString())){const l=n[i];if(!this.yn(u,l)||!this.wn(this.dn[a++],l))return!1}++i}for(;i<n.length;++i){const u=n[i];if(a>=this.dn.length||!this.wn(this.dn[a++],u))return!1}return!0}bn(){if(this.fn)return null;let t=new tt(ot.comparator);const e=[];for(const n of this.mn)if(!n.field.isKeyField())if(n.op==="array-contains"||n.op==="array-contains-any")e.push(new xs(n.field,2));else{if(t.has(n.field))continue;t=t.add(n.field),e.push(new xs(n.field,0))}for(const n of this.dn)n.field.isKeyField()||t.has(n.field)||(t=t.add(n.field),e.push(new xs(n.field,n.dir==="asc"?0:1)));return new $s($s.UNKNOWN_ID,this.collectionId,e,Br.empty())}pn(t){for(const e of this.mn)if(this.yn(e,t))return!0;return!1}yn(t,e){if(t===void 0||!t.field.isEqual(e.fieldPath))return!1;const n=t.op==="array-contains"||t.op==="array-contains-any";return e.kind===2===n}wn(t,e){return!!t.field.isEqual(e.fieldPath)&&(e.kind===0&&t.dir==="asc"||e.kind===1&&t.dir==="desc")}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ed(r){var e,n;if(L(r instanceof K||r instanceof Z,20012),r instanceof K){if(r instanceof Lh){const s=((n=(e=r.value.arrayValue)==null?void 0:e.values)==null?void 0:n.map(i=>K.create(r.field,"==",i)))||[];return Z.create(s,"or")}return r}const t=r.filters.map(s=>Ed(s));return Z.create(t,r.op)}function I_(r){if(r.getFilters().length===0)return[];const t=Wo(Ed(r));return L(Td(t),7391),Ko(t)||Ho(t)?[t]:t.getFilters()}function Ko(r){return r instanceof K}function Ho(r){return r instanceof Z&&fa(r)}function Td(r){return Ko(r)||Ho(r)||function(e){if(e instanceof Z&&Lo(e)){for(const n of e.getFilters())if(!Ko(n)&&!Ho(n))return!1;return!0}return!1}(r)}function Wo(r){if(L(r instanceof K||r instanceof Z,34018),r instanceof K)return r;if(r.filters.length===1)return Wo(r.filters[0]);const t=r.filters.map(n=>Wo(n));let e=Z.create(t,r.op);return e=ei(e),Td(e)?e:(L(e instanceof Z,64498),L(Bn(e),40251),L(e.filters.length>1,57927),e.filters.reduce((n,s)=>Ta(n,s)))}function Ta(r,t){let e;return L(r instanceof K||r instanceof Z,38388),L(t instanceof K||t instanceof Z,25473),e=r instanceof K?t instanceof K?function(s,i){return Z.create([s,i],"and")}(r,t):Xc(r,t):t instanceof K?Xc(t,r):function(s,i){if(L(s.filters.length>0&&i.filters.length>0,48005),Bn(s)&&Bn(i))return Mh(s,i.getFilters());const a=Lo(s)?s:i,u=Lo(s)?i:s,l=a.filters.map(d=>Ta(d,u));return Z.create(l,"or")}(r,t),ei(e)}function Xc(r,t){if(Bn(t))return Mh(t,r.getFilters());{const e=t.filters.map(n=>Ta(r,n));return Z.create(e,"or")}}function ei(r){if(L(r instanceof K||r instanceof Z,11850),r instanceof K)return r;const t=r.getFilters();if(t.length===1)return ei(t[0]);if(Nh(r))return r;const e=t.map(s=>ei(s)),n=[];return e.forEach(s=>{s instanceof K?n.push(s):s instanceof Z&&(s.op===r.op?n.push(...s.filters):n.push(s))}),n.length===1?n[0]:Z.create(n,r.op)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class E_{constructor(){this.Sn=new wa}addToCollectionParentIndex(t,e){return this.Sn.add(e),v.resolve()}getCollectionParents(t,e){return v.resolve(this.Sn.getEntries(e))}addFieldIndex(t,e){return v.resolve()}deleteFieldIndex(t,e){return v.resolve()}deleteAllFieldIndexes(t){return v.resolve()}createTargetIndexes(t,e){return v.resolve()}getDocumentsMatchingTarget(t,e){return v.resolve(null)}getIndexType(t,e){return v.resolve(0)}getFieldIndexes(t,e){return v.resolve([])}getNextCollectionGroupToUpdate(t){return v.resolve(null)}getMinOffset(t,e){return v.resolve(Lt.min())}getMinOffsetFromCollectionGroup(t,e){return v.resolve(Lt.min())}updateCollectionGroup(t,e,n){return v.resolve()}updateIndexEntries(t,e){return v.resolve()}}class wa{constructor(){this.index={}}add(t){const e=t.lastSegment(),n=t.popLast(),s=this.index[e]||new tt(J.comparator),i=!s.has(n);return this.index[e]=s.add(n),i}has(t){const e=t.lastSegment(),n=t.popLast(),s=this.index[e];return s&&s.has(n)}getEntries(t){return(this.index[t]||new tt(J.comparator)).toArray()}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Zc="IndexedDbIndexManager",Ss=new Uint8Array(0);class T_{constructor(t,e){this.databaseId=e,this.Dn=new wa,this.Cn=new se(n=>Xe(n),(n,s)=>Zr(n,s)),this.uid=t.uid||""}addToCollectionParentIndex(t,e){if(!this.Dn.has(e)){const n=e.lastSegment(),s=e.popLast();t.addOnCommittedListener(()=>{this.Dn.add(e)});const i={collectionId:n,parent:bt(s)};return tl(t).put(i)}return v.resolve()}getCollectionParents(t,e){const n=[],s=IDBKeyRange.bound([e,""],[nh(e),""],!1,!0);return tl(t).H(s).next(i=>{for(const a of i){if(a.collectionId!==e)break;n.push(Kt(a.parent))}return n})}addFieldIndex(t,e){const n=yr(t),s=function(u){return{indexId:u.indexId,collectionGroup:u.collectionGroup,fields:u.fields.map(l=>[l.fieldPath.canonicalString(),l.kind])}}(e);delete s.indexId;const i=n.add(s);if(e.indexState){const a=pn(t);return i.next(u=>{a.put(Gc(u,this.uid,e.indexState.sequenceNumber,e.indexState.offset))})}return i.next()}deleteFieldIndex(t,e){const n=yr(t),s=pn(t),i=gn(t);return n.delete(e.indexId).next(()=>s.delete(IDBKeyRange.bound([e.indexId],[e.indexId+1],!1,!0))).next(()=>i.delete(IDBKeyRange.bound([e.indexId],[e.indexId+1],!1,!0)))}deleteAllFieldIndexes(t){const e=yr(t),n=gn(t),s=pn(t);return e.X().next(()=>n.X()).next(()=>s.X())}createTargetIndexes(t,e){return v.forEach(this.vn(e),n=>this.getIndexType(t,n).next(s=>{if(s===0||s===1){const i=new Yc(n).bn();if(i!=null)return this.addFieldIndex(t,i)}}))}getDocumentsMatchingTarget(t,e){const n=gn(t);let s=!0;const i=new Map;return v.forEach(this.vn(e),a=>this.Fn(t,a).next(u=>{s&&(s=!!u),i.set(a,u)})).next(()=>{if(s){let a=$();const u=[];return v.forEach(i,(l,d)=>{V(Zc,`Using index ${function(U){return`id=${U.indexId}|cg=${U.collectionGroup}|f=${U.fields.map(et=>`${et.fieldPath}:${et.kind}`).join(",")}`}(l)} to execute ${Xe(e)}`);const f=function(U,et){const Y=Do(et);if(Y===void 0)return null;for(const Q of Js(U,Y.fieldPath))switch(Q.op){case"array-contains-any":return Q.value.arrayValue.values||[];case"array-contains":return[Q.value]}return null}(d,l),g=function(U,et){const Y=new Map;for(const Q of qe(et))for(const E of Js(U,Q.fieldPath))switch(E.op){case"==":case"in":Y.set(Q.fieldPath.canonicalString(),E.value);break;case"not-in":case"!=":return Y.set(Q.fieldPath.canonicalString(),E.value),Array.from(Y.values())}return null}(d,l),_=function(U,et){const Y=[];let Q=!0;for(const E of qe(et)){const p=E.kind===0?Dc(U,E.fieldPath,U.startAt):xc(U,E.fieldPath,U.startAt);Y.push(p.value),Q&&(Q=p.inclusive)}return new Ln(Y,Q)}(d,l),S=function(U,et){const Y=[];let Q=!0;for(const E of qe(et)){const p=E.kind===0?xc(U,E.fieldPath,U.endAt):Dc(U,E.fieldPath,U.endAt);Y.push(p.value),Q&&(Q=p.inclusive)}return new Ln(Y,Q)}(d,l),D=this.Mn(l,d,_),k=this.Mn(l,d,S),M=this.xn(l,d,g),G=this.On(l.indexId,f,D,_.inclusive,k,S.inclusive,M);return v.forEach(G,q=>n.Z(q,e.limit).next(U=>{U.forEach(et=>{const Y=N.fromSegments(et.documentKey);a.has(Y)||(a=a.add(Y),u.push(Y))})}))}).next(()=>u)}return v.resolve(null)})}vn(t){let e=this.Cn.get(t);return e||(t.filters.length===0?e=[t]:e=I_(Z.create(t.filters,"and")).map(n=>Uo(t.path,t.collectionGroup,t.orderBy,n.getFilters(),t.limit,t.startAt,t.endAt)),this.Cn.set(t,e),e)}On(t,e,n,s,i,a,u){const l=(e!=null?e.length:1)*Math.max(n.length,i.length),d=l/(e!=null?e.length:1),f=[];for(let g=0;g<l;++g){const _=e?this.Nn(e[g/d]):Ss,S=this.Bn(t,_,n[g%d],s),D=this.Ln(t,_,i[g%d],a),k=u.map(M=>this.Bn(t,_,M,!0));f.push(...this.createRange(S,D,k))}return f}Bn(t,e,n,s){const i=new Ke(t,N.empty(),e,n);return s?i:i.En()}Ln(t,e,n,s){const i=new Ke(t,N.empty(),e,n);return s?i.En():i}Fn(t,e){const n=new Yc(e),s=e.collectionGroup!=null?e.collectionGroup:e.path.lastSegment();return this.getFieldIndexes(t,s).next(i=>{let a=null;for(const u of i)n.gn(u)&&(!a||u.fields.length>a.fields.length)&&(a=u);return a})}getIndexType(t,e){let n=2;const s=this.vn(e);return v.forEach(s,i=>this.Fn(t,i).next(a=>{a?n!==0&&a.fields.length<function(l){let d=new tt(ot.comparator),f=!1;for(const g of l.filters)for(const _ of g.getFlattenedFilters())_.field.isKeyField()||(_.op==="array-contains"||_.op==="array-contains-any"?f=!0:d=d.add(_.field));for(const g of l.orderBy)g.field.isKeyField()||(d=d.add(g.field));return d.size+(f?1:0)}(i)&&(n=1):n=0})).next(()=>function(a){return a.limit!==null}(e)&&s.length>1&&n===2?1:n)}kn(t,e){const n=new _r;for(const s of qe(t)){const i=e.data.field(s.fieldPath);if(i==null)return null;const a=n.ln(s.kind);Ge.Wt.Dt(i,a)}return n.un()}Nn(t){const e=new _r;return Ge.Wt.Dt(t,e.ln(0)),e.un()}Kn(t,e){const n=new _r;return Ge.Wt.Dt(Kr(this.databaseId,e),n.ln(function(i){const a=qe(i);return a.length===0?0:a[a.length-1].kind}(t))),n.un()}xn(t,e,n){if(n===null)return[];let s=[];s.push(new _r);let i=0;for(const a of qe(t)){const u=n[i++];for(const l of s)if(this.qn(e,a.fieldPath)&&Hr(u))s=this.Un(s,a,u);else{const d=l.ln(a.kind);Ge.Wt.Dt(u,d)}}return this.$n(s)}Mn(t,e,n){return this.xn(t,e,n.position)}$n(t){const e=[];for(let n=0;n<t.length;++n)e[n]=t[n].un();return e}Un(t,e,n){const s=[...t],i=[];for(const a of n.arrayValue.values||[])for(const u of s){const l=new _r;l.seed(u.un()),Ge.Wt.Dt(a,l.ln(e.kind)),i.push(l)}return i}qn(t,e){return!!t.filters.find(n=>n instanceof K&&n.field.isEqual(e)&&(n.op==="in"||n.op==="not-in"))}getFieldIndexes(t,e){const n=yr(t),s=pn(t);return(e?n.H(No,IDBKeyRange.bound(e,e)):n.H()).next(i=>{const a=[];return v.forEach(i,u=>s.get([u.indexId,this.uid]).next(l=>{a.push(function(f,g){const _=g?new Br(g.sequenceNumber,new Lt(nn(g.readTime),new N(Kt(g.documentKey)),g.largestBatchId)):Br.empty(),S=f.fields.map(([D,k])=>new xs(ot.fromServerFormat(D),k));return new $s(f.indexId,f.collectionGroup,S,_)}(u,l))})).next(()=>a)})}getNextCollectionGroupToUpdate(t){return this.getFieldIndexes(t).next(e=>e.length===0?null:(e.sort((n,s)=>{const i=n.indexState.sequenceNumber-s.indexState.sequenceNumber;return i!==0?i:j(n.collectionGroup,s.collectionGroup)}),e[0].collectionGroup))}updateCollectionGroup(t,e,n){const s=yr(t),i=pn(t);return this.Wn(t).next(a=>s.H(No,IDBKeyRange.bound(e,e)).next(u=>v.forEach(u,l=>i.put(Gc(l.indexId,this.uid,a,n)))))}updateIndexEntries(t,e){const n=new Map;return v.forEach(e,(s,i)=>{const a=n.get(s.collectionGroup);return(a?v.resolve(a):this.getFieldIndexes(t,s.collectionGroup)).next(u=>(n.set(s.collectionGroup,u),v.forEach(u,l=>this.Qn(t,s,l).next(d=>{const f=this.Gn(i,l);return d.isEqual(f)?v.resolve():this.zn(t,i,l,d,f)}))))})}jn(t,e,n,s){return gn(t).put(s.Rn(this.uid,this.Kn(n,e.key),e.key))}Hn(t,e,n,s){return gn(t).delete(s.An(this.uid,this.Kn(n,e.key),e.key))}Qn(t,e,n){const s=gn(t);let i=new tt(de);return s.ee({index:ph,range:IDBKeyRange.only([n.indexId,this.uid,Us(this.Kn(n,e))])},(a,u)=>{i=i.add(new Ke(n.indexId,e,Jc(u.arrayValue),Jc(u.directionalValue)))}).next(()=>i)}Gn(t,e){let n=new tt(de);const s=this.kn(e,t);if(s==null)return n;const i=Do(e);if(i!=null){const a=t.data.field(i.fieldPath);if(Hr(a))for(const u of a.arrayValue.values||[])n=n.add(new Ke(e.indexId,t.key,this.Nn(u),s))}else n=n.add(new Ke(e.indexId,t.key,Ss,s));return n}zn(t,e,n,s,i){V(Zc,"Updating index entries for document '%s'",e.key);const a=[];return function(l,d,f,g,_){const S=l.getIterator(),D=d.getIterator();let k=fn(S),M=fn(D);for(;k||M;){let G=!1,q=!1;if(k&&M){const U=f(k,M);U<0?q=!0:U>0&&(G=!0)}else k!=null?q=!0:G=!0;G?(g(M),M=fn(D)):q?(_(k),k=fn(S)):(k=fn(S),M=fn(D))}}(s,i,de,u=>{a.push(this.jn(t,e,n,u))},u=>{a.push(this.Hn(t,e,n,u))}),v.waitFor(a)}Wn(t){let e=1;return pn(t).ee({index:gh,reverse:!0,range:IDBKeyRange.upperBound([this.uid,Number.MAX_SAFE_INTEGER])},(n,s,i)=>{i.done(),e=s.sequenceNumber+1}).next(()=>e)}createRange(t,e,n){n=n.sort((a,u)=>de(a,u)).filter((a,u,l)=>!u||de(a,l[u-1])!==0);const s=[];s.push(t);for(const a of n){const u=de(a,t),l=de(a,e);if(u===0)s[0]=t.En();else if(u>0&&l<0)s.push(a),s.push(a.En());else if(l>0)break}s.push(e);const i=[];for(let a=0;a<s.length;a+=2){if(this.Jn(s[a],s[a+1]))return[];const u=s[a].An(this.uid,Ss,N.empty()),l=s[a+1].An(this.uid,Ss,N.empty());i.push(IDBKeyRange.bound(u,l))}return i}Jn(t,e){return de(t,e)>0}getMinOffsetFromCollectionGroup(t,e){return this.getFieldIndexes(t,e).next(el)}getMinOffset(t,e){return v.mapArray(this.vn(e),n=>this.Fn(t,n).next(s=>s||O(44426))).next(el)}}function tl(r){return gt(r,zr)}function gn(r){return gt(r,Cr)}function yr(r){return gt(r,aa)}function pn(r){return gt(r,Vr)}function el(r){L(r.length!==0,28825);let t=r[0].indexState.offset,e=t.largestBatchId;for(let n=1;n<r.length;n++){const s=r[n].indexState.offset;sa(s,t)<0&&(t=s),e<s.largestBatchId&&(e=s.largestBatchId)}return new Lt(t.readTime,t.documentKey,e)}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const nl={didRun:!1,sequenceNumbersCollected:0,targetsRemoved:0,documentsRemoved:0},wd=41943040;class wt{static withCacheSize(t){return new wt(t,wt.DEFAULT_COLLECTION_PERCENTILE,wt.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT)}constructor(t,e,n){this.cacheSizeCollectionThreshold=t,this.percentileToCollect=e,this.maximumSequenceNumbersToCollect=n}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function vd(r,t,e){const n=r.store(Ut),s=r.store(xn),i=[],a=IDBKeyRange.only(e.batchId);let u=0;const l=n.ee({range:a},(f,g,_)=>(u++,_.delete()));i.push(l.next(()=>{L(u===1,47070,{batchId:e.batchId})}));const d=[];for(const f of e.mutations){const g=dh(t,f.key.path,e.batchId);i.push(s.delete(g)),d.push(f.key)}return v.waitFor(i).next(()=>d)}function ni(r){if(!r)return 0;let t;if(r.document)t=r.document;else if(r.unknownDocument)t=r.unknownDocument;else{if(!r.noDocument)throw O(14731);t=r.noDocument}return JSON.stringify(t).length}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */wt.DEFAULT_COLLECTION_PERCENTILE=10,wt.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT=1e3,wt.DEFAULT=new wt(wd,wt.DEFAULT_COLLECTION_PERCENTILE,wt.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT),wt.DISABLED=new wt(-1,0,0);class bi{constructor(t,e,n,s){this.userId=t,this.serializer=e,this.indexManager=n,this.referenceDelegate=s,this.Zn={}}static wt(t,e,n,s){L(t.uid!=="",64387);const i=t.isAuthenticated()?t.uid:"";return new bi(i,e,n,s)}checkEmpty(t){let e=!0;const n=IDBKeyRange.bound([this.userId,Number.NEGATIVE_INFINITY],[this.userId,Number.POSITIVE_INFINITY]);return fe(t).ee({index:He,range:n},(s,i,a)=>{e=!1,a.done()}).next(()=>e)}addMutationBatch(t,e,n,s){const i=wn(t),a=fe(t);return a.add({}).next(u=>{L(typeof u=="number",49019);const l=new pa(u,e,n,s),d=function(S,D,k){const M=k.baseMutations.map(q=>Zs(S.yt,q)),G=k.mutations.map(q=>Zs(S.yt,q));return{userId:D,batchId:k.batchId,localWriteTimeMs:k.localWriteTime.toMillis(),baseMutations:M,mutations:G}}(this.serializer,this.userId,l),f=[];let g=new tt((_,S)=>j(_.canonicalString(),S.canonicalString()));for(const _ of s){const S=dh(this.userId,_.key.path,u);g=g.add(_.key.path.popLast()),f.push(a.put(d)),f.push(i.put(S,Yg))}return g.forEach(_=>{f.push(this.indexManager.addToCollectionParentIndex(t,_))}),t.addOnCommittedListener(()=>{this.Zn[u]=l.keys()}),v.waitFor(f).next(()=>l)})}lookupMutationBatch(t,e){return fe(t).get(e).next(n=>n?(L(n.userId===this.userId,48,"Unexpected user for mutation batch",{userId:n.userId,batchId:e}),$e(this.serializer,n)):null)}Xn(t,e){return this.Zn[e]?v.resolve(this.Zn[e]):this.lookupMutationBatch(t,e).next(n=>{if(n){const s=n.keys();return this.Zn[e]=s,s}return null})}getNextMutationBatchAfterBatchId(t,e){const n=e+1,s=IDBKeyRange.lowerBound([this.userId,n]);let i=null;return fe(t).ee({index:He,range:s},(a,u,l)=>{u.userId===this.userId&&(L(u.batchId>=n,47524,{Yn:n}),i=$e(this.serializer,u)),l.done()}).next(()=>i)}getHighestUnacknowledgedBatchId(t){const e=IDBKeyRange.upperBound([this.userId,Number.POSITIVE_INFINITY]);let n=We;return fe(t).ee({index:He,range:e,reverse:!0},(s,i,a)=>{n=i.batchId,a.done()}).next(()=>n)}getAllMutationBatches(t){const e=IDBKeyRange.bound([this.userId,We],[this.userId,Number.POSITIVE_INFINITY]);return fe(t).H(He,e).next(n=>n.map(s=>$e(this.serializer,s)))}getAllMutationBatchesAffectingDocumentKey(t,e){const n=Ns(this.userId,e.path),s=IDBKeyRange.lowerBound(n),i=[];return wn(t).ee({range:s},(a,u,l)=>{const[d,f,g]=a,_=Kt(f);if(d===this.userId&&e.path.isEqual(_))return fe(t).get(g).next(S=>{if(!S)throw O(61480,{er:a,batchId:g});L(S.userId===this.userId,10503,"Unexpected user for mutation batch",{userId:S.userId,batchId:g}),i.push($e(this.serializer,S))});l.done()}).next(()=>i)}getAllMutationBatchesAffectingDocumentKeys(t,e){let n=new tt(j);const s=[];return e.forEach(i=>{const a=Ns(this.userId,i.path),u=IDBKeyRange.lowerBound(a),l=wn(t).ee({range:u},(d,f,g)=>{const[_,S,D]=d,k=Kt(S);_===this.userId&&i.path.isEqual(k)?n=n.add(D):g.done()});s.push(l)}),v.waitFor(s).next(()=>this.tr(t,n))}getAllMutationBatchesAffectingQuery(t,e){const n=e.path,s=n.length+1,i=Ns(this.userId,n),a=IDBKeyRange.lowerBound(i);let u=new tt(j);return wn(t).ee({range:a},(l,d,f)=>{const[g,_,S]=l,D=Kt(_);g===this.userId&&n.isPrefixOf(D)?D.length===s&&(u=u.add(S)):f.done()}).next(()=>this.tr(t,u))}tr(t,e){const n=[],s=[];return e.forEach(i=>{s.push(fe(t).get(i).next(a=>{if(a===null)throw O(35274,{batchId:i});L(a.userId===this.userId,9748,"Unexpected user for mutation batch",{userId:a.userId,batchId:i}),n.push($e(this.serializer,a))}))}),v.waitFor(s).next(()=>n)}removeMutationBatch(t,e){return vd(t.le,this.userId,e).next(n=>(t.addOnCommittedListener(()=>{this.nr(e.batchId)}),v.forEach(n,s=>this.referenceDelegate.markPotentiallyOrphaned(t,s))))}nr(t){delete this.Zn[t]}performConsistencyCheck(t){return this.checkEmpty(t).next(e=>{if(!e)return v.resolve();const n=IDBKeyRange.lowerBound(function(a){return[a]}(this.userId)),s=[];return wn(t).ee({range:n},(i,a,u)=>{if(i[0]===this.userId){const l=Kt(i[1]);s.push(l)}else u.done()}).next(()=>{L(s.length===0,56720,{rr:s.map(i=>i.canonicalString())})})})}containsKey(t,e){return Ad(t,this.userId,e)}ir(t){return bd(t).get(this.userId).next(e=>e||{userId:this.userId,lastAcknowledgedBatchId:We,lastStreamToken:""})}}function Ad(r,t,e){const n=Ns(t,e.path),s=n[1],i=IDBKeyRange.lowerBound(n);let a=!1;return wn(r).ee({range:i,Y:!0},(u,l,d)=>{const[f,g,_]=u;f===t&&g===s&&(a=!0),d.done()}).next(()=>a)}function fe(r){return gt(r,Ut)}function wn(r){return gt(r,xn)}function bd(r){return gt(r,qr)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rn{constructor(t){this.sr=t}next(){return this.sr+=2,this.sr}static _r(){return new rn(0)}static ar(){return new rn(-1)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class w_{constructor(t,e){this.referenceDelegate=t,this.serializer=e}allocateTargetId(t){return this.ur(t).next(e=>{const n=new rn(e.highestTargetId);return e.highestTargetId=n.next(),this.cr(t,e).next(()=>e.highestTargetId)})}getLastRemoteSnapshotVersion(t){return this.ur(t).next(e=>B.fromTimestamp(new X(e.lastRemoteSnapshotVersion.seconds,e.lastRemoteSnapshotVersion.nanoseconds)))}getHighestSequenceNumber(t){return this.ur(t).next(e=>e.highestListenSequenceNumber)}setTargetsMetadata(t,e,n){return this.ur(t).next(s=>(s.highestListenSequenceNumber=e,n&&(s.lastRemoteSnapshotVersion=n.toTimestamp()),e>s.highestListenSequenceNumber&&(s.highestListenSequenceNumber=e),this.cr(t,s)))}addTargetData(t,e){return this.lr(t,e).next(()=>this.ur(t).next(n=>(n.targetCount+=1,this.hr(e,n),this.cr(t,n))))}updateTargetData(t,e){return this.lr(t,e)}removeTargetData(t,e){return this.removeMatchingKeysForTargetId(t,e.targetId).next(()=>_n(t).delete(e.targetId)).next(()=>this.ur(t)).next(n=>(L(n.targetCount>0,8065),n.targetCount-=1,this.cr(t,n)))}removeTargets(t,e,n){let s=0;const i=[];return _n(t).ee((a,u)=>{const l=br(u);l.sequenceNumber<=e&&n.get(l.targetId)===null&&(s++,i.push(this.removeTargetData(t,l)))}).next(()=>v.waitFor(i)).next(()=>s)}forEachTarget(t,e){return _n(t).ee((n,s)=>{const i=br(s);e(i)})}ur(t){return rl(t).get(Hs).next(e=>(L(e!==null,2888),e))}cr(t,e){return rl(t).put(Hs,e)}lr(t,e){return _n(t).put(yd(this.serializer,e))}hr(t,e){let n=!1;return t.targetId>e.highestTargetId&&(e.highestTargetId=t.targetId,n=!0),t.sequenceNumber>e.highestListenSequenceNumber&&(e.highestListenSequenceNumber=t.sequenceNumber,n=!0),n}getTargetCount(t){return this.ur(t).next(e=>e.targetCount)}getTargetData(t,e){const n=Xe(e),s=IDBKeyRange.bound([n,Number.NEGATIVE_INFINITY],[n,Number.POSITIVE_INFINITY]);let i=null;return _n(t).ee({range:s,index:mh},(a,u,l)=>{const d=br(u);Zr(e,d.target)&&(i=d,l.done())}).next(()=>i)}addMatchingKeys(t,e,n){const s=[],i=ge(t);return e.forEach(a=>{const u=bt(a.path);s.push(i.put({targetId:n,path:u})),s.push(this.referenceDelegate.addReference(t,n,a))}),v.waitFor(s)}removeMatchingKeys(t,e,n){const s=ge(t);return v.forEach(e,i=>{const a=bt(i.path);return v.waitFor([s.delete([n,a]),this.referenceDelegate.removeReference(t,n,i)])})}removeMatchingKeysForTargetId(t,e){const n=ge(t),s=IDBKeyRange.bound([e],[e+1],!1,!0);return n.delete(s)}getMatchingKeysForTargetId(t,e){const n=IDBKeyRange.bound([e],[e+1],!1,!0),s=ge(t);let i=$();return s.ee({range:n,Y:!0},(a,u,l)=>{const d=Kt(a[1]),f=new N(d);i=i.add(f)}).next(()=>i)}containsKey(t,e){const n=bt(e.path),s=IDBKeyRange.bound([n],[nh(n)],!1,!0);let i=0;return ge(t).ee({index:oa,Y:!0,range:s},([a,u],l,d)=>{a!==0&&(i++,d.done())}).next(()=>i>0)}At(t,e){return _n(t).get(e).next(n=>n?br(n):null)}}function _n(r){return gt(r,Nn)}function rl(r){return gt(r,Qe)}function ge(r){return gt(r,kn)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const sl="LruGarbageCollector",Rd=1048576;function il([r,t],[e,n]){const s=j(r,e);return s===0?j(t,n):s}class v_{constructor(t){this.Pr=t,this.buffer=new tt(il),this.Tr=0}Ir(){return++this.Tr}Er(t){const e=[t,this.Ir()];if(this.buffer.size<this.Pr)this.buffer=this.buffer.add(e);else{const n=this.buffer.last();il(e,n)<0&&(this.buffer=this.buffer.delete(n).add(e))}}get maxValue(){return this.buffer.last()[0]}}class Sd{constructor(t,e,n){this.garbageCollector=t,this.asyncQueue=e,this.localStore=n,this.Rr=null}start(){this.garbageCollector.params.cacheSizeCollectionThreshold!==-1&&this.Ar(6e4)}stop(){this.Rr&&(this.Rr.cancel(),this.Rr=null)}get started(){return this.Rr!==null}Ar(t){V(sl,`Garbage collection scheduled in ${t}ms`),this.Rr=this.asyncQueue.enqueueAfterDelay("lru_garbage_collection",t,async()=>{this.Rr=null;try{await this.localStore.collectGarbage(this.garbageCollector)}catch(e){Ve(e)?V(sl,"Ignoring IndexedDB error during garbage collection: ",e):await Pe(e)}await this.Ar(3e5)})}}class A_{constructor(t,e){this.Vr=t,this.params=e}calculateTargetCount(t,e){return this.Vr.dr(t).next(n=>Math.floor(e/100*n))}nthSequenceNumber(t,e){if(e===0)return v.resolve(Ct.ce);const n=new v_(e);return this.Vr.forEachTarget(t,s=>n.Er(s.sequenceNumber)).next(()=>this.Vr.mr(t,s=>n.Er(s))).next(()=>n.maxValue)}removeTargets(t,e,n){return this.Vr.removeTargets(t,e,n)}removeOrphanedDocuments(t,e){return this.Vr.removeOrphanedDocuments(t,e)}collect(t,e){return this.params.cacheSizeCollectionThreshold===-1?(V("LruGarbageCollector","Garbage collection skipped; disabled"),v.resolve(nl)):this.getCacheSize(t).next(n=>n<this.params.cacheSizeCollectionThreshold?(V("LruGarbageCollector",`Garbage collection skipped; Cache size ${n} is lower than threshold ${this.params.cacheSizeCollectionThreshold}`),nl):this.gr(t,e))}getCacheSize(t){return this.Vr.getCacheSize(t)}gr(t,e){let n,s,i,a,u,l,d;const f=Date.now();return this.calculateTargetCount(t,this.params.percentileToCollect).next(g=>(g>this.params.maximumSequenceNumbersToCollect?(V("LruGarbageCollector",`Capping sequence numbers to collect down to the maximum of ${this.params.maximumSequenceNumbersToCollect} from ${g}`),s=this.params.maximumSequenceNumbersToCollect):s=g,a=Date.now(),this.nthSequenceNumber(t,s))).next(g=>(n=g,u=Date.now(),this.removeTargets(t,n,e))).next(g=>(i=g,l=Date.now(),this.removeOrphanedDocuments(t,n))).next(g=>(d=Date.now(),yn()<=W.DEBUG&&V("LruGarbageCollector",`LRU Garbage Collection
	Counted targets in ${a-f}ms
	Determined least recently used ${s} in `+(u-a)+`ms
	Removed ${i} targets in `+(l-u)+`ms
	Removed ${g} documents in `+(d-l)+`ms
Total Duration: ${d-f}ms`),v.resolve({didRun:!0,sequenceNumbersCollected:s,targetsRemoved:i,documentsRemoved:g})))}}function Pd(r,t){return new A_(r,t)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class b_{constructor(t,e){this.db=t,this.garbageCollector=Pd(this,e)}dr(t){const e=this.pr(t);return this.db.getTargetCache().getTargetCount(t).next(n=>e.next(s=>n+s))}pr(t){let e=0;return this.mr(t,n=>{e++}).next(()=>e)}forEachTarget(t,e){return this.db.getTargetCache().forEachTarget(t,e)}mr(t,e){return this.yr(t,(n,s)=>e(s))}addReference(t,e,n){return Ps(t,n)}removeReference(t,e,n){return Ps(t,n)}removeTargets(t,e,n){return this.db.getTargetCache().removeTargets(t,e,n)}markPotentiallyOrphaned(t,e){return Ps(t,e)}wr(t,e){return function(s,i){let a=!1;return bd(s).te(u=>Ad(s,u,i).next(l=>(l&&(a=!0),v.resolve(!l)))).next(()=>a)}(t,e)}removeOrphanedDocuments(t,e){const n=this.db.getRemoteDocumentCache().newChangeBuffer(),s=[];let i=0;return this.yr(t,(a,u)=>{if(u<=e){const l=this.wr(t,a).next(d=>{if(!d)return i++,n.getEntry(t,a).next(()=>(n.removeEntry(a,B.min()),ge(t).delete(function(g){return[0,bt(g.path)]}(a))))});s.push(l)}}).next(()=>v.waitFor(s)).next(()=>n.apply(t)).next(()=>i)}removeTarget(t,e){const n=e.withSequenceNumber(t.currentSequenceNumber);return this.db.getTargetCache().updateTargetData(t,n)}updateLimboDocument(t,e){return Ps(t,e)}yr(t,e){const n=ge(t);let s,i=Ct.ce;return n.ee({index:oa},([a,u],{path:l,sequenceNumber:d})=>{a===0?(i!==Ct.ce&&e(new N(Kt(s)),i),i=d,s=l):i=Ct.ce}).next(()=>{i!==Ct.ce&&e(new N(Kt(s)),i)})}getCacheSize(t){return this.db.getRemoteDocumentCache().getSize(t)}}function Ps(r,t){return ge(r).put(function(n,s){return{targetId:0,path:bt(n.path),sequenceNumber:s}}(t,r.currentSequenceNumber))}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Vd{constructor(){this.changes=new se(t=>t.toString(),(t,e)=>t.isEqual(e)),this.changesApplied=!1}addEntry(t){this.assertNotApplied(),this.changes.set(t.key,t)}removeEntry(t,e){this.assertNotApplied(),this.changes.set(t,ct.newInvalidDocument(t).setReadTime(e))}getEntry(t,e){this.assertNotApplied();const n=this.changes.get(e);return n!==void 0?v.resolve(n):this.getFromCache(t,e)}getEntries(t,e){return this.getAllFromCache(t,e)}apply(t){return this.assertNotApplied(),this.changesApplied=!0,this.applyChanges(t)}assertNotApplied(){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class R_{constructor(t){this.serializer=t}setIndexManager(t){this.indexManager=t}addEntry(t,e,n){return Be(t).put(n)}removeEntry(t,e,n){return Be(t).delete(function(i,a){const u=i.path.toArray();return[u.slice(0,u.length-2),u[u.length-2],ti(a),u[u.length-1]]}(e,n))}updateMetadata(t,e){return this.getMetadata(t).next(n=>(n.byteSize+=e,this.br(t,n)))}getEntry(t,e){let n=ct.newInvalidDocument(e);return Be(t).ee({index:ks,range:IDBKeyRange.only(Ir(e))},(s,i)=>{n=this.Sr(e,i)}).next(()=>n)}Dr(t,e){let n={size:0,document:ct.newInvalidDocument(e)};return Be(t).ee({index:ks,range:IDBKeyRange.only(Ir(e))},(s,i)=>{n={document:this.Sr(e,i),size:ni(i)}}).next(()=>n)}getEntries(t,e){let n=Ot();return this.Cr(t,e,(s,i)=>{const a=this.Sr(s,i);n=n.insert(s,a)}).next(()=>n)}vr(t,e){let n=Ot(),s=new rt(N.comparator);return this.Cr(t,e,(i,a)=>{const u=this.Sr(i,a);n=n.insert(i,u),s=s.insert(i,ni(a))}).next(()=>({documents:n,Fr:s}))}Cr(t,e,n){if(e.isEmpty())return v.resolve();let s=new tt(ul);e.forEach(l=>s=s.add(l));const i=IDBKeyRange.bound(Ir(s.first()),Ir(s.last())),a=s.getIterator();let u=a.getNext();return Be(t).ee({index:ks,range:i},(l,d,f)=>{const g=N.fromSegments([...d.prefixPath,d.collectionGroup,d.documentId]);for(;u&&ul(u,g)<0;)n(u,null),u=a.getNext();u&&u.isEqual(g)&&(n(u,d),u=a.hasNext()?a.getNext():null),u?f.j(Ir(u)):f.done()}).next(()=>{for(;u;)n(u,null),u=a.hasNext()?a.getNext():null})}getDocumentsMatchingQuery(t,e,n,s,i){const a=e.path,u=[a.popLast().toArray(),a.lastSegment(),ti(n.readTime),n.documentKey.path.isEmpty()?"":n.documentKey.path.lastSegment()],l=[a.popLast().toArray(),a.lastSegment(),[Number.MAX_SAFE_INTEGER,Number.MAX_SAFE_INTEGER],""];return Be(t).H(IDBKeyRange.bound(u,l,!0)).next(d=>{i==null||i.incrementDocumentReadCount(d.length);let f=Ot();for(const g of d){const _=this.Sr(N.fromSegments(g.prefixPath.concat(g.collectionGroup,g.documentId)),g);_.isFoundDocument()&&(es(e,_)||s.has(_.key))&&(f=f.insert(_.key,_))}return f})}getAllFromCollectionGroup(t,e,n,s){let i=Ot();const a=al(e,n),u=al(e,Lt.max());return Be(t).ee({index:fh,range:IDBKeyRange.bound(a,u,!0)},(l,d,f)=>{const g=this.Sr(N.fromSegments(d.prefixPath.concat(d.collectionGroup,d.documentId)),d);i=i.insert(g.key,g),i.size===s&&f.done()}).next(()=>i)}newChangeBuffer(t){return new S_(this,!!t&&t.trackRemovals)}getSize(t){return this.getMetadata(t).next(e=>e.byteSize)}getMetadata(t){return ol(t).get(xo).next(e=>(L(!!e,20021),e))}br(t,e){return ol(t).put(xo,e)}Sr(t,e){if(e){const n=d_(this.serializer,e);if(!(n.isNoDocument()&&n.version.isEqual(B.min())))return n}return ct.newInvalidDocument(t)}}function Cd(r){return new R_(r)}class S_ extends Vd{constructor(t,e){super(),this.Mr=t,this.trackRemovals=e,this.Or=new se(n=>n.toString(),(n,s)=>n.isEqual(s))}applyChanges(t){const e=[];let n=0,s=new tt((i,a)=>j(i.canonicalString(),a.canonicalString()));return this.changes.forEach((i,a)=>{const u=this.Or.get(i);if(e.push(this.Mr.removeEntry(t,i,u.readTime)),a.isValidDocument()){const l=zc(this.Mr.serializer,a);s=s.add(i.path.popLast());const d=ni(l);n+=d-u.size,e.push(this.Mr.addEntry(t,i,l))}else if(n-=u.size,this.trackRemovals){const l=zc(this.Mr.serializer,a.convertToNoDocument(B.min()));e.push(this.Mr.addEntry(t,i,l))}}),s.forEach(i=>{e.push(this.Mr.indexManager.addToCollectionParentIndex(t,i))}),e.push(this.Mr.updateMetadata(t,n)),v.waitFor(e)}getFromCache(t,e){return this.Mr.Dr(t,e).next(n=>(this.Or.set(e,{size:n.size,readTime:n.document.readTime}),n.document))}getAllFromCache(t,e){return this.Mr.vr(t,e).next(({documents:n,Fr:s})=>(s.forEach((i,a)=>{this.Or.set(i,{size:a,readTime:n.get(i).readTime})}),n))}}function ol(r){return gt(r,jr)}function Be(r){return gt(r,Ks)}function Ir(r){const t=r.path.toArray();return[t.slice(0,t.length-2),t[t.length-2],t[t.length-1]]}function al(r,t){const e=t.documentKey.path.toArray();return[r,ti(t.readTime),e.slice(0,e.length-2),e.length>0?e[e.length-1]:""]}function ul(r,t){const e=r.path.toArray(),n=t.path.toArray();let s=0;for(let i=0;i<e.length-2&&i<n.length-2;++i)if(s=j(e[i],n[i]),s)return s;return s=j(e.length,n.length),s||(s=j(e[e.length-2],n[n.length-2]),s||j(e[e.length-1],n[n.length-1]))}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class P_{constructor(t,e){this.overlayedDocument=t,this.mutatedFields=e}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Dd{constructor(t,e,n,s){this.remoteDocumentCache=t,this.mutationQueue=e,this.documentOverlayCache=n,this.indexManager=s}getDocument(t,e){let n=null;return this.documentOverlayCache.getOverlay(t,e).next(s=>(n=s,this.remoteDocumentCache.getEntry(t,e))).next(s=>(n!==null&&kr(n.mutation,s,Dt.empty(),X.now()),s))}getDocuments(t,e){return this.remoteDocumentCache.getEntries(t,e).next(n=>this.getLocalViewOfDocuments(t,n,$()).next(()=>n))}getLocalViewOfDocuments(t,e,n=$()){const s=Ht();return this.populateOverlays(t,s,e).next(()=>this.computeViews(t,e,s,n).next(i=>{let a=vr();return i.forEach((u,l)=>{a=a.insert(u,l.overlayedDocument)}),a}))}getOverlayedDocuments(t,e){const n=Ht();return this.populateOverlays(t,n,e).next(()=>this.computeViews(t,e,n,$()))}populateOverlays(t,e,n){const s=[];return n.forEach(i=>{e.has(i)||s.push(i)}),this.documentOverlayCache.getOverlays(t,s).next(i=>{i.forEach((a,u)=>{e.set(a,u)})})}computeViews(t,e,n,s){let i=Ot();const a=Nr(),u=function(){return Nr()}();return e.forEach((l,d)=>{const f=n.get(d.key);s.has(d.key)&&(f===void 0||f.mutation instanceof ie)?i=i.insert(d.key,d):f!==void 0?(a.set(d.key,f.mutation.getFieldMask()),kr(f.mutation,d,f.mutation.getFieldMask(),X.now())):a.set(d.key,Dt.empty())}),this.recalculateAndSaveOverlays(t,i).next(l=>(l.forEach((d,f)=>a.set(d,f)),e.forEach((d,f)=>u.set(d,new P_(f,a.get(d)??null))),u))}recalculateAndSaveOverlays(t,e){const n=Nr();let s=new rt((a,u)=>a-u),i=$();return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(t,e).next(a=>{for(const u of a)u.keys().forEach(l=>{const d=e.get(l);if(d===null)return;let f=n.get(l)||Dt.empty();f=u.applyToLocalView(d,f),n.set(l,f);const g=(s.get(u.batchId)||$()).add(l);s=s.insert(u.batchId,g)})}).next(()=>{const a=[],u=s.getReverseIterator();for(;u.hasNext();){const l=u.getNext(),d=l.key,f=l.value,g=Kh();f.forEach(_=>{if(!i.has(_)){const S=Zh(e.get(_),n.get(_));S!==null&&g.set(_,S),i=i.add(_)}}),a.push(this.documentOverlayCache.saveOverlays(t,d,g))}return v.waitFor(a)}).next(()=>n)}recalculateAndSaveOverlaysForDocumentKeys(t,e){return this.remoteDocumentCache.getEntries(t,e).next(n=>this.recalculateAndSaveOverlays(t,n))}getDocumentsMatchingQuery(t,e,n,s){return kp(e)?this.getDocumentsMatchingDocumentQuery(t,e.path):Uh(e)?this.getDocumentsMatchingCollectionGroupQuery(t,e,n,s):this.getDocumentsMatchingCollectionQuery(t,e,n,s)}getNextDocuments(t,e,n,s){return this.remoteDocumentCache.getAllFromCollectionGroup(t,e,n,s).next(i=>{const a=s-i.size>0?this.documentOverlayCache.getOverlaysForCollectionGroup(t,e,n.largestBatchId,s-i.size):v.resolve(Ht());let u=Dn,l=i;return a.next(d=>v.forEach(d,(f,g)=>(u<g.largestBatchId&&(u=g.largestBatchId),i.get(f)?v.resolve():this.remoteDocumentCache.getEntry(t,f).next(_=>{l=l.insert(f,_)}))).next(()=>this.populateOverlays(t,d,i)).next(()=>this.computeViews(t,l,d,$())).next(f=>({batchId:u,changes:Gh(f)})))})}getDocumentsMatchingDocumentQuery(t,e){return this.getDocument(t,new N(e)).next(n=>{let s=vr();return n.isFoundDocument()&&(s=s.insert(n.key,n)),s})}getDocumentsMatchingCollectionGroupQuery(t,e,n,s){const i=e.collectionGroup;let a=vr();return this.indexManager.getCollectionParents(t,i).next(u=>v.forEach(u,l=>{const d=function(g,_){return new Qn(_,null,g.explicitOrderBy.slice(),g.filters.slice(),g.limit,g.limitType,g.startAt,g.endAt)}(e,l.child(i));return this.getDocumentsMatchingCollectionQuery(t,d,n,s).next(f=>{f.forEach((g,_)=>{a=a.insert(g,_)})})}).next(()=>a))}getDocumentsMatchingCollectionQuery(t,e,n,s){let i;return this.documentOverlayCache.getOverlaysForCollection(t,e.path,n.largestBatchId).next(a=>(i=a,this.remoteDocumentCache.getDocumentsMatchingQuery(t,e,n,i,s))).next(a=>{i.forEach((l,d)=>{const f=d.getKey();a.get(f)===null&&(a=a.insert(f,ct.newInvalidDocument(f)))});let u=vr();return a.forEach((l,d)=>{const f=i.get(l);f!==void 0&&kr(f.mutation,d,Dt.empty(),X.now()),es(e,d)&&(u=u.insert(l,d))}),u})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class V_{constructor(t){this.serializer=t,this.Nr=new Map,this.Br=new Map}getBundleMetadata(t,e){return v.resolve(this.Nr.get(e))}saveBundleMetadata(t,e){return this.Nr.set(e.id,function(s){return{id:s.id,version:s.version,createTime:Pt(s.createTime)}}(e)),v.resolve()}getNamedQuery(t,e){return v.resolve(this.Br.get(e))}saveNamedQuery(t,e){return this.Br.set(e.name,function(s){return{name:s.name,query:Id(s.bundledQuery),readTime:Pt(s.readTime)}}(e)),v.resolve()}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class C_{constructor(){this.overlays=new rt(N.comparator),this.Lr=new Map}getOverlay(t,e){return v.resolve(this.overlays.get(e))}getOverlays(t,e){const n=Ht();return v.forEach(e,s=>this.getOverlay(t,s).next(i=>{i!==null&&n.set(s,i)})).next(()=>n)}saveOverlays(t,e,n){return n.forEach((s,i)=>{this.bt(t,e,i)}),v.resolve()}removeOverlaysForBatchId(t,e,n){const s=this.Lr.get(n);return s!==void 0&&(s.forEach(i=>this.overlays=this.overlays.remove(i)),this.Lr.delete(n)),v.resolve()}getOverlaysForCollection(t,e,n){const s=Ht(),i=e.length+1,a=new N(e.child("")),u=this.overlays.getIteratorFrom(a);for(;u.hasNext();){const l=u.getNext().value,d=l.getKey();if(!e.isPrefixOf(d.path))break;d.path.length===i&&l.largestBatchId>n&&s.set(l.getKey(),l)}return v.resolve(s)}getOverlaysForCollectionGroup(t,e,n,s){let i=new rt((d,f)=>d-f);const a=this.overlays.getIterator();for(;a.hasNext();){const d=a.getNext().value;if(d.getKey().getCollectionGroup()===e&&d.largestBatchId>n){let f=i.get(d.largestBatchId);f===null&&(f=Ht(),i=i.insert(d.largestBatchId,f)),f.set(d.getKey(),d)}}const u=Ht(),l=i.getIterator();for(;l.hasNext()&&(l.getNext().value.forEach((d,f)=>u.set(d,f)),!(u.size()>=s)););return v.resolve(u)}bt(t,e,n){const s=this.overlays.get(n.key);if(s!==null){const a=this.Lr.get(s.largestBatchId).delete(n.key);this.Lr.set(s.largestBatchId,a)}this.overlays=this.overlays.insert(n.key,new ya(e,n));let i=this.Lr.get(e);i===void 0&&(i=$(),this.Lr.set(e,i)),this.Lr.set(e,i.add(n.key))}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class D_{constructor(){this.sessionToken=lt.EMPTY_BYTE_STRING}getSessionToken(t){return v.resolve(this.sessionToken)}setSessionToken(t,e){return this.sessionToken=e,v.resolve()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class va{constructor(){this.kr=new tt(_t.Kr),this.qr=new tt(_t.Ur)}isEmpty(){return this.kr.isEmpty()}addReference(t,e){const n=new _t(t,e);this.kr=this.kr.add(n),this.qr=this.qr.add(n)}$r(t,e){t.forEach(n=>this.addReference(n,e))}removeReference(t,e){this.Wr(new _t(t,e))}Qr(t,e){t.forEach(n=>this.removeReference(n,e))}Gr(t){const e=new N(new J([])),n=new _t(e,t),s=new _t(e,t+1),i=[];return this.qr.forEachInRange([n,s],a=>{this.Wr(a),i.push(a.key)}),i}zr(){this.kr.forEach(t=>this.Wr(t))}Wr(t){this.kr=this.kr.delete(t),this.qr=this.qr.delete(t)}jr(t){const e=new N(new J([])),n=new _t(e,t),s=new _t(e,t+1);let i=$();return this.qr.forEachInRange([n,s],a=>{i=i.add(a.key)}),i}containsKey(t){const e=new _t(t,0),n=this.kr.firstAfterOrEqual(e);return n!==null&&t.isEqual(n.key)}}class _t{constructor(t,e){this.key=t,this.Hr=e}static Kr(t,e){return N.comparator(t.key,e.key)||j(t.Hr,e.Hr)}static Ur(t,e){return j(t.Hr,e.Hr)||N.comparator(t.key,e.key)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class x_{constructor(t,e){this.indexManager=t,this.referenceDelegate=e,this.mutationQueue=[],this.Yn=1,this.Jr=new tt(_t.Kr)}checkEmpty(t){return v.resolve(this.mutationQueue.length===0)}addMutationBatch(t,e,n,s){const i=this.Yn;this.Yn++,this.mutationQueue.length>0&&this.mutationQueue[this.mutationQueue.length-1];const a=new pa(i,e,n,s);this.mutationQueue.push(a);for(const u of s)this.Jr=this.Jr.add(new _t(u.key,i)),this.indexManager.addToCollectionParentIndex(t,u.key.path.popLast());return v.resolve(a)}lookupMutationBatch(t,e){return v.resolve(this.Zr(e))}getNextMutationBatchAfterBatchId(t,e){const n=e+1,s=this.Xr(n),i=s<0?0:s;return v.resolve(this.mutationQueue.length>i?this.mutationQueue[i]:null)}getHighestUnacknowledgedBatchId(){return v.resolve(this.mutationQueue.length===0?We:this.Yn-1)}getAllMutationBatches(t){return v.resolve(this.mutationQueue.slice())}getAllMutationBatchesAffectingDocumentKey(t,e){const n=new _t(e,0),s=new _t(e,Number.POSITIVE_INFINITY),i=[];return this.Jr.forEachInRange([n,s],a=>{const u=this.Zr(a.Hr);i.push(u)}),v.resolve(i)}getAllMutationBatchesAffectingDocumentKeys(t,e){let n=new tt(j);return e.forEach(s=>{const i=new _t(s,0),a=new _t(s,Number.POSITIVE_INFINITY);this.Jr.forEachInRange([i,a],u=>{n=n.add(u.Hr)})}),v.resolve(this.Yr(n))}getAllMutationBatchesAffectingQuery(t,e){const n=e.path,s=n.length+1;let i=n;N.isDocumentKey(i)||(i=i.child(""));const a=new _t(new N(i),0);let u=new tt(j);return this.Jr.forEachWhile(l=>{const d=l.key.path;return!!n.isPrefixOf(d)&&(d.length===s&&(u=u.add(l.Hr)),!0)},a),v.resolve(this.Yr(u))}Yr(t){const e=[];return t.forEach(n=>{const s=this.Zr(n);s!==null&&e.push(s)}),e}removeMutationBatch(t,e){L(this.ei(e.batchId,"removed")===0,55003),this.mutationQueue.shift();let n=this.Jr;return v.forEach(e.mutations,s=>{const i=new _t(s.key,e.batchId);return n=n.delete(i),this.referenceDelegate.markPotentiallyOrphaned(t,s.key)}).next(()=>{this.Jr=n})}nr(t){}containsKey(t,e){const n=new _t(e,0),s=this.Jr.firstAfterOrEqual(n);return v.resolve(e.isEqual(s&&s.key))}performConsistencyCheck(t){return this.mutationQueue.length,v.resolve()}ei(t,e){return this.Xr(t)}Xr(t){return this.mutationQueue.length===0?0:t-this.mutationQueue[0].batchId}Zr(t){const e=this.Xr(t);return e<0||e>=this.mutationQueue.length?null:this.mutationQueue[e]}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class N_{constructor(t){this.ti=t,this.docs=function(){return new rt(N.comparator)}(),this.size=0}setIndexManager(t){this.indexManager=t}addEntry(t,e){const n=e.key,s=this.docs.get(n),i=s?s.size:0,a=this.ti(e);return this.docs=this.docs.insert(n,{document:e.mutableCopy(),size:a}),this.size+=a-i,this.indexManager.addToCollectionParentIndex(t,n.path.popLast())}removeEntry(t){const e=this.docs.get(t);e&&(this.docs=this.docs.remove(t),this.size-=e.size)}getEntry(t,e){const n=this.docs.get(e);return v.resolve(n?n.document.mutableCopy():ct.newInvalidDocument(e))}getEntries(t,e){let n=Ot();return e.forEach(s=>{const i=this.docs.get(s);n=n.insert(s,i?i.document.mutableCopy():ct.newInvalidDocument(s))}),v.resolve(n)}getDocumentsMatchingQuery(t,e,n,s){let i=Ot();const a=e.path,u=new N(a.child("__id-9223372036854775808__")),l=this.docs.getIteratorFrom(u);for(;l.hasNext();){const{key:d,value:{document:f}}=l.getNext();if(!a.isPrefixOf(d.path))break;d.path.length>a.length+1||sa(ah(f),n)<=0||(s.has(f.key)||es(e,f))&&(i=i.insert(f.key,f.mutableCopy()))}return v.resolve(i)}getAllFromCollectionGroup(t,e,n,s){O(9500)}ni(t,e){return v.forEach(this.docs,n=>e(n))}newChangeBuffer(t){return new k_(this)}getSize(t){return v.resolve(this.size)}}class k_ extends Vd{constructor(t){super(),this.Mr=t}applyChanges(t){const e=[];return this.changes.forEach((n,s)=>{s.isValidDocument()?e.push(this.Mr.addEntry(t,s)):this.Mr.removeEntry(n)}),v.waitFor(e)}getFromCache(t,e){return this.Mr.getEntry(t,e)}getAllFromCache(t,e){return this.Mr.getEntries(t,e)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class M_{constructor(t){this.persistence=t,this.ri=new se(e=>Xe(e),Zr),this.lastRemoteSnapshotVersion=B.min(),this.highestTargetId=0,this.ii=0,this.si=new va,this.targetCount=0,this.oi=rn._r()}forEachTarget(t,e){return this.ri.forEach((n,s)=>e(s)),v.resolve()}getLastRemoteSnapshotVersion(t){return v.resolve(this.lastRemoteSnapshotVersion)}getHighestSequenceNumber(t){return v.resolve(this.ii)}allocateTargetId(t){return this.highestTargetId=this.oi.next(),v.resolve(this.highestTargetId)}setTargetsMetadata(t,e,n){return n&&(this.lastRemoteSnapshotVersion=n),e>this.ii&&(this.ii=e),v.resolve()}lr(t){this.ri.set(t.target,t);const e=t.targetId;e>this.highestTargetId&&(this.oi=new rn(e),this.highestTargetId=e),t.sequenceNumber>this.ii&&(this.ii=t.sequenceNumber)}addTargetData(t,e){return this.lr(e),this.targetCount+=1,v.resolve()}updateTargetData(t,e){return this.lr(e),v.resolve()}removeTargetData(t,e){return this.ri.delete(e.target),this.si.Gr(e.targetId),this.targetCount-=1,v.resolve()}removeTargets(t,e,n){let s=0;const i=[];return this.ri.forEach((a,u)=>{u.sequenceNumber<=e&&n.get(u.targetId)===null&&(this.ri.delete(a),i.push(this.removeMatchingKeysForTargetId(t,u.targetId)),s++)}),v.waitFor(i).next(()=>s)}getTargetCount(t){return v.resolve(this.targetCount)}getTargetData(t,e){const n=this.ri.get(e)||null;return v.resolve(n)}addMatchingKeys(t,e,n){return this.si.$r(e,n),v.resolve()}removeMatchingKeys(t,e,n){this.si.Qr(e,n);const s=this.persistence.referenceDelegate,i=[];return s&&e.forEach(a=>{i.push(s.markPotentiallyOrphaned(t,a))}),v.waitFor(i)}removeMatchingKeysForTargetId(t,e){return this.si.Gr(e),v.resolve()}getMatchingKeysForTargetId(t,e){const n=this.si.jr(e);return v.resolve(n)}containsKey(t,e){return v.resolve(this.si.containsKey(e))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Aa{constructor(t,e){this._i={},this.overlays={},this.ai=new Ct(0),this.ui=!1,this.ui=!0,this.ci=new D_,this.referenceDelegate=t(this),this.li=new M_(this),this.indexManager=new E_,this.remoteDocumentCache=function(s){return new N_(s)}(n=>this.referenceDelegate.hi(n)),this.serializer=new _d(e),this.Pi=new V_(this.serializer)}start(){return Promise.resolve()}shutdown(){return this.ui=!1,Promise.resolve()}get started(){return this.ui}setDatabaseDeletedListener(){}setNetworkEnabled(){}getIndexManager(t){return this.indexManager}getDocumentOverlayCache(t){let e=this.overlays[t.toKey()];return e||(e=new C_,this.overlays[t.toKey()]=e),e}getMutationQueue(t,e){let n=this._i[t.toKey()];return n||(n=new x_(e,this.referenceDelegate),this._i[t.toKey()]=n),n}getGlobalsCache(){return this.ci}getTargetCache(){return this.li}getRemoteDocumentCache(){return this.remoteDocumentCache}getBundleCache(){return this.Pi}runTransaction(t,e,n){V("MemoryPersistence","Starting transaction:",t);const s=new O_(this.ai.next());return this.referenceDelegate.Ti(),n(s).next(i=>this.referenceDelegate.Ii(s).next(()=>i)).toPromise().then(i=>(s.raiseOnCommittedEvent(),i))}Ei(t,e){return v.or(Object.values(this._i).map(n=>()=>n.containsKey(t,e)))}}class O_ extends ch{constructor(t){super(),this.currentSequenceNumber=t}}class Ri{constructor(t){this.persistence=t,this.Ri=new va,this.Ai=null}static Vi(t){return new Ri(t)}get di(){if(this.Ai)return this.Ai;throw O(60996)}addReference(t,e,n){return this.Ri.addReference(n,e),this.di.delete(n.toString()),v.resolve()}removeReference(t,e,n){return this.Ri.removeReference(n,e),this.di.add(n.toString()),v.resolve()}markPotentiallyOrphaned(t,e){return this.di.add(e.toString()),v.resolve()}removeTarget(t,e){this.Ri.Gr(e.targetId).forEach(s=>this.di.add(s.toString()));const n=this.persistence.getTargetCache();return n.getMatchingKeysForTargetId(t,e.targetId).next(s=>{s.forEach(i=>this.di.add(i.toString()))}).next(()=>n.removeTargetData(t,e))}Ti(){this.Ai=new Set}Ii(t){const e=this.persistence.getRemoteDocumentCache().newChangeBuffer();return v.forEach(this.di,n=>{const s=N.fromPath(n);return this.mi(t,s).next(i=>{i||e.removeEntry(s,B.min())})}).next(()=>(this.Ai=null,e.apply(t)))}updateLimboDocument(t,e){return this.mi(t,e).next(n=>{n?this.di.delete(e.toString()):this.di.add(e.toString())})}hi(t){return 0}mi(t,e){return v.or([()=>v.resolve(this.Ri.containsKey(e)),()=>this.persistence.getTargetCache().containsKey(t,e),()=>this.persistence.Ei(t,e)])}}class ri{constructor(t,e){this.persistence=t,this.fi=new se(n=>bt(n.path),(n,s)=>n.isEqual(s)),this.garbageCollector=Pd(this,e)}static Vi(t,e){return new ri(t,e)}Ti(){}Ii(t){return v.resolve()}forEachTarget(t,e){return this.persistence.getTargetCache().forEachTarget(t,e)}dr(t){const e=this.pr(t);return this.persistence.getTargetCache().getTargetCount(t).next(n=>e.next(s=>n+s))}pr(t){let e=0;return this.mr(t,n=>{e++}).next(()=>e)}mr(t,e){return v.forEach(this.fi,(n,s)=>this.wr(t,n,s).next(i=>i?v.resolve():e(s)))}removeTargets(t,e,n){return this.persistence.getTargetCache().removeTargets(t,e,n)}removeOrphanedDocuments(t,e){let n=0;const s=this.persistence.getRemoteDocumentCache(),i=s.newChangeBuffer();return s.ni(t,a=>this.wr(t,a,e).next(u=>{u||(n++,i.removeEntry(a,B.min()))})).next(()=>i.apply(t)).next(()=>n)}markPotentiallyOrphaned(t,e){return this.fi.set(e,t.currentSequenceNumber),v.resolve()}removeTarget(t,e){const n=e.withSequenceNumber(t.currentSequenceNumber);return this.persistence.getTargetCache().updateTargetData(t,n)}addReference(t,e,n){return this.fi.set(n,t.currentSequenceNumber),v.resolve()}removeReference(t,e,n){return this.fi.set(n,t.currentSequenceNumber),v.resolve()}updateLimboDocument(t,e){return this.fi.set(e,t.currentSequenceNumber),v.resolve()}hi(t){let e=t.key.toString().length;return t.isFoundDocument()&&(e+=Os(t.data.value)),e}wr(t,e,n){return v.or([()=>this.persistence.Ei(t,e),()=>this.persistence.getTargetCache().containsKey(t,e),()=>{const s=this.fi.get(e);return v.resolve(s!==void 0&&s>n)}])}getCacheSize(t){return this.persistence.getRemoteDocumentCache().getSize(t)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class F_{constructor(t){this.serializer=t}k(t,e,n,s){const i=new fi("createOrUpgrade",e);n<1&&s>=1&&(function(l){l.createObjectStore(Xr)}(t),function(l){l.createObjectStore(qr,{keyPath:Jg}),l.createObjectStore(Ut,{keyPath:Ic,autoIncrement:!0}).createIndex(He,Ec,{unique:!0}),l.createObjectStore(xn)}(t),cl(t),function(l){l.createObjectStore(je)}(t));let a=v.resolve();return n<3&&s>=3&&(n!==0&&(function(l){l.deleteObjectStore(kn),l.deleteObjectStore(Nn),l.deleteObjectStore(Qe)}(t),cl(t)),a=a.next(()=>function(l){const d=l.store(Qe),f={highestTargetId:0,highestListenSequenceNumber:0,lastRemoteSnapshotVersion:B.min().toTimestamp(),targetCount:0};return d.put(Hs,f)}(i))),n<4&&s>=4&&(n!==0&&(a=a.next(()=>function(l,d){return d.store(Ut).H().next(g=>{l.deleteObjectStore(Ut),l.createObjectStore(Ut,{keyPath:Ic,autoIncrement:!0}).createIndex(He,Ec,{unique:!0});const _=d.store(Ut),S=g.map(D=>_.put(D));return v.waitFor(S)})}(t,i))),a=a.next(()=>{(function(l){l.createObjectStore(Mn,{keyPath:ip})})(t)})),n<5&&s>=5&&(a=a.next(()=>this.gi(i))),n<6&&s>=6&&(a=a.next(()=>(function(l){l.createObjectStore(jr)}(t),this.pi(i)))),n<7&&s>=7&&(a=a.next(()=>this.yi(i))),n<8&&s>=8&&(a=a.next(()=>this.wi(t,i))),n<9&&s>=9&&(a=a.next(()=>{(function(l){l.objectStoreNames.contains("remoteDocumentChanges")&&l.deleteObjectStore("remoteDocumentChanges")})(t)})),n<10&&s>=10&&(a=a.next(()=>this.bi(i))),n<11&&s>=11&&(a=a.next(()=>{(function(l){l.createObjectStore(gi,{keyPath:op})})(t),function(l){l.createObjectStore(pi,{keyPath:ap})}(t)})),n<12&&s>=12&&(a=a.next(()=>{(function(l){const d=l.createObjectStore(_i,{keyPath:mp});d.createIndex(ko,gp,{unique:!1}),d.createIndex(_h,pp,{unique:!1})})(t)})),n<13&&s>=13&&(a=a.next(()=>function(l){const d=l.createObjectStore(Ks,{keyPath:Xg});d.createIndex(ks,Zg),d.createIndex(fh,tp)}(t)).next(()=>this.Si(t,i)).next(()=>t.deleteObjectStore(je))),n<14&&s>=14&&(a=a.next(()=>this.Di(t,i))),n<15&&s>=15&&(a=a.next(()=>function(l){l.createObjectStore(aa,{keyPath:up,autoIncrement:!0}).createIndex(No,cp,{unique:!1}),l.createObjectStore(Vr,{keyPath:lp}).createIndex(gh,hp,{unique:!1}),l.createObjectStore(Cr,{keyPath:dp}).createIndex(ph,fp,{unique:!1})}(t))),n<16&&s>=16&&(a=a.next(()=>{e.objectStore(Vr).clear()}).next(()=>{e.objectStore(Cr).clear()})),n<17&&s>=17&&(a=a.next(()=>{(function(l){l.createObjectStore(ua,{keyPath:_p})})(t)})),n<18&&s>=18&&Ul()&&(a=a.next(()=>{e.objectStore(Vr).clear()}).next(()=>{e.objectStore(Cr).clear()})),a}pi(t){let e=0;return t.store(je).ee((n,s)=>{e+=ni(s)}).next(()=>{const n={byteSize:e};return t.store(jr).put(xo,n)})}gi(t){const e=t.store(qr),n=t.store(Ut);return e.H().next(s=>v.forEach(s,i=>{const a=IDBKeyRange.bound([i.userId,We],[i.userId,i.lastAcknowledgedBatchId]);return n.H(He,a).next(u=>v.forEach(u,l=>{L(l.userId===i.userId,18650,"Cannot process batch from unexpected user",{batchId:l.batchId});const d=$e(this.serializer,l);return vd(t,i.userId,d).next(()=>{})}))}))}yi(t){const e=t.store(kn),n=t.store(je);return t.store(Qe).get(Hs).next(s=>{const i=[];return n.ee((a,u)=>{const l=new J(a),d=function(g){return[0,bt(g)]}(l);i.push(e.get(d).next(f=>f?v.resolve():(g=>e.put({targetId:0,path:bt(g),sequenceNumber:s.highestListenSequenceNumber}))(l)))}).next(()=>v.waitFor(i))})}wi(t,e){t.createObjectStore(zr,{keyPath:sp});const n=e.store(zr),s=new wa,i=a=>{if(s.add(a)){const u=a.lastSegment(),l=a.popLast();return n.put({collectionId:u,parent:bt(l)})}};return e.store(je).ee({Y:!0},(a,u)=>{const l=new J(a);return i(l.popLast())}).next(()=>e.store(xn).ee({Y:!0},([a,u,l],d)=>{const f=Kt(u);return i(f.popLast())}))}bi(t){const e=t.store(Nn);return e.ee((n,s)=>{const i=br(s),a=yd(this.serializer,i);return e.put(a)})}Si(t,e){const n=e.store(je),s=[];return n.ee((i,a)=>{const u=e.store(Ks),l=function(g){return g.document?new N(J.fromString(g.document.name).popFirst(5)):g.noDocument?N.fromSegments(g.noDocument.path):g.unknownDocument?N.fromSegments(g.unknownDocument.path):O(36783)}(a).path.toArray(),d={prefixPath:l.slice(0,l.length-2),collectionGroup:l[l.length-2],documentId:l[l.length-1],readTime:a.readTime||[0,0],unknownDocument:a.unknownDocument,noDocument:a.noDocument,document:a.document,hasCommittedMutations:!!a.hasCommittedMutations};s.push(u.put(d))}).next(()=>v.waitFor(s))}Di(t,e){const n=e.store(Ut),s=Cd(this.serializer),i=new Aa(Ri.Vi,this.serializer.yt);return n.H().next(a=>{const u=new Map;return a.forEach(l=>{let d=u.get(l.userId)??$();$e(this.serializer,l).keys().forEach(f=>d=d.add(f)),u.set(l.userId,d)}),v.forEach(u,(l,d)=>{const f=new Tt(d),g=Ai.wt(this.serializer,f),_=i.getIndexManager(f),S=bi.wt(f,this.serializer,_,i.referenceDelegate);return new Dd(s,S,g,_).recalculateAndSaveOverlaysForDocumentKeys(new Mo(e,Ct.ce),l).next()})})}}function cl(r){r.createObjectStore(kn,{keyPath:np}).createIndex(oa,rp,{unique:!0}),r.createObjectStore(Nn,{keyPath:"targetId"}).createIndex(mh,ep,{unique:!0}),r.createObjectStore(Qe)}const me="IndexedDbPersistence",_o=18e5,yo=5e3,Io="Failed to obtain exclusive access to the persistence layer. To allow shared access, multi-tab synchronization has to be enabled in all tabs. If you are using `experimentalForceOwningTab:true`, make sure that only one tab has persistence enabled at any given time.",L_="main";class ba{constructor(t,e,n,s,i,a,u,l,d,f,g=18){if(this.allowTabSynchronization=t,this.persistenceKey=e,this.clientId=n,this.Ci=i,this.window=a,this.document=u,this.Fi=d,this.Mi=f,this.xi=g,this.ai=null,this.ui=!1,this.isPrimary=!1,this.networkEnabled=!0,this.Oi=null,this.inForeground=!1,this.Ni=null,this.Bi=null,this.Li=Number.NEGATIVE_INFINITY,this.ki=_=>Promise.resolve(),!ba.v())throw new C(P.UNIMPLEMENTED,"This platform is either missing IndexedDB or is known to have an incomplete implementation. Offline persistence has been disabled.");this.referenceDelegate=new b_(this,s),this.Ki=e+L_,this.serializer=new _d(l),this.qi=new Ee(this.Ki,this.xi,new F_(this.serializer)),this.ci=new m_,this.li=new w_(this.referenceDelegate,this.serializer),this.remoteDocumentCache=Cd(this.serializer),this.Pi=new f_,this.window&&this.window.localStorage?this.Ui=this.window.localStorage:(this.Ui=null,f===!1&&ht(me,"LocalStorage is unavailable. As a result, persistence may not work reliably. In particular enablePersistence() could fail immediately after refreshing the page."))}start(){return this.$i().then(()=>{if(!this.isPrimary&&!this.allowTabSynchronization)throw new C(P.FAILED_PRECONDITION,Io);return this.Wi(),this.Qi(),this.Gi(),this.runTransaction("getHighestListenSequenceNumber","readonly",t=>this.li.getHighestSequenceNumber(t))}).then(t=>{this.ai=new Ct(t,this.Fi)}).then(()=>{this.ui=!0}).catch(t=>(this.qi&&this.qi.close(),Promise.reject(t)))}zi(t){return this.ki=async e=>{if(this.started)return t(e)},t(this.isPrimary)}setDatabaseDeletedListener(t){this.qi.q(async e=>{e.newVersion===null&&await t()})}setNetworkEnabled(t){this.networkEnabled!==t&&(this.networkEnabled=t,this.Ci.enqueueAndForget(async()=>{this.started&&await this.$i()}))}$i(){return this.runTransaction("updateClientMetadataAndTryBecomePrimary","readwrite",t=>Vs(t).put({clientId:this.clientId,updateTimeMs:Date.now(),networkEnabled:this.networkEnabled,inForeground:this.inForeground}).next(()=>{if(this.isPrimary)return this.ji(t).next(e=>{e||(this.isPrimary=!1,this.Ci.enqueueRetryable(()=>this.ki(!1)))})}).next(()=>this.Hi(t)).next(e=>this.isPrimary&&!e?this.Ji(t).next(()=>!1):!!e&&this.Zi(t).next(()=>!0))).catch(t=>{if(Ve(t))return V(me,"Failed to extend owner lease: ",t),this.isPrimary;if(!this.allowTabSynchronization)throw t;return V(me,"Releasing owner lease after error during lease refresh",t),!1}).then(t=>{this.isPrimary!==t&&this.Ci.enqueueRetryable(()=>this.ki(t)),this.isPrimary=t})}ji(t){return Er(t).get(dn).next(e=>v.resolve(this.Xi(e)))}Yi(t){return Vs(t).delete(this.clientId)}async es(){if(this.isPrimary&&!this.ts(this.Li,_o)){this.Li=Date.now();const t=await this.runTransaction("maybeGarbageCollectMultiClientState","readwrite-primary",e=>{const n=gt(e,Mn);return n.H().next(s=>{const i=this.ns(s,_o),a=s.filter(u=>i.indexOf(u)===-1);return v.forEach(a,u=>n.delete(u.clientId)).next(()=>a)})}).catch(()=>[]);if(this.Ui)for(const e of t)this.Ui.removeItem(this.rs(e.clientId))}}Gi(){this.Bi=this.Ci.enqueueAfterDelay("client_metadata_refresh",4e3,()=>this.$i().then(()=>this.es()).then(()=>this.Gi()))}Xi(t){return!!t&&t.ownerId===this.clientId}Hi(t){return this.Mi?v.resolve(!0):Er(t).get(dn).next(e=>{if(e!==null&&this.ts(e.leaseTimestampMs,yo)&&!this.ss(e.ownerId)){if(this.Xi(e)&&this.networkEnabled)return!0;if(!this.Xi(e)){if(!e.allowTabSynchronization)throw new C(P.FAILED_PRECONDITION,Io);return!1}}return!(!this.networkEnabled||!this.inForeground)||Vs(t).H().next(n=>this.ns(n,yo).find(s=>{if(this.clientId!==s.clientId){const i=!this.networkEnabled&&s.networkEnabled,a=!this.inForeground&&s.inForeground,u=this.networkEnabled===s.networkEnabled;if(i||a&&u)return!0}return!1})===void 0)}).next(e=>(this.isPrimary!==e&&V(me,`Client ${e?"is":"is not"} eligible for a primary lease.`),e))}async shutdown(){this.ui=!1,this._s(),this.Bi&&(this.Bi.cancel(),this.Bi=null),this.us(),this.cs(),await this.qi.runTransaction("shutdown","readwrite",[Xr,Mn],t=>{const e=new Mo(t,Ct.ce);return this.Ji(e).next(()=>this.Yi(e))}),this.qi.close(),this.ls()}ns(t,e){return t.filter(n=>this.ts(n.updateTimeMs,e)&&!this.ss(n.clientId))}hs(){return this.runTransaction("getActiveClients","readonly",t=>Vs(t).H().next(e=>this.ns(e,_o).map(n=>n.clientId)))}get started(){return this.ui}getGlobalsCache(){return this.ci}getMutationQueue(t,e){return bi.wt(t,this.serializer,e,this.referenceDelegate)}getTargetCache(){return this.li}getRemoteDocumentCache(){return this.remoteDocumentCache}getIndexManager(t){return new T_(t,this.serializer.yt.databaseId)}getDocumentOverlayCache(t){return Ai.wt(this.serializer,t)}getBundleCache(){return this.Pi}runTransaction(t,e,n){V(me,"Starting transaction:",t);const s=e==="readonly"?"readonly":"readwrite",i=function(l){return l===18?Ep:l===17?Th:l===16?Ip:l===15?ca:l===14?Eh:l===13?Ih:l===12?yp:l===11?yh:void O(60245)}(this.xi);let a;return this.qi.runTransaction(t,s,i,u=>(a=new Mo(u,this.ai?this.ai.next():Ct.ce),e==="readwrite-primary"?this.ji(a).next(l=>!!l||this.Hi(a)).next(l=>{if(!l)throw ht(`Failed to obtain primary lease for action '${t}'.`),this.isPrimary=!1,this.Ci.enqueueRetryable(()=>this.ki(!1)),new C(P.FAILED_PRECONDITION,uh);return n(a)}).next(l=>this.Zi(a).next(()=>l)):this.Ps(a).next(()=>n(a)))).then(u=>(a.raiseOnCommittedEvent(),u))}Ps(t){return Er(t).get(dn).next(e=>{if(e!==null&&this.ts(e.leaseTimestampMs,yo)&&!this.ss(e.ownerId)&&!this.Xi(e)&&!(this.Mi||this.allowTabSynchronization&&e.allowTabSynchronization))throw new C(P.FAILED_PRECONDITION,Io)})}Zi(t){const e={ownerId:this.clientId,allowTabSynchronization:this.allowTabSynchronization,leaseTimestampMs:Date.now()};return Er(t).put(dn,e)}static v(){return Ee.v()}Ji(t){const e=Er(t);return e.get(dn).next(n=>this.Xi(n)?(V(me,"Releasing primary lease."),e.delete(dn)):v.resolve())}ts(t,e){const n=Date.now();return!(t<n-e)&&(!(t>n)||(ht(`Detected an update time that is in the future: ${t} > ${n}`),!1))}Wi(){this.document!==null&&typeof this.document.addEventListener=="function"&&(this.Ni=()=>{this.Ci.enqueueAndForget(()=>(this.inForeground=this.document.visibilityState==="visible",this.$i()))},this.document.addEventListener("visibilitychange",this.Ni),this.inForeground=this.document.visibilityState==="visible")}us(){this.Ni&&(this.document.removeEventListener("visibilitychange",this.Ni),this.Ni=null)}Qi(){var t;typeof((t=this.window)==null?void 0:t.addEventListener)=="function"&&(this.Oi=()=>{this._s();const e=/(?:Version|Mobile)\/1[456]/;Bl()&&(navigator.appVersion.match(e)||navigator.userAgent.match(e))&&this.Ci.enterRestrictedMode(!0),this.Ci.enqueueAndForget(()=>this.shutdown())},this.window.addEventListener("pagehide",this.Oi))}cs(){this.Oi&&(this.window.removeEventListener("pagehide",this.Oi),this.Oi=null)}ss(t){var e;try{const n=((e=this.Ui)==null?void 0:e.getItem(this.rs(t)))!==null;return V(me,`Client '${t}' ${n?"is":"is not"} zombied in LocalStorage`),n}catch(n){return ht(me,"Failed to get zombied client id.",n),!1}}_s(){if(this.Ui)try{this.Ui.setItem(this.rs(this.clientId),String(Date.now()))}catch(t){ht("Failed to set zombie client id.",t)}}ls(){if(this.Ui)try{this.Ui.removeItem(this.rs(this.clientId))}catch{}}rs(t){return`firestore_zombie_${this.persistenceKey}_${t}`}}function Er(r){return gt(r,Xr)}function Vs(r){return gt(r,Mn)}function xd(r,t){let e=r.projectId;return r.isDefaultDatabase||(e+="."+r.database),"firestore/"+t+"/"+e+"/"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ra{constructor(t,e,n,s){this.targetId=t,this.fromCache=e,this.Ts=n,this.Is=s}static Es(t,e){let n=$(),s=$();for(const i of e.docChanges)switch(i.type){case 0:n=n.add(i.doc.key);break;case 1:s=s.add(i.doc.key)}return new Ra(t,e.fromCache,n,s)}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class B_{constructor(){this._documentReadCount=0}get documentReadCount(){return this._documentReadCount}incrementDocumentReadCount(t){this._documentReadCount+=t}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Nd{constructor(){this.Rs=!1,this.As=!1,this.Vs=100,this.ds=function(){return Bl()?8:lh(Sn())>0?6:4}()}initialize(t,e){this.fs=t,this.indexManager=e,this.Rs=!0}getDocumentsMatchingQuery(t,e,n,s){const i={result:null};return this.gs(t,e).next(a=>{i.result=a}).next(()=>{if(!i.result)return this.ps(t,e,s,n).next(a=>{i.result=a})}).next(()=>{if(i.result)return;const a=new B_;return this.ys(t,e,a).next(u=>{if(i.result=u,this.As)return this.ws(t,e,a,u.size)})}).next(()=>i.result)}ws(t,e,n,s){return n.documentReadCount<this.Vs?(yn()<=W.DEBUG&&V("QueryEngine","SDK will not create cache indexes for query:",In(e),"since it only creates cache indexes for collection contains","more than or equal to",this.Vs,"documents"),v.resolve()):(yn()<=W.DEBUG&&V("QueryEngine","Query:",In(e),"scans",n.documentReadCount,"local documents and returns",s,"documents as results."),n.documentReadCount>this.ds*s?(yn()<=W.DEBUG&&V("QueryEngine","The SDK decides to create cache indexes for query:",In(e),"as using cache indexes may help improve performance."),this.indexManager.createTargetIndexes(t,Ft(e))):v.resolve())}gs(t,e){if(Nc(e))return v.resolve(null);let n=Ft(e);return this.indexManager.getIndexType(t,n).next(s=>s===0?null:(e.limit!==null&&s===1&&(e=Ys(e,null,"F"),n=Ft(e)),this.indexManager.getDocumentsMatchingTarget(t,n).next(i=>{const a=$(...i);return this.fs.getDocuments(t,a).next(u=>this.indexManager.getMinOffset(t,n).next(l=>{const d=this.bs(e,u);return this.Ss(e,d,a,l.readTime)?this.gs(t,Ys(e,null,"F")):this.Ds(t,d,e,l)}))})))}ps(t,e,n,s){return Nc(e)||s.isEqual(B.min())?v.resolve(null):this.fs.getDocuments(t,n).next(i=>{const a=this.bs(e,i);return this.Ss(e,a,n,s)?v.resolve(null):(yn()<=W.DEBUG&&V("QueryEngine","Re-using previous result from %s to execute query: %s",s.toString(),In(e)),this.Ds(t,a,e,oh(s,Dn)).next(u=>u))})}bs(t,e){let n=new tt(zh(t));return e.forEach((s,i)=>{es(t,i)&&(n=n.add(i))}),n}Ss(t,e,n,s){if(t.limit===null)return!1;if(n.size!==e.size)return!0;const i=t.limitType==="F"?e.last():e.first();return!!i&&(i.hasPendingWrites||i.version.compareTo(s)>0)}ys(t,e,n){return yn()<=W.DEBUG&&V("QueryEngine","Using full collection scan to execute query:",In(e)),this.fs.getDocumentsMatchingQuery(t,e,Lt.min(),n)}Ds(t,e,n,s){return this.fs.getDocumentsMatchingQuery(t,n,s).next(i=>(e.forEach(a=>{i=i.insert(a.key,a)}),i))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Sa="LocalStore",U_=3e8;class q_{constructor(t,e,n,s){this.persistence=t,this.Cs=e,this.serializer=s,this.vs=new rt(j),this.Fs=new se(i=>Xe(i),Zr),this.Ms=new Map,this.xs=t.getRemoteDocumentCache(),this.li=t.getTargetCache(),this.Pi=t.getBundleCache(),this.Os(n)}Os(t){this.documentOverlayCache=this.persistence.getDocumentOverlayCache(t),this.indexManager=this.persistence.getIndexManager(t),this.mutationQueue=this.persistence.getMutationQueue(t,this.indexManager),this.localDocuments=new Dd(this.xs,this.mutationQueue,this.documentOverlayCache,this.indexManager),this.xs.setIndexManager(this.indexManager),this.Cs.initialize(this.localDocuments,this.indexManager)}collectGarbage(t){return this.persistence.runTransaction("Collect garbage","readwrite-primary",e=>t.collect(e,this.vs))}}function kd(r,t,e,n){return new q_(r,t,e,n)}async function Md(r,t){const e=F(r);return await e.persistence.runTransaction("Handle user change","readonly",n=>{let s;return e.mutationQueue.getAllMutationBatches(n).next(i=>(s=i,e.Os(t),e.mutationQueue.getAllMutationBatches(n))).next(i=>{const a=[],u=[];let l=$();for(const d of s){a.push(d.batchId);for(const f of d.mutations)l=l.add(f.key)}for(const d of i){u.push(d.batchId);for(const f of d.mutations)l=l.add(f.key)}return e.localDocuments.getDocuments(n,l).next(d=>({Ns:d,removedBatchIds:a,addedBatchIds:u}))})})}function j_(r,t){const e=F(r);return e.persistence.runTransaction("Acknowledge batch","readwrite-primary",n=>{const s=t.batch.keys(),i=e.xs.newChangeBuffer({trackRemovals:!0});return function(u,l,d,f){const g=d.batch,_=g.keys();let S=v.resolve();return _.forEach(D=>{S=S.next(()=>f.getEntry(l,D)).next(k=>{const M=d.docVersions.get(D);L(M!==null,48541),k.version.compareTo(M)<0&&(g.applyToRemoteDocument(k,d),k.isValidDocument()&&(k.setReadTime(d.commitVersion),f.addEntry(k)))})}),S.next(()=>u.mutationQueue.removeMutationBatch(l,g))}(e,n,t,i).next(()=>i.apply(n)).next(()=>e.mutationQueue.performConsistencyCheck(n)).next(()=>e.documentOverlayCache.removeOverlaysForBatchId(n,s,t.batch.batchId)).next(()=>e.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(n,function(u){let l=$();for(let d=0;d<u.mutationResults.length;++d)u.mutationResults[d].transformResults.length>0&&(l=l.add(u.batch.mutations[d].key));return l}(t))).next(()=>e.localDocuments.getDocuments(n,s))})}function Od(r){const t=F(r);return t.persistence.runTransaction("Get last remote snapshot version","readonly",e=>t.li.getLastRemoteSnapshotVersion(e))}function z_(r,t){const e=F(r),n=t.snapshotVersion;let s=e.vs;return e.persistence.runTransaction("Apply remote event","readwrite-primary",i=>{const a=e.xs.newChangeBuffer({trackRemovals:!0});s=e.vs;const u=[];t.targetChanges.forEach((f,g)=>{const _=s.get(g);if(!_)return;u.push(e.li.removeMatchingKeys(i,f.removedDocuments,g).next(()=>e.li.addMatchingKeys(i,f.addedDocuments,g)));let S=_.withSequenceNumber(i.currentSequenceNumber);t.targetMismatches.get(g)!==null?S=S.withResumeToken(lt.EMPTY_BYTE_STRING,B.min()).withLastLimboFreeSnapshotVersion(B.min()):f.resumeToken.approximateByteSize()>0&&(S=S.withResumeToken(f.resumeToken,n)),s=s.insert(g,S),function(k,M,G){return k.resumeToken.approximateByteSize()===0||M.snapshotVersion.toMicroseconds()-k.snapshotVersion.toMicroseconds()>=U_?!0:G.addedDocuments.size+G.modifiedDocuments.size+G.removedDocuments.size>0}(_,S,f)&&u.push(e.li.updateTargetData(i,S))});let l=Ot(),d=$();if(t.documentUpdates.forEach(f=>{t.resolvedLimboDocuments.has(f)&&u.push(e.persistence.referenceDelegate.updateLimboDocument(i,f))}),u.push($_(i,a,t.documentUpdates).next(f=>{l=f.Bs,d=f.Ls})),!n.isEqual(B.min())){const f=e.li.getLastRemoteSnapshotVersion(i).next(g=>e.li.setTargetsMetadata(i,i.currentSequenceNumber,n));u.push(f)}return v.waitFor(u).next(()=>a.apply(i)).next(()=>e.localDocuments.getLocalViewOfDocuments(i,l,d)).next(()=>l)}).then(i=>(e.vs=s,i))}function $_(r,t,e){let n=$(),s=$();return e.forEach(i=>n=n.add(i)),t.getEntries(r,n).next(i=>{let a=Ot();return e.forEach((u,l)=>{const d=i.get(u);l.isFoundDocument()!==d.isFoundDocument()&&(s=s.add(u)),l.isNoDocument()&&l.version.isEqual(B.min())?(t.removeEntry(u,l.readTime),a=a.insert(u,l)):!d.isValidDocument()||l.version.compareTo(d.version)>0||l.version.compareTo(d.version)===0&&d.hasPendingWrites?(t.addEntry(l),a=a.insert(u,l)):V(Sa,"Ignoring outdated watch update for ",u,". Current version:",d.version," Watch version:",l.version)}),{Bs:a,Ls:s}})}function G_(r,t){const e=F(r);return e.persistence.runTransaction("Get next mutation batch","readonly",n=>(t===void 0&&(t=We),e.mutationQueue.getNextMutationBatchAfterBatchId(n,t)))}function si(r,t){const e=F(r);return e.persistence.runTransaction("Allocate target","readwrite",n=>{let s;return e.li.getTargetData(n,t).next(i=>i?(s=i,v.resolve(s)):e.li.allocateTargetId(n).next(a=>(s=new Zt(t,a,"TargetPurposeListen",n.currentSequenceNumber),e.li.addTargetData(n,s).next(()=>s))))}).then(n=>{const s=e.vs.get(n.targetId);return(s===null||n.snapshotVersion.compareTo(s.snapshotVersion)>0)&&(e.vs=e.vs.insert(n.targetId,n),e.Fs.set(t,n.targetId)),n})}async function zn(r,t,e){const n=F(r),s=n.vs.get(t),i=e?"readwrite":"readwrite-primary";try{e||await n.persistence.runTransaction("Release target",i,a=>n.persistence.referenceDelegate.removeTarget(a,s))}catch(a){if(!Ve(a))throw a;V(Sa,`Failed to update sequence numbers for target ${t}: ${a}`)}n.vs=n.vs.remove(t),n.Fs.delete(s.target)}function Qo(r,t,e){const n=F(r);let s=B.min(),i=$();return n.persistence.runTransaction("Execute query","readwrite",a=>function(l,d,f){const g=F(l),_=g.Fs.get(f);return _!==void 0?v.resolve(g.vs.get(_)):g.li.getTargetData(d,f)}(n,a,Ft(t)).next(u=>{if(u)return s=u.lastLimboFreeSnapshotVersion,n.li.getMatchingKeysForTargetId(a,u.targetId).next(l=>{i=l})}).next(()=>n.Cs.getDocumentsMatchingQuery(a,t,e?s:B.min(),e?i:$())).next(u=>(Bd(n,jh(t),u),{documents:u,ks:i})))}function Fd(r,t){const e=F(r),n=F(e.li),s=e.vs.get(t);return s?Promise.resolve(s.target):e.persistence.runTransaction("Get target data","readonly",i=>n.At(i,t).next(a=>a?a.target:null))}function Ld(r,t){const e=F(r),n=e.Ms.get(t)||B.min();return e.persistence.runTransaction("Get new document changes","readonly",s=>e.xs.getAllFromCollectionGroup(s,t,oh(n,Dn),Number.MAX_SAFE_INTEGER)).then(s=>(Bd(e,t,s),s))}function Bd(r,t,e){let n=r.Ms.get(t)||B.min();e.forEach((s,i)=>{i.readTime.compareTo(n)>0&&(n=i.readTime)}),r.Ms.set(t,n)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ud="firestore_clients";function ll(r,t){return`${Ud}_${r}_${t}`}const qd="firestore_mutations";function hl(r,t,e){let n=`${qd}_${r}_${e}`;return t.isAuthenticated()&&(n+=`_${t.uid}`),n}const jd="firestore_targets";function Eo(r,t){return`${jd}_${r}_${t}`}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Gt="SharedClientState";class ii{constructor(t,e,n,s){this.user=t,this.batchId=e,this.state=n,this.error=s}static $s(t,e,n){const s=JSON.parse(n);let i,a=typeof s=="object"&&["pending","acknowledged","rejected"].indexOf(s.state)!==-1&&(s.error===void 0||typeof s.error=="object");return a&&s.error&&(a=typeof s.error.message=="string"&&typeof s.error.code=="string",a&&(i=new C(s.error.code,s.error.message))),a?new ii(t,e,s.state,i):(ht(Gt,`Failed to parse mutation state for ID '${e}': ${n}`),null)}Ws(){const t={state:this.state,updateTimeMs:Date.now()};return this.error&&(t.error={code:this.error.code,message:this.error.message}),JSON.stringify(t)}}class Mr{constructor(t,e,n){this.targetId=t,this.state=e,this.error=n}static $s(t,e){const n=JSON.parse(e);let s,i=typeof n=="object"&&["not-current","current","rejected"].indexOf(n.state)!==-1&&(n.error===void 0||typeof n.error=="object");return i&&n.error&&(i=typeof n.error.message=="string"&&typeof n.error.code=="string",i&&(s=new C(n.error.code,n.error.message))),i?new Mr(t,n.state,s):(ht(Gt,`Failed to parse target state for ID '${t}': ${e}`),null)}Ws(){const t={state:this.state,updateTimeMs:Date.now()};return this.error&&(t.error={code:this.error.code,message:this.error.message}),JSON.stringify(t)}}class oi{constructor(t,e){this.clientId=t,this.activeTargetIds=e}static $s(t,e){const n=JSON.parse(e);let s=typeof n=="object"&&n.activeTargetIds instanceof Array,i=ma();for(let a=0;s&&a<n.activeTargetIds.length;++a)s=hh(n.activeTargetIds[a]),i=i.add(n.activeTargetIds[a]);return s?new oi(t,i):(ht(Gt,`Failed to parse client data for instance '${t}': ${e}`),null)}}class Pa{constructor(t,e){this.clientId=t,this.onlineState=e}static $s(t){const e=JSON.parse(t);return typeof e=="object"&&["Unknown","Online","Offline"].indexOf(e.onlineState)!==-1&&typeof e.clientId=="string"?new Pa(e.clientId,e.onlineState):(ht(Gt,`Failed to parse online state: ${t}`),null)}}class Jo{constructor(){this.activeTargetIds=ma()}Qs(t){this.activeTargetIds=this.activeTargetIds.add(t)}Gs(t){this.activeTargetIds=this.activeTargetIds.delete(t)}Ws(){const t={activeTargetIds:this.activeTargetIds.toArray(),updateTimeMs:Date.now()};return JSON.stringify(t)}}class To{constructor(t,e,n,s,i){this.window=t,this.Ci=e,this.persistenceKey=n,this.zs=s,this.syncEngine=null,this.onlineStateHandler=null,this.sequenceNumberHandler=null,this.js=this.Hs.bind(this),this.Js=new rt(j),this.started=!1,this.Zs=[];const a=n.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");this.storage=this.window.localStorage,this.currentUser=i,this.Xs=ll(this.persistenceKey,this.zs),this.Ys=function(l){return`firestore_sequence_number_${l}`}(this.persistenceKey),this.Js=this.Js.insert(this.zs,new Jo),this.eo=new RegExp(`^${Ud}_${a}_([^_]*)$`),this.no=new RegExp(`^${qd}_${a}_(\\d+)(?:_(.*))?$`),this.ro=new RegExp(`^${jd}_${a}_(\\d+)$`),this.io=function(l){return`firestore_online_state_${l}`}(this.persistenceKey),this.so=function(l){return`firestore_bundle_loaded_v2_${l}`}(this.persistenceKey),this.window.addEventListener("storage",this.js)}static v(t){return!(!t||!t.localStorage)}async start(){const t=await this.syncEngine.hs();for(const n of t){if(n===this.zs)continue;const s=this.getItem(ll(this.persistenceKey,n));if(s){const i=oi.$s(n,s);i&&(this.Js=this.Js.insert(i.clientId,i))}}this.oo();const e=this.storage.getItem(this.io);if(e){const n=this._o(e);n&&this.ao(n)}for(const n of this.Zs)this.Hs(n);this.Zs=[],this.window.addEventListener("pagehide",()=>this.shutdown()),this.started=!0}writeSequenceNumber(t){this.setItem(this.Ys,JSON.stringify(t))}getAllActiveQueryTargets(){return this.uo(this.Js)}isActiveQueryTarget(t){let e=!1;return this.Js.forEach((n,s)=>{s.activeTargetIds.has(t)&&(e=!0)}),e}addPendingMutation(t){this.co(t,"pending")}updateMutationState(t,e,n){this.co(t,e,n),this.lo(t)}addLocalQueryTarget(t,e=!0){let n="not-current";if(this.isActiveQueryTarget(t)){const s=this.storage.getItem(Eo(this.persistenceKey,t));if(s){const i=Mr.$s(t,s);i&&(n=i.state)}}return e&&this.ho.Qs(t),this.oo(),n}removeLocalQueryTarget(t){this.ho.Gs(t),this.oo()}isLocalQueryTarget(t){return this.ho.activeTargetIds.has(t)}clearQueryState(t){this.removeItem(Eo(this.persistenceKey,t))}updateQueryState(t,e,n){this.Po(t,e,n)}handleUserChange(t,e,n){e.forEach(s=>{this.lo(s)}),this.currentUser=t,n.forEach(s=>{this.addPendingMutation(s)})}setOnlineState(t){this.To(t)}notifyBundleLoaded(t){this.Io(t)}shutdown(){this.started&&(this.window.removeEventListener("storage",this.js),this.removeItem(this.Xs),this.started=!1)}getItem(t){const e=this.storage.getItem(t);return V(Gt,"READ",t,e),e}setItem(t,e){V(Gt,"SET",t,e),this.storage.setItem(t,e)}removeItem(t){V(Gt,"REMOVE",t),this.storage.removeItem(t)}Hs(t){const e=t;if(e.storageArea===this.storage){if(V(Gt,"EVENT",e.key,e.newValue),e.key===this.Xs)return void ht("Received WebStorage notification for local change. Another client might have garbage-collected our state");this.Ci.enqueueRetryable(async()=>{if(this.started){if(e.key!==null){if(this.eo.test(e.key)){if(e.newValue==null){const n=this.Eo(e.key);return this.Ro(n,null)}{const n=this.Ao(e.key,e.newValue);if(n)return this.Ro(n.clientId,n)}}else if(this.no.test(e.key)){if(e.newValue!==null){const n=this.Vo(e.key,e.newValue);if(n)return this.mo(n)}}else if(this.ro.test(e.key)){if(e.newValue!==null){const n=this.fo(e.key,e.newValue);if(n)return this.po(n)}}else if(e.key===this.io){if(e.newValue!==null){const n=this._o(e.newValue);if(n)return this.ao(n)}}else if(e.key===this.Ys){const n=function(i){let a=Ct.ce;if(i!=null)try{const u=JSON.parse(i);L(typeof u=="number",30636,{yo:i}),a=u}catch(u){ht(Gt,"Failed to read sequence number from WebStorage",u)}return a}(e.newValue);n!==Ct.ce&&this.sequenceNumberHandler(n)}else if(e.key===this.so){const n=this.wo(e.newValue);await Promise.all(n.map(s=>this.syncEngine.bo(s)))}}}else this.Zs.push(e)})}}get ho(){return this.Js.get(this.zs)}oo(){this.setItem(this.Xs,this.ho.Ws())}co(t,e,n){const s=new ii(this.currentUser,t,e,n),i=hl(this.persistenceKey,this.currentUser,t);this.setItem(i,s.Ws())}lo(t){const e=hl(this.persistenceKey,this.currentUser,t);this.removeItem(e)}To(t){const e={clientId:this.zs,onlineState:t};this.storage.setItem(this.io,JSON.stringify(e))}Po(t,e,n){const s=Eo(this.persistenceKey,t),i=new Mr(t,e,n);this.setItem(s,i.Ws())}Io(t){const e=JSON.stringify(Array.from(t));this.setItem(this.so,e)}Eo(t){const e=this.eo.exec(t);return e?e[1]:null}Ao(t,e){const n=this.Eo(t);return oi.$s(n,e)}Vo(t,e){const n=this.no.exec(t),s=Number(n[1]),i=n[2]!==void 0?n[2]:null;return ii.$s(new Tt(i),s,e)}fo(t,e){const n=this.ro.exec(t),s=Number(n[1]);return Mr.$s(s,e)}_o(t){return Pa.$s(t)}wo(t){return JSON.parse(t)}async mo(t){if(t.user.uid===this.currentUser.uid)return this.syncEngine.So(t.batchId,t.state,t.error);V(Gt,`Ignoring mutation for non-active user ${t.user.uid}`)}po(t){return this.syncEngine.Do(t.targetId,t.state,t.error)}Ro(t,e){const n=e?this.Js.insert(t,e):this.Js.remove(t),s=this.uo(this.Js),i=this.uo(n),a=[],u=[];return i.forEach(l=>{s.has(l)||a.push(l)}),s.forEach(l=>{i.has(l)||u.push(l)}),this.syncEngine.Co(a,u).then(()=>{this.Js=n})}ao(t){this.Js.get(t.clientId)&&this.onlineStateHandler(t.onlineState)}uo(t){let e=ma();return t.forEach((n,s)=>{e=e.unionWith(s.activeTargetIds)}),e}}class zd{constructor(){this.vo=new Jo,this.Fo={},this.onlineStateHandler=null,this.sequenceNumberHandler=null}addPendingMutation(t){}updateMutationState(t,e,n){}addLocalQueryTarget(t,e=!0){return e&&this.vo.Qs(t),this.Fo[t]||"not-current"}updateQueryState(t,e,n){this.Fo[t]=e}removeLocalQueryTarget(t){this.vo.Gs(t)}isLocalQueryTarget(t){return this.vo.activeTargetIds.has(t)}clearQueryState(t){delete this.Fo[t]}getAllActiveQueryTargets(){return this.vo.activeTargetIds}isActiveQueryTarget(t){return this.vo.activeTargetIds.has(t)}start(){return this.vo=new Jo,Promise.resolve()}handleUserChange(t,e,n){}setOnlineState(t){}shutdown(){}writeSequenceNumber(t){}notifyBundleLoaded(t){}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class K_{Mo(t){}shutdown(){}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const dl="ConnectivityMonitor";class fl{constructor(){this.xo=()=>this.Oo(),this.No=()=>this.Bo(),this.Lo=[],this.ko()}Mo(t){this.Lo.push(t)}shutdown(){window.removeEventListener("online",this.xo),window.removeEventListener("offline",this.No)}ko(){window.addEventListener("online",this.xo),window.addEventListener("offline",this.No)}Oo(){V(dl,"Network connectivity changed: AVAILABLE");for(const t of this.Lo)t(0)}Bo(){V(dl,"Network connectivity changed: UNAVAILABLE");for(const t of this.Lo)t(1)}static v(){return typeof window<"u"&&window.addEventListener!==void 0&&window.removeEventListener!==void 0}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Cs=null;function Yo(){return Cs===null?Cs=function(){return 268435456+Math.round(2147483648*Math.random())}():Cs++,"0x"+Cs.toString(16)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const wo="RestConnection",H_={BatchGetDocuments:"batchGet",Commit:"commit",RunQuery:"runQuery",RunAggregationQuery:"runAggregationQuery",ExecutePipeline:"executePipeline"};class W_{get Ko(){return!1}constructor(t){this.databaseInfo=t,this.databaseId=t.databaseId;const e=t.ssl?"https":"http",n=encodeURIComponent(this.databaseId.projectId),s=encodeURIComponent(this.databaseId.database);this.qo=e+"://"+t.host,this.Uo=`projects/${n}/databases/${s}`,this.$o=this.databaseId.database===Ws?`project_id=${n}`:`project_id=${n}&database_id=${s}`}Wo(t,e,n,s,i){const a=Yo(),u=this.Qo(t,e.toUriEncodedString());V(wo,`Sending RPC '${t}' ${a}:`,u,n);const l={"google-cloud-resource-prefix":this.Uo,"x-goog-request-params":this.$o};this.Go(l,s,i);const{host:d}=new URL(u),f=ea(d);return this.zo(t,u,l,n,f).then(g=>(V(wo,`Received RPC '${t}' ${a}: `,g),g),g=>{throw Vn(wo,`RPC '${t}' ${a} failed with error: `,g,"url: ",u,"request:",n),g})}jo(t,e,n,s,i,a){return this.Wo(t,e,n,s,i)}Go(t,e,n){t["X-Goog-Api-Client"]=function(){return"gl-js/ fire/"+Wn}(),t["Content-Type"]="text/plain",this.databaseInfo.appId&&(t["X-Firebase-GMPID"]=this.databaseInfo.appId),e&&e.headers.forEach((s,i)=>t[i]=s),n&&n.headers.forEach((s,i)=>t[i]=s)}Qo(t,e){const n=H_[t];let s=`${this.qo}/v1/${e}:${n}`;return this.databaseInfo.apiKey&&(s=`${s}?key=${encodeURIComponent(this.databaseInfo.apiKey)}`),s}terminate(){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Q_{constructor(t){this.Ho=t.Ho,this.Jo=t.Jo}Zo(t){this.Xo=t}Yo(t){this.e_=t}t_(t){this.n_=t}onMessage(t){this.r_=t}close(){this.Jo()}send(t){this.Ho(t)}i_(){this.Xo()}s_(){this.e_()}o_(t){this.n_(t)}__(t){this.r_(t)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Et="WebChannelConnection",Tr=(r,t,e)=>{r.listen(t,n=>{try{e(n)}catch(s){setTimeout(()=>{throw s},0)}})};class bn extends W_{constructor(t){super(t),this.a_=[],this.forceLongPolling=t.forceLongPolling,this.autoDetectLongPolling=t.autoDetectLongPolling,this.useFetchStreams=t.useFetchStreams,this.longPollingOptions=t.longPollingOptions}static u_(){if(!bn.c_){const t=Xl();Tr(t,Yl.STAT_EVENT,e=>{e.stat===Vo.PROXY?V(Et,"STAT_EVENT: detected buffering proxy"):e.stat===Vo.NOPROXY&&V(Et,"STAT_EVENT: detected no buffering proxy")}),bn.c_=!0}}zo(t,e,n,s,i){const a=Yo();return new Promise((u,l)=>{const d=new Ql;d.setWithCredentials(!0),d.listenOnce(Jl.COMPLETE,()=>{try{switch(d.getLastErrorCode()){case Ds.NO_ERROR:const g=d.getResponseJson();V(Et,`XHR for RPC '${t}' ${a} received:`,JSON.stringify(g)),u(g);break;case Ds.TIMEOUT:V(Et,`RPC '${t}' ${a} timed out`),l(new C(P.DEADLINE_EXCEEDED,"Request time out"));break;case Ds.HTTP_ERROR:const _=d.getStatus();if(V(Et,`RPC '${t}' ${a} failed with status:`,_,"response text:",d.getResponseText()),_>0){let S=d.getResponseJson();Array.isArray(S)&&(S=S[0]);const D=S==null?void 0:S.error;if(D&&D.status&&D.message){const k=function(G){const q=G.toLowerCase().replace(/_/g,"-");return Object.values(P).indexOf(q)>=0?q:P.UNKNOWN}(D.status);l(new C(k,D.message))}else l(new C(P.UNKNOWN,"Server responded with status "+d.getStatus()))}else l(new C(P.UNAVAILABLE,"Connection failed."));break;default:O(9055,{l_:t,streamId:a,h_:d.getLastErrorCode(),P_:d.getLastError()})}}finally{V(Et,`RPC '${t}' ${a} completed.`)}});const f=JSON.stringify(s);V(Et,`RPC '${t}' ${a} sending request:`,s),d.send(e,"POST",f,n,15)})}T_(t,e,n){const s=Yo(),i=[this.qo,"/","google.firestore.v1.Firestore","/",t,"/channel"],a=this.createWebChannelTransport(),u={httpSessionIdParam:"gsessionid",initMessageHeaders:{},messageUrlParams:{database:`projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`},sendRawJson:!0,supportsCrossDomainXhr:!0,internalChannelParams:{forwardChannelRequestTimeoutMs:6e5},forceLongPolling:this.forceLongPolling,detectBufferingProxy:this.autoDetectLongPolling},l=this.longPollingOptions.timeoutSeconds;l!==void 0&&(u.longPollingTimeout=Math.round(1e3*l)),this.useFetchStreams&&(u.useFetchStreams=!0),this.Go(u.initMessageHeaders,e,n),u.encodeInitMessageHeaders=!0;const d=i.join("");V(Et,`Creating RPC '${t}' stream ${s}: ${d}`,u);const f=a.createWebChannel(d,u);this.I_(f);let g=!1,_=!1;const S=new Q_({Ho:D=>{_?V(Et,`Not sending because RPC '${t}' stream ${s} is closed:`,D):(g||(V(Et,`Opening RPC '${t}' stream ${s} transport.`),f.open(),g=!0),V(Et,`RPC '${t}' stream ${s} sending:`,D),f.send(D))},Jo:()=>f.close()});return Tr(f,wr.EventType.OPEN,()=>{_||(V(Et,`RPC '${t}' stream ${s} transport opened.`),S.i_())}),Tr(f,wr.EventType.CLOSE,()=>{_||(_=!0,V(Et,`RPC '${t}' stream ${s} transport closed`),S.o_(),this.E_(f))}),Tr(f,wr.EventType.ERROR,D=>{_||(_=!0,Vn(Et,`RPC '${t}' stream ${s} transport errored. Name:`,D.name,"Message:",D.message),S.o_(new C(P.UNAVAILABLE,"The operation could not be completed")))}),Tr(f,wr.EventType.MESSAGE,D=>{var k;if(!_){const M=D.data[0];L(!!M,16349);const G=M,q=(G==null?void 0:G.error)||((k=G[0])==null?void 0:k.error);if(q){V(Et,`RPC '${t}' stream ${s} received error:`,q);const U=q.status;let et=function(E){const p=dt[E];if(p!==void 0)return nd(p)}(U),Y=q.message;et===void 0&&(et=P.INTERNAL,Y="Unknown error status: "+U+" with message "+q.message),_=!0,S.o_(new C(et,Y)),f.close()}else V(Et,`RPC '${t}' stream ${s} received:`,M),S.__(M)}}),bn.u_(),setTimeout(()=>{S.s_()},0),S}terminate(){this.a_.forEach(t=>t.close()),this.a_=[]}I_(t){this.a_.push(t)}E_(t){this.a_=this.a_.filter(e=>e===t)}Go(t,e,n){super.Go(t,e,n),this.databaseInfo.apiKey&&(t["x-goog-api-key"]=this.databaseInfo.apiKey)}createWebChannelTransport(){return Zl()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function J_(r){return new bn(r)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function $d(){return typeof window<"u"?window:null}function qs(){return typeof document<"u"?document:null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Si(r){return new n_(r,!0)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */bn.c_=!1;class Gd{constructor(t,e,n=1e3,s=1.5,i=6e4){this.Ci=t,this.timerId=e,this.R_=n,this.A_=s,this.V_=i,this.d_=0,this.m_=null,this.f_=Date.now(),this.reset()}reset(){this.d_=0}g_(){this.d_=this.V_}p_(t){this.cancel();const e=Math.floor(this.d_+this.y_()),n=Math.max(0,Date.now()-this.f_),s=Math.max(0,e-n);s>0&&V("ExponentialBackoff",`Backing off for ${s} ms (base delay: ${this.d_} ms, delay with jitter: ${e} ms, last attempt: ${n} ms ago)`),this.m_=this.Ci.enqueueAfterDelay(this.timerId,s,()=>(this.f_=Date.now(),t())),this.d_*=this.A_,this.d_<this.R_&&(this.d_=this.R_),this.d_>this.V_&&(this.d_=this.V_)}w_(){this.m_!==null&&(this.m_.skipDelay(),this.m_=null)}cancel(){this.m_!==null&&(this.m_.cancel(),this.m_=null)}y_(){return(Math.random()-.5)*this.d_}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ml="PersistentStream";class Kd{constructor(t,e,n,s,i,a,u,l){this.Ci=t,this.b_=n,this.S_=s,this.connection=i,this.authCredentialsProvider=a,this.appCheckCredentialsProvider=u,this.listener=l,this.state=0,this.D_=0,this.C_=null,this.v_=null,this.stream=null,this.F_=0,this.M_=new Gd(t,e)}x_(){return this.state===1||this.state===5||this.O_()}O_(){return this.state===2||this.state===3}start(){this.F_=0,this.state!==4?this.auth():this.N_()}async stop(){this.x_()&&await this.close(0)}B_(){this.state=0,this.M_.reset()}L_(){this.O_()&&this.C_===null&&(this.C_=this.Ci.enqueueAfterDelay(this.b_,6e4,()=>this.k_()))}K_(t){this.q_(),this.stream.send(t)}async k_(){if(this.O_())return this.close(0)}q_(){this.C_&&(this.C_.cancel(),this.C_=null)}U_(){this.v_&&(this.v_.cancel(),this.v_=null)}async close(t,e){this.q_(),this.U_(),this.M_.cancel(),this.D_++,t!==4?this.M_.reset():e&&e.code===P.RESOURCE_EXHAUSTED?(ht(e.toString()),ht("Using maximum backoff delay to prevent overloading the backend."),this.M_.g_()):e&&e.code===P.UNAUTHENTICATED&&this.state!==3&&(this.authCredentialsProvider.invalidateToken(),this.appCheckCredentialsProvider.invalidateToken()),this.stream!==null&&(this.W_(),this.stream.close(),this.stream=null),this.state=t,await this.listener.t_(e)}W_(){}auth(){this.state=1;const t=this.Q_(this.D_),e=this.D_;Promise.all([this.authCredentialsProvider.getToken(),this.appCheckCredentialsProvider.getToken()]).then(([n,s])=>{this.D_===e&&this.G_(n,s)},n=>{t(()=>{const s=new C(P.UNKNOWN,"Fetching auth token failed: "+n.message);return this.z_(s)})})}G_(t,e){const n=this.Q_(this.D_);this.stream=this.j_(t,e),this.stream.Zo(()=>{n(()=>this.listener.Zo())}),this.stream.Yo(()=>{n(()=>(this.state=2,this.v_=this.Ci.enqueueAfterDelay(this.S_,1e4,()=>(this.O_()&&(this.state=3),Promise.resolve())),this.listener.Yo()))}),this.stream.t_(s=>{n(()=>this.z_(s))}),this.stream.onMessage(s=>{n(()=>++this.F_==1?this.H_(s):this.onNext(s))})}N_(){this.state=5,this.M_.p_(async()=>{this.state=0,this.start()})}z_(t){return V(ml,`close with error: ${t}`),this.stream=null,this.close(4,t)}Q_(t){return e=>{this.Ci.enqueueAndForget(()=>this.D_===t?e():(V(ml,"stream callback skipped by getCloseGuardedDispatcher."),Promise.resolve()))}}}class Y_ extends Kd{constructor(t,e,n,s,i,a){super(t,"listen_stream_connection_backoff","listen_stream_idle","health_check_timeout",e,n,s,a),this.serializer=i}j_(t,e){return this.connection.T_("Listen",t,e)}H_(t){return this.onNext(t)}onNext(t){this.M_.reset();const e=i_(this.serializer,t),n=function(i){if(!("targetChange"in i))return B.min();const a=i.targetChange;return a.targetIds&&a.targetIds.length?B.min():a.readTime?Pt(a.readTime):B.min()}(t);return this.listener.J_(e,n)}Z_(t){const e={};e.database=$o(this.serializer),e.addTarget=function(i,a){let u;const l=a.target;if(u=Qs(l)?{documents:ld(i,l)}:{query:hd(i,l).ft},u.targetId=a.targetId,a.resumeToken.approximateByteSize()>0){u.resumeToken=id(i,a.resumeToken);const d=jo(i,a.expectedCount);d!==null&&(u.expectedCount=d)}else if(a.snapshotVersion.compareTo(B.min())>0){u.readTime=jn(i,a.snapshotVersion.toTimestamp());const d=jo(i,a.expectedCount);d!==null&&(u.expectedCount=d)}return u}(this.serializer,t);const n=a_(this.serializer,t);n&&(e.labels=n),this.K_(e)}X_(t){const e={};e.database=$o(this.serializer),e.removeTarget=t,this.K_(e)}}class X_ extends Kd{constructor(t,e,n,s,i,a){super(t,"write_stream_connection_backoff","write_stream_idle","health_check_timeout",e,n,s,a),this.serializer=i}get Y_(){return this.F_>0}start(){this.lastStreamToken=void 0,super.start()}W_(){this.Y_&&this.ea([])}j_(t,e){return this.connection.T_("Write",t,e)}H_(t){return L(!!t.streamToken,31322),this.lastStreamToken=t.streamToken,L(!t.writeResults||t.writeResults.length===0,55816),this.listener.ta()}onNext(t){L(!!t.streamToken,12678),this.lastStreamToken=t.streamToken,this.M_.reset();const e=o_(t.writeResults,t.commitTime),n=Pt(t.commitTime);return this.listener.na(n,e)}ra(){const t={};t.database=$o(this.serializer),this.K_(t)}ea(t){const e={streamToken:this.lastStreamToken,writes:t.map(n=>Zs(this.serializer,n))};this.K_(e)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Z_{}class ty extends Z_{constructor(t,e,n,s){super(),this.authCredentials=t,this.appCheckCredentials=e,this.connection=n,this.serializer=s,this.ia=!1}sa(){if(this.ia)throw new C(P.FAILED_PRECONDITION,"The client has already been terminated.")}Wo(t,e,n,s){return this.sa(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([i,a])=>this.connection.Wo(t,zo(e,n),s,i,a)).catch(i=>{throw i.name==="FirebaseError"?(i.code===P.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),i):new C(P.UNKNOWN,i.toString())})}jo(t,e,n,s,i){return this.sa(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([a,u])=>this.connection.jo(t,zo(e,n),s,a,u,i)).catch(a=>{throw a.name==="FirebaseError"?(a.code===P.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),a):new C(P.UNKNOWN,a.toString())})}terminate(){this.ia=!0,this.connection.terminate()}}function ey(r,t,e,n){return new ty(r,t,e,n)}class ny{constructor(t,e){this.asyncQueue=t,this.onlineStateHandler=e,this.state="Unknown",this.oa=0,this._a=null,this.aa=!0}ua(){this.oa===0&&(this.ca("Unknown"),this._a=this.asyncQueue.enqueueAfterDelay("online_state_timeout",1e4,()=>(this._a=null,this.la("Backend didn't respond within 10 seconds."),this.ca("Offline"),Promise.resolve())))}ha(t){this.state==="Online"?this.ca("Unknown"):(this.oa++,this.oa>=1&&(this.Pa(),this.la(`Connection failed 1 times. Most recent error: ${t.toString()}`),this.ca("Offline")))}set(t){this.Pa(),this.oa=0,t==="Online"&&(this.aa=!1),this.ca(t)}ca(t){t!==this.state&&(this.state=t,this.onlineStateHandler(t))}la(t){const e=`Could not reach Cloud Firestore backend. ${t}
This typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;this.aa?(ht(e),this.aa=!1):V("OnlineStateTracker",e)}Pa(){this._a!==null&&(this._a.cancel(),this._a=null)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const sn="RemoteStore";class ry{constructor(t,e,n,s,i){this.localStore=t,this.datastore=e,this.asyncQueue=n,this.remoteSyncer={},this.Ta=[],this.Ia=new Map,this.Ea=new Set,this.Ra=[],this.Aa=i,this.Aa.Mo(a=>{n.enqueueAndForget(async()=>{an(this)&&(V(sn,"Restarting streams for network reachability change."),await async function(l){const d=F(l);d.Ea.add(4),await is(d),d.Va.set("Unknown"),d.Ea.delete(4),await Pi(d)}(this))})}),this.Va=new ny(n,s)}}async function Pi(r){if(an(r))for(const t of r.Ra)await t(!0)}async function is(r){for(const t of r.Ra)await t(!1)}function Vi(r,t){const e=F(r);e.Ia.has(t.targetId)||(e.Ia.set(t.targetId,t),Da(e)?Ca(e):Xn(e).O_()&&Va(e,t))}function $n(r,t){const e=F(r),n=Xn(e);e.Ia.delete(t),n.O_()&&Hd(e,t),e.Ia.size===0&&(n.O_()?n.L_():an(e)&&e.Va.set("Unknown"))}function Va(r,t){if(r.da.$e(t.targetId),t.resumeToken.approximateByteSize()>0||t.snapshotVersion.compareTo(B.min())>0){const e=r.remoteSyncer.getRemoteKeysForTarget(t.targetId).size;t=t.withExpectedCount(e)}Xn(r).Z_(t)}function Hd(r,t){r.da.$e(t),Xn(r).X_(t)}function Ca(r){r.da=new Xp({getRemoteKeysForTarget:t=>r.remoteSyncer.getRemoteKeysForTarget(t),At:t=>r.Ia.get(t)||null,ht:()=>r.datastore.serializer.databaseId}),Xn(r).start(),r.Va.ua()}function Da(r){return an(r)&&!Xn(r).x_()&&r.Ia.size>0}function an(r){return F(r).Ea.size===0}function Wd(r){r.da=void 0}async function sy(r){r.Va.set("Online")}async function iy(r){r.Ia.forEach((t,e)=>{Va(r,t)})}async function oy(r,t){Wd(r),Da(r)?(r.Va.ha(t),Ca(r)):r.Va.set("Unknown")}async function ay(r,t,e){if(r.Va.set("Online"),t instanceof sd&&t.state===2&&t.cause)try{await async function(s,i){const a=i.cause;for(const u of i.targetIds)s.Ia.has(u)&&(await s.remoteSyncer.rejectListen(u,a),s.Ia.delete(u),s.da.removeTarget(u))}(r,t)}catch(n){V(sn,"Failed to remove targets %s: %s ",t.targetIds.join(","),n),await ai(r,n)}else if(t instanceof Bs?r.da.Xe(t):t instanceof rd?r.da.st(t):r.da.tt(t),!e.isEqual(B.min()))try{const n=await Od(r.localStore);e.compareTo(n)>=0&&await function(i,a){const u=i.da.Tt(a);return u.targetChanges.forEach((l,d)=>{if(l.resumeToken.approximateByteSize()>0){const f=i.Ia.get(d);f&&i.Ia.set(d,f.withResumeToken(l.resumeToken,a))}}),u.targetMismatches.forEach((l,d)=>{const f=i.Ia.get(l);if(!f)return;i.Ia.set(l,f.withResumeToken(lt.EMPTY_BYTE_STRING,f.snapshotVersion)),Hd(i,l);const g=new Zt(f.target,l,d,f.sequenceNumber);Va(i,g)}),i.remoteSyncer.applyRemoteEvent(u)}(r,e)}catch(n){V(sn,"Failed to raise snapshot:",n),await ai(r,n)}}async function ai(r,t,e){if(!Ve(t))throw t;r.Ea.add(1),await is(r),r.Va.set("Offline"),e||(e=()=>Od(r.localStore)),r.asyncQueue.enqueueRetryable(async()=>{V(sn,"Retrying IndexedDB access"),await e(),r.Ea.delete(1),await Pi(r)})}function Qd(r,t){return t().catch(e=>ai(r,e,t))}async function Yn(r){const t=F(r),e=Re(t);let n=t.Ta.length>0?t.Ta[t.Ta.length-1].batchId:We;for(;uy(t);)try{const s=await G_(t.localStore,n);if(s===null){t.Ta.length===0&&e.L_();break}n=s.batchId,cy(t,s)}catch(s){await ai(t,s)}Jd(t)&&Yd(t)}function uy(r){return an(r)&&r.Ta.length<10}function cy(r,t){r.Ta.push(t);const e=Re(r);e.O_()&&e.Y_&&e.ea(t.mutations)}function Jd(r){return an(r)&&!Re(r).x_()&&r.Ta.length>0}function Yd(r){Re(r).start()}async function ly(r){Re(r).ra()}async function hy(r){const t=Re(r);for(const e of r.Ta)t.ea(e.mutations)}async function dy(r,t,e){const n=r.Ta.shift(),s=_a.from(n,t,e);await Qd(r,()=>r.remoteSyncer.applySuccessfulWrite(s)),await Yn(r)}async function fy(r,t){t&&Re(r).Y_&&await async function(n,s){if(function(a){return Qp(a)&&a!==P.ABORTED}(s.code)){const i=n.Ta.shift();Re(n).B_(),await Qd(n,()=>n.remoteSyncer.rejectFailedWrite(i.batchId,s)),await Yn(n)}}(r,t),Jd(r)&&Yd(r)}async function gl(r,t){const e=F(r);e.asyncQueue.verifyOperationInProgress(),V(sn,"RemoteStore received new credentials");const n=an(e);e.Ea.add(3),await is(e),n&&e.Va.set("Unknown"),await e.remoteSyncer.handleCredentialChange(t),e.Ea.delete(3),await Pi(e)}async function Xo(r,t){const e=F(r);t?(e.Ea.delete(2),await Pi(e)):t||(e.Ea.add(2),await is(e),e.Va.set("Unknown"))}function Xn(r){return r.ma||(r.ma=function(e,n,s){const i=F(e);return i.sa(),new Y_(n,i.connection,i.authCredentials,i.appCheckCredentials,i.serializer,s)}(r.datastore,r.asyncQueue,{Zo:sy.bind(null,r),Yo:iy.bind(null,r),t_:oy.bind(null,r),J_:ay.bind(null,r)}),r.Ra.push(async t=>{t?(r.ma.B_(),Da(r)?Ca(r):r.Va.set("Unknown")):(await r.ma.stop(),Wd(r))})),r.ma}function Re(r){return r.fa||(r.fa=function(e,n,s){const i=F(e);return i.sa(),new X_(n,i.connection,i.authCredentials,i.appCheckCredentials,i.serializer,s)}(r.datastore,r.asyncQueue,{Zo:()=>Promise.resolve(),Yo:ly.bind(null,r),t_:fy.bind(null,r),ta:hy.bind(null,r),na:dy.bind(null,r)}),r.Ra.push(async t=>{t?(r.fa.B_(),await Yn(r)):(await r.fa.stop(),r.Ta.length>0&&(V(sn,`Stopping write stream with ${r.Ta.length} pending writes`),r.Ta=[]))})),r.fa}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xa{constructor(t,e,n,s,i){this.asyncQueue=t,this.timerId=e,this.targetTimeMs=n,this.op=s,this.removalCallback=i,this.deferred=new Wt,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch(a=>{})}get promise(){return this.deferred.promise}static createAndSchedule(t,e,n,s,i){const a=Date.now()+n,u=new xa(t,e,a,s,i);return u.start(n),u}start(t){this.timerHandle=setTimeout(()=>this.handleDelayElapsed(),t)}skipDelay(){return this.handleDelayElapsed()}cancel(t){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new C(P.CANCELLED,"Operation cancelled"+(t?": "+t:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget(()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then(t=>this.deferred.resolve(t))):Promise.resolve())}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}function Na(r,t){if(ht("AsyncQueue",`${t}: ${r}`),Ve(r))return new C(P.UNAVAILABLE,`${t}: ${r}`);throw r}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Rn{static emptySet(t){return new Rn(t.comparator)}constructor(t){this.comparator=t?(e,n)=>t(e,n)||N.comparator(e.key,n.key):(e,n)=>N.comparator(e.key,n.key),this.keyedMap=vr(),this.sortedSet=new rt(this.comparator)}has(t){return this.keyedMap.get(t)!=null}get(t){return this.keyedMap.get(t)}first(){return this.sortedSet.minKey()}last(){return this.sortedSet.maxKey()}isEmpty(){return this.sortedSet.isEmpty()}indexOf(t){const e=this.keyedMap.get(t);return e?this.sortedSet.indexOf(e):-1}get size(){return this.sortedSet.size}forEach(t){this.sortedSet.inorderTraversal((e,n)=>(t(e),!1))}add(t){const e=this.delete(t.key);return e.copy(e.keyedMap.insert(t.key,t),e.sortedSet.insert(t,null))}delete(t){const e=this.get(t);return e?this.copy(this.keyedMap.remove(t),this.sortedSet.remove(e)):this}isEqual(t){if(!(t instanceof Rn)||this.size!==t.size)return!1;const e=this.sortedSet.getIterator(),n=t.sortedSet.getIterator();for(;e.hasNext();){const s=e.getNext().key,i=n.getNext().key;if(!s.isEqual(i))return!1}return!0}toString(){const t=[];return this.forEach(e=>{t.push(e.toString())}),t.length===0?"DocumentSet ()":`DocumentSet (
  `+t.join(`  
`)+`
)`}copy(t,e){const n=new Rn;return n.comparator=this.comparator,n.keyedMap=t,n.sortedSet=e,n}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class pl{constructor(){this.ga=new rt(N.comparator)}track(t){const e=t.doc.key,n=this.ga.get(e);n?t.type!==0&&n.type===3?this.ga=this.ga.insert(e,t):t.type===3&&n.type!==1?this.ga=this.ga.insert(e,{type:n.type,doc:t.doc}):t.type===2&&n.type===2?this.ga=this.ga.insert(e,{type:2,doc:t.doc}):t.type===2&&n.type===0?this.ga=this.ga.insert(e,{type:0,doc:t.doc}):t.type===1&&n.type===0?this.ga=this.ga.remove(e):t.type===1&&n.type===2?this.ga=this.ga.insert(e,{type:1,doc:n.doc}):t.type===0&&n.type===1?this.ga=this.ga.insert(e,{type:2,doc:t.doc}):O(63341,{Vt:t,pa:n}):this.ga=this.ga.insert(e,t)}ya(){const t=[];return this.ga.inorderTraversal((e,n)=>{t.push(n)}),t}}class Gn{constructor(t,e,n,s,i,a,u,l,d){this.query=t,this.docs=e,this.oldDocs=n,this.docChanges=s,this.mutatedKeys=i,this.fromCache=a,this.syncStateChanged=u,this.excludesMetadataChanges=l,this.hasCachedResults=d}static fromInitialDocuments(t,e,n,s,i){const a=[];return e.forEach(u=>{a.push({type:0,doc:u})}),new Gn(t,e,Rn.emptySet(e),a,n,s,!0,!1,i)}get hasPendingWrites(){return!this.mutatedKeys.isEmpty()}isEqual(t){if(!(this.fromCache===t.fromCache&&this.hasCachedResults===t.hasCachedResults&&this.syncStateChanged===t.syncStateChanged&&this.mutatedKeys.isEqual(t.mutatedKeys)&&Ei(this.query,t.query)&&this.docs.isEqual(t.docs)&&this.oldDocs.isEqual(t.oldDocs)))return!1;const e=this.docChanges,n=t.docChanges;if(e.length!==n.length)return!1;for(let s=0;s<e.length;s++)if(e[s].type!==n[s].type||!e[s].doc.isEqual(n[s].doc))return!1;return!0}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class my{constructor(){this.wa=void 0,this.ba=[]}Sa(){return this.ba.some(t=>t.Da())}}class gy{constructor(){this.queries=_l(),this.onlineState="Unknown",this.Ca=new Set}terminate(){(function(e,n){const s=F(e),i=s.queries;s.queries=_l(),i.forEach((a,u)=>{for(const l of u.ba)l.onError(n)})})(this,new C(P.ABORTED,"Firestore shutting down"))}}function _l(){return new se(r=>qh(r),Ei)}async function ka(r,t){const e=F(r);let n=3;const s=t.query;let i=e.queries.get(s);i?!i.Sa()&&t.Da()&&(n=2):(i=new my,n=t.Da()?0:1);try{switch(n){case 0:i.wa=await e.onListen(s,!0);break;case 1:i.wa=await e.onListen(s,!1);break;case 2:await e.onFirstRemoteStoreListen(s)}}catch(a){const u=Na(a,`Initialization of query '${In(t.query)}' failed`);return void t.onError(u)}e.queries.set(s,i),i.ba.push(t),t.va(e.onlineState),i.wa&&t.Fa(i.wa)&&Oa(e)}async function Ma(r,t){const e=F(r),n=t.query;let s=3;const i=e.queries.get(n);if(i){const a=i.ba.indexOf(t);a>=0&&(i.ba.splice(a,1),i.ba.length===0?s=t.Da()?0:1:!i.Sa()&&t.Da()&&(s=2))}switch(s){case 0:return e.queries.delete(n),e.onUnlisten(n,!0);case 1:return e.queries.delete(n),e.onUnlisten(n,!1);case 2:return e.onLastRemoteStoreUnlisten(n);default:return}}function py(r,t){const e=F(r);let n=!1;for(const s of t){const i=s.query,a=e.queries.get(i);if(a){for(const u of a.ba)u.Fa(s)&&(n=!0);a.wa=s}}n&&Oa(e)}function _y(r,t,e){const n=F(r),s=n.queries.get(t);if(s)for(const i of s.ba)i.onError(e);n.queries.delete(t)}function Oa(r){r.Ca.forEach(t=>{t.next()})}var Zo,yl;(yl=Zo||(Zo={})).Ma="default",yl.Cache="cache";class Fa{constructor(t,e,n){this.query=t,this.xa=e,this.Oa=!1,this.Na=null,this.onlineState="Unknown",this.options=n||{}}Fa(t){if(!this.options.includeMetadataChanges){const n=[];for(const s of t.docChanges)s.type!==3&&n.push(s);t=new Gn(t.query,t.docs,t.oldDocs,n,t.mutatedKeys,t.fromCache,t.syncStateChanged,!0,t.hasCachedResults)}let e=!1;return this.Oa?this.Ba(t)&&(this.xa.next(t),e=!0):this.La(t,this.onlineState)&&(this.ka(t),e=!0),this.Na=t,e}onError(t){this.xa.error(t)}va(t){this.onlineState=t;let e=!1;return this.Na&&!this.Oa&&this.La(this.Na,t)&&(this.ka(this.Na),e=!0),e}La(t,e){if(!t.fromCache||!this.Da())return!0;const n=e!=="Offline";return(!this.options.Ka||!n)&&(!t.docs.isEmpty()||t.hasCachedResults||e==="Offline")}Ba(t){if(t.docChanges.length>0)return!0;const e=this.Na&&this.Na.hasPendingWrites!==t.hasPendingWrites;return!(!t.syncStateChanged&&!e)&&this.options.includeMetadataChanges===!0}ka(t){t=Gn.fromInitialDocuments(t.query,t.docs,t.mutatedKeys,t.fromCache,t.hasCachedResults),this.Oa=!0,this.xa.next(t)}Da(){return this.options.source!==Zo.Cache}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Xd{constructor(t){this.key=t}}class Zd{constructor(t){this.key=t}}class yy{constructor(t,e){this.query=t,this.Za=e,this.Xa=null,this.hasCachedResults=!1,this.current=!1,this.Ya=$(),this.mutatedKeys=$(),this.eu=zh(t),this.tu=new Rn(this.eu)}get nu(){return this.Za}ru(t,e){const n=e?e.iu:new pl,s=e?e.tu:this.tu;let i=e?e.mutatedKeys:this.mutatedKeys,a=s,u=!1;const l=this.query.limitType==="F"&&s.size===this.query.limit?s.last():null,d=this.query.limitType==="L"&&s.size===this.query.limit?s.first():null;if(t.inorderTraversal((f,g)=>{const _=s.get(f),S=es(this.query,g)?g:null,D=!!_&&this.mutatedKeys.has(_.key),k=!!S&&(S.hasLocalMutations||this.mutatedKeys.has(S.key)&&S.hasCommittedMutations);let M=!1;_&&S?_.data.isEqual(S.data)?D!==k&&(n.track({type:3,doc:S}),M=!0):this.su(_,S)||(n.track({type:2,doc:S}),M=!0,(l&&this.eu(S,l)>0||d&&this.eu(S,d)<0)&&(u=!0)):!_&&S?(n.track({type:0,doc:S}),M=!0):_&&!S&&(n.track({type:1,doc:_}),M=!0,(l||d)&&(u=!0)),M&&(S?(a=a.add(S),i=k?i.add(f):i.delete(f)):(a=a.delete(f),i=i.delete(f)))}),this.query.limit!==null)for(;a.size>this.query.limit;){const f=this.query.limitType==="F"?a.last():a.first();a=a.delete(f.key),i=i.delete(f.key),n.track({type:1,doc:f})}return{tu:a,iu:n,Ss:u,mutatedKeys:i}}su(t,e){return t.hasLocalMutations&&e.hasCommittedMutations&&!e.hasLocalMutations}applyChanges(t,e,n,s){const i=this.tu;this.tu=t.tu,this.mutatedKeys=t.mutatedKeys;const a=t.iu.ya();a.sort((f,g)=>function(S,D){const k=M=>{switch(M){case 0:return 1;case 2:case 3:return 2;case 1:return 0;default:return O(20277,{Vt:M})}};return k(S)-k(D)}(f.type,g.type)||this.eu(f.doc,g.doc)),this.ou(n),s=s??!1;const u=e&&!s?this._u():[],l=this.Ya.size===0&&this.current&&!s?1:0,d=l!==this.Xa;return this.Xa=l,a.length!==0||d?{snapshot:new Gn(this.query,t.tu,i,a,t.mutatedKeys,l===0,d,!1,!!n&&n.resumeToken.approximateByteSize()>0),au:u}:{au:u}}va(t){return this.current&&t==="Offline"?(this.current=!1,this.applyChanges({tu:this.tu,iu:new pl,mutatedKeys:this.mutatedKeys,Ss:!1},!1)):{au:[]}}uu(t){return!this.Za.has(t)&&!!this.tu.has(t)&&!this.tu.get(t).hasLocalMutations}ou(t){t&&(t.addedDocuments.forEach(e=>this.Za=this.Za.add(e)),t.modifiedDocuments.forEach(e=>{}),t.removedDocuments.forEach(e=>this.Za=this.Za.delete(e)),this.current=t.current)}_u(){if(!this.current)return[];const t=this.Ya;this.Ya=$(),this.tu.forEach(n=>{this.uu(n.key)&&(this.Ya=this.Ya.add(n.key))});const e=[];return t.forEach(n=>{this.Ya.has(n)||e.push(new Zd(n))}),this.Ya.forEach(n=>{t.has(n)||e.push(new Xd(n))}),e}cu(t){this.Za=t.ks,this.Ya=$();const e=this.ru(t.documents);return this.applyChanges(e,!0)}lu(){return Gn.fromInitialDocuments(this.query,this.tu,this.mutatedKeys,this.Xa===0,this.hasCachedResults)}}const Zn="SyncEngine";class Iy{constructor(t,e,n){this.query=t,this.targetId=e,this.view=n}}class Ey{constructor(t){this.key=t,this.hu=!1}}class Ty{constructor(t,e,n,s,i,a){this.localStore=t,this.remoteStore=e,this.eventManager=n,this.sharedClientState=s,this.currentUser=i,this.maxConcurrentLimboResolutions=a,this.Pu={},this.Tu=new se(u=>qh(u),Ei),this.Iu=new Map,this.Eu=new Set,this.Ru=new rt(N.comparator),this.Au=new Map,this.Vu=new va,this.du={},this.mu=new Map,this.fu=rn.ar(),this.onlineState="Unknown",this.gu=void 0}get isPrimaryClient(){return this.gu===!0}}async function wy(r,t,e=!0){const n=Ci(r);let s;const i=n.Tu.get(t);return i?(n.sharedClientState.addLocalQueryTarget(i.targetId),s=i.view.lu()):s=await tf(n,t,e,!0),s}async function vy(r,t){const e=Ci(r);await tf(e,t,!0,!1)}async function tf(r,t,e,n){const s=await si(r.localStore,Ft(t)),i=s.targetId,a=r.sharedClientState.addLocalQueryTarget(i,e);let u;return n&&(u=await La(r,t,i,a==="current",s.resumeToken)),r.isPrimaryClient&&e&&Vi(r.remoteStore,s),u}async function La(r,t,e,n,s){r.pu=(g,_,S)=>async function(k,M,G,q){let U=M.view.ru(G);U.Ss&&(U=await Qo(k.localStore,M.query,!1).then(({documents:E})=>M.view.ru(E,U)));const et=q&&q.targetChanges.get(M.targetId),Y=q&&q.targetMismatches.get(M.targetId)!=null,Q=M.view.applyChanges(U,k.isPrimaryClient,et,Y);return ta(k,M.targetId,Q.au),Q.snapshot}(r,g,_,S);const i=await Qo(r.localStore,t,!0),a=new yy(t,i.ks),u=a.ru(i.documents),l=ss.createSynthesizedTargetChangeForCurrentChange(e,n&&r.onlineState!=="Offline",s),d=a.applyChanges(u,r.isPrimaryClient,l);ta(r,e,d.au);const f=new Iy(t,e,a);return r.Tu.set(t,f),r.Iu.has(e)?r.Iu.get(e).push(t):r.Iu.set(e,[t]),d.snapshot}async function Ay(r,t,e){const n=F(r),s=n.Tu.get(t),i=n.Iu.get(s.targetId);if(i.length>1)return n.Iu.set(s.targetId,i.filter(a=>!Ei(a,t))),void n.Tu.delete(t);n.isPrimaryClient?(n.sharedClientState.removeLocalQueryTarget(s.targetId),n.sharedClientState.isActiveQueryTarget(s.targetId)||await zn(n.localStore,s.targetId,!1).then(()=>{n.sharedClientState.clearQueryState(s.targetId),e&&$n(n.remoteStore,s.targetId),Kn(n,s.targetId)}).catch(Pe)):(Kn(n,s.targetId),await zn(n.localStore,s.targetId,!0))}async function by(r,t){const e=F(r),n=e.Tu.get(t),s=e.Iu.get(n.targetId);e.isPrimaryClient&&s.length===1&&(e.sharedClientState.removeLocalQueryTarget(n.targetId),$n(e.remoteStore,n.targetId))}async function Ry(r,t,e){const n=ja(r);try{const s=await function(a,u){const l=F(a),d=X.now(),f=u.reduce((S,D)=>S.add(D.key),$());let g,_;return l.persistence.runTransaction("Locally write mutations","readwrite",S=>{let D=Ot(),k=$();return l.xs.getEntries(S,f).next(M=>{D=M,D.forEach((G,q)=>{q.isValidDocument()||(k=k.add(G))})}).next(()=>l.localDocuments.getOverlayedDocuments(S,D)).next(M=>{g=M;const G=[];for(const q of u){const U=Hp(q,g.get(q.key).overlayedDocument);U!=null&&G.push(new ie(q.key,U,Dh(U.value.mapValue),At.exists(!0)))}return l.mutationQueue.addMutationBatch(S,d,G,u)}).next(M=>{_=M;const G=M.applyToLocalDocumentSet(g,k);return l.documentOverlayCache.saveOverlays(S,M.batchId,G)})}).then(()=>({batchId:_.batchId,changes:Gh(g)}))}(n.localStore,t);n.sharedClientState.addPendingMutation(s.batchId),function(a,u,l){let d=a.du[a.currentUser.toKey()];d||(d=new rt(j)),d=d.insert(u,l),a.du[a.currentUser.toKey()]=d}(n,s.batchId,e),await De(n,s.changes),await Yn(n.remoteStore)}catch(s){const i=Na(s,"Failed to persist write");e.reject(i)}}async function ef(r,t){const e=F(r);try{const n=await z_(e.localStore,t);t.targetChanges.forEach((s,i)=>{const a=e.Au.get(i);a&&(L(s.addedDocuments.size+s.modifiedDocuments.size+s.removedDocuments.size<=1,22616),s.addedDocuments.size>0?a.hu=!0:s.modifiedDocuments.size>0?L(a.hu,14607):s.removedDocuments.size>0&&(L(a.hu,42227),a.hu=!1))}),await De(e,n,t)}catch(n){await Pe(n)}}function Il(r,t,e){const n=F(r);if(n.isPrimaryClient&&e===0||!n.isPrimaryClient&&e===1){const s=[];n.Tu.forEach((i,a)=>{const u=a.view.va(t);u.snapshot&&s.push(u.snapshot)}),function(a,u){const l=F(a);l.onlineState=u;let d=!1;l.queries.forEach((f,g)=>{for(const _ of g.ba)_.va(u)&&(d=!0)}),d&&Oa(l)}(n.eventManager,t),s.length&&n.Pu.J_(s),n.onlineState=t,n.isPrimaryClient&&n.sharedClientState.setOnlineState(t)}}async function Sy(r,t,e){const n=F(r);n.sharedClientState.updateQueryState(t,"rejected",e);const s=n.Au.get(t),i=s&&s.key;if(i){let a=new rt(N.comparator);a=a.insert(i,ct.newNoDocument(i,B.min()));const u=$().add(i),l=new rs(B.min(),new Map,new rt(j),a,u);await ef(n,l),n.Ru=n.Ru.remove(i),n.Au.delete(t),qa(n)}else await zn(n.localStore,t,!1).then(()=>Kn(n,t,e)).catch(Pe)}async function Py(r,t){const e=F(r),n=t.batch.batchId;try{const s=await j_(e.localStore,t);Ua(e,n,null),Ba(e,n),e.sharedClientState.updateMutationState(n,"acknowledged"),await De(e,s)}catch(s){await Pe(s)}}async function Vy(r,t,e){const n=F(r);try{const s=await function(a,u){const l=F(a);return l.persistence.runTransaction("Reject batch","readwrite-primary",d=>{let f;return l.mutationQueue.lookupMutationBatch(d,u).next(g=>(L(g!==null,37113),f=g.keys(),l.mutationQueue.removeMutationBatch(d,g))).next(()=>l.mutationQueue.performConsistencyCheck(d)).next(()=>l.documentOverlayCache.removeOverlaysForBatchId(d,f,u)).next(()=>l.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(d,f)).next(()=>l.localDocuments.getDocuments(d,f))})}(n.localStore,t);Ua(n,t,e),Ba(n,t),n.sharedClientState.updateMutationState(t,"rejected",e),await De(n,s)}catch(s){await Pe(s)}}function Ba(r,t){(r.mu.get(t)||[]).forEach(e=>{e.resolve()}),r.mu.delete(t)}function Ua(r,t,e){const n=F(r);let s=n.du[n.currentUser.toKey()];if(s){const i=s.get(t);i&&(e?i.reject(e):i.resolve(),s=s.remove(t)),n.du[n.currentUser.toKey()]=s}}function Kn(r,t,e=null){r.sharedClientState.removeLocalQueryTarget(t);for(const n of r.Iu.get(t))r.Tu.delete(n),e&&r.Pu.yu(n,e);r.Iu.delete(t),r.isPrimaryClient&&r.Vu.Gr(t).forEach(n=>{r.Vu.containsKey(n)||nf(r,n)})}function nf(r,t){r.Eu.delete(t.path.canonicalString());const e=r.Ru.get(t);e!==null&&($n(r.remoteStore,e),r.Ru=r.Ru.remove(t),r.Au.delete(e),qa(r))}function ta(r,t,e){for(const n of e)n instanceof Xd?(r.Vu.addReference(n.key,t),Cy(r,n)):n instanceof Zd?(V(Zn,"Document no longer in limbo: "+n.key),r.Vu.removeReference(n.key,t),r.Vu.containsKey(n.key)||nf(r,n.key)):O(19791,{wu:n})}function Cy(r,t){const e=t.key,n=e.path.canonicalString();r.Ru.get(e)||r.Eu.has(n)||(V(Zn,"New document in limbo: "+e),r.Eu.add(n),qa(r))}function qa(r){for(;r.Eu.size>0&&r.Ru.size<r.maxConcurrentLimboResolutions;){const t=r.Eu.values().next().value;r.Eu.delete(t);const e=new N(J.fromString(t)),n=r.fu.next();r.Au.set(n,new Ey(e)),r.Ru=r.Ru.insert(e,n),Vi(r.remoteStore,new Zt(Ft(ts(e.path)),n,"TargetPurposeLimboResolution",Ct.ce))}}async function De(r,t,e){const n=F(r),s=[],i=[],a=[];n.Tu.isEmpty()||(n.Tu.forEach((u,l)=>{a.push(n.pu(l,t,e).then(d=>{var f;if((d||e)&&n.isPrimaryClient){const g=d?!d.fromCache:(f=e==null?void 0:e.targetChanges.get(l.targetId))==null?void 0:f.current;n.sharedClientState.updateQueryState(l.targetId,g?"current":"not-current")}if(d){s.push(d);const g=Ra.Es(l.targetId,d);i.push(g)}}))}),await Promise.all(a),n.Pu.J_(s),await async function(l,d){const f=F(l);try{await f.persistence.runTransaction("notifyLocalViewChanges","readwrite",g=>v.forEach(d,_=>v.forEach(_.Ts,S=>f.persistence.referenceDelegate.addReference(g,_.targetId,S)).next(()=>v.forEach(_.Is,S=>f.persistence.referenceDelegate.removeReference(g,_.targetId,S)))))}catch(g){if(!Ve(g))throw g;V(Sa,"Failed to update sequence numbers: "+g)}for(const g of d){const _=g.targetId;if(!g.fromCache){const S=f.vs.get(_),D=S.snapshotVersion,k=S.withLastLimboFreeSnapshotVersion(D);f.vs=f.vs.insert(_,k)}}}(n.localStore,i))}async function Dy(r,t){const e=F(r);if(!e.currentUser.isEqual(t)){V(Zn,"User change. New user:",t.toKey());const n=await Md(e.localStore,t);e.currentUser=t,function(i,a){i.mu.forEach(u=>{u.forEach(l=>{l.reject(new C(P.CANCELLED,a))})}),i.mu.clear()}(e,"'waitForPendingWrites' promise is rejected due to a user change."),e.sharedClientState.handleUserChange(t,n.removedBatchIds,n.addedBatchIds),await De(e,n.Ns)}}function xy(r,t){const e=F(r),n=e.Au.get(t);if(n&&n.hu)return $().add(n.key);{let s=$();const i=e.Iu.get(t);if(!i)return s;for(const a of i){const u=e.Tu.get(a);s=s.unionWith(u.view.nu)}return s}}async function Ny(r,t){const e=F(r),n=await Qo(e.localStore,t.query,!0),s=t.view.cu(n);return e.isPrimaryClient&&ta(e,t.targetId,s.au),s}async function ky(r,t){const e=F(r);return Ld(e.localStore,t).then(n=>De(e,n))}async function My(r,t,e,n){const s=F(r),i=await function(u,l){const d=F(u),f=F(d.mutationQueue);return d.persistence.runTransaction("Lookup mutation documents","readonly",g=>f.Xn(g,l).next(_=>_?d.localDocuments.getDocuments(g,_):v.resolve(null)))}(s.localStore,t);i!==null?(e==="pending"?await Yn(s.remoteStore):e==="acknowledged"||e==="rejected"?(Ua(s,t,n||null),Ba(s,t),function(u,l){F(F(u).mutationQueue).nr(l)}(s.localStore,t)):O(6720,"Unknown batchState",{bu:e}),await De(s,i)):V(Zn,"Cannot apply mutation batch with id: "+t)}async function Oy(r,t){const e=F(r);if(Ci(e),ja(e),t===!0&&e.gu!==!0){const n=e.sharedClientState.getAllActiveQueryTargets(),s=await El(e,n.toArray());e.gu=!0,await Xo(e.remoteStore,!0);for(const i of s)Vi(e.remoteStore,i)}else if(t===!1&&e.gu!==!1){const n=[];let s=Promise.resolve();e.Iu.forEach((i,a)=>{e.sharedClientState.isLocalQueryTarget(a)?n.push(a):s=s.then(()=>(Kn(e,a),zn(e.localStore,a,!0))),$n(e.remoteStore,a)}),await s,await El(e,n),function(a){const u=F(a);u.Au.forEach((l,d)=>{$n(u.remoteStore,d)}),u.Vu.zr(),u.Au=new Map,u.Ru=new rt(N.comparator)}(e),e.gu=!1,await Xo(e.remoteStore,!1)}}async function El(r,t,e){const n=F(r),s=[],i=[];for(const a of t){let u;const l=n.Iu.get(a);if(l&&l.length!==0){u=await si(n.localStore,Ft(l[0]));for(const d of l){const f=n.Tu.get(d),g=await Ny(n,f);g.snapshot&&i.push(g.snapshot)}}else{const d=await Fd(n.localStore,a);u=await si(n.localStore,d),await La(n,rf(d),a,!1,u.resumeToken)}s.push(u)}return n.Pu.J_(i),s}function rf(r){return Bh(r.path,r.collectionGroup,r.orderBy,r.filters,r.limit,"F",r.startAt,r.endAt)}function Fy(r){return function(e){return F(F(e).persistence).hs()}(F(r).localStore)}async function Ly(r,t,e,n){const s=F(r);if(s.gu)return void V(Zn,"Ignoring unexpected query state notification.");const i=s.Iu.get(t);if(i&&i.length>0)switch(e){case"current":case"not-current":{const a=await Ld(s.localStore,jh(i[0])),u=rs.createSynthesizedRemoteEventForCurrentChange(t,e==="current",lt.EMPTY_BYTE_STRING);await De(s,a,u);break}case"rejected":await zn(s.localStore,t,!0),Kn(s,t,n);break;default:O(64155,e)}}async function By(r,t,e){const n=Ci(r);if(n.gu){for(const s of t){if(n.Iu.has(s)&&n.sharedClientState.isActiveQueryTarget(s)){V(Zn,"Adding an already active target "+s);continue}const i=await Fd(n.localStore,s),a=await si(n.localStore,i);await La(n,rf(i),a.targetId,!1,a.resumeToken),Vi(n.remoteStore,a)}for(const s of e)n.Iu.has(s)&&await zn(n.localStore,s,!1).then(()=>{$n(n.remoteStore,s),Kn(n,s)}).catch(Pe)}}function Ci(r){const t=F(r);return t.remoteStore.remoteSyncer.applyRemoteEvent=ef.bind(null,t),t.remoteStore.remoteSyncer.getRemoteKeysForTarget=xy.bind(null,t),t.remoteStore.remoteSyncer.rejectListen=Sy.bind(null,t),t.Pu.J_=py.bind(null,t.eventManager),t.Pu.yu=_y.bind(null,t.eventManager),t}function ja(r){const t=F(r);return t.remoteStore.remoteSyncer.applySuccessfulWrite=Py.bind(null,t),t.remoteStore.remoteSyncer.rejectFailedWrite=Vy.bind(null,t),t}class Qr{constructor(){this.kind="memory",this.synchronizeTabs=!1}async initialize(t){this.serializer=Si(t.databaseInfo.databaseId),this.sharedClientState=this.Du(t),this.persistence=this.Cu(t),await this.persistence.start(),this.localStore=this.vu(t),this.gcScheduler=this.Fu(t,this.localStore),this.indexBackfillerScheduler=this.Mu(t,this.localStore)}Fu(t,e){return null}Mu(t,e){return null}vu(t){return kd(this.persistence,new Nd,t.initialUser,this.serializer)}Cu(t){return new Aa(Ri.Vi,this.serializer)}Du(t){return new zd}async terminate(){var t,e;(t=this.gcScheduler)==null||t.stop(),(e=this.indexBackfillerScheduler)==null||e.stop(),this.sharedClientState.shutdown(),await this.persistence.shutdown()}}Qr.provider={build:()=>new Qr};class Uy extends Qr{constructor(t){super(),this.cacheSizeBytes=t}Fu(t,e){L(this.persistence.referenceDelegate instanceof ri,46915);const n=this.persistence.referenceDelegate.garbageCollector;return new Sd(n,t.asyncQueue,e)}Cu(t){const e=this.cacheSizeBytes!==void 0?wt.withCacheSize(this.cacheSizeBytes):wt.DEFAULT;return new Aa(n=>ri.Vi(n,e),this.serializer)}}class sf extends Qr{constructor(t,e,n){super(),this.xu=t,this.cacheSizeBytes=e,this.forceOwnership=n,this.kind="persistent",this.synchronizeTabs=!1}async initialize(t){await super.initialize(t),await this.xu.initialize(this,t),await ja(this.xu.syncEngine),await Yn(this.xu.remoteStore),await this.persistence.zi(()=>(this.gcScheduler&&!this.gcScheduler.started&&this.gcScheduler.start(),this.indexBackfillerScheduler&&!this.indexBackfillerScheduler.started&&this.indexBackfillerScheduler.start(),Promise.resolve()))}vu(t){return kd(this.persistence,new Nd,t.initialUser,this.serializer)}Fu(t,e){const n=this.persistence.referenceDelegate.garbageCollector;return new Sd(n,t.asyncQueue,e)}Mu(t,e){const n=new Wg(e,this.persistence);return new Hg(t.asyncQueue,n)}Cu(t){const e=xd(t.databaseInfo.databaseId,t.databaseInfo.persistenceKey),n=this.cacheSizeBytes!==void 0?wt.withCacheSize(this.cacheSizeBytes):wt.DEFAULT;return new ba(this.synchronizeTabs,e,t.clientId,n,t.asyncQueue,$d(),qs(),this.serializer,this.sharedClientState,!!this.forceOwnership)}Du(t){return new zd}}class qy extends sf{constructor(t,e){super(t,e,!1),this.xu=t,this.cacheSizeBytes=e,this.synchronizeTabs=!0}async initialize(t){await super.initialize(t);const e=this.xu.syncEngine;this.sharedClientState instanceof To&&(this.sharedClientState.syncEngine={So:My.bind(null,e),Do:Ly.bind(null,e),Co:By.bind(null,e),hs:Fy.bind(null,e),bo:ky.bind(null,e)},await this.sharedClientState.start()),await this.persistence.zi(async n=>{await Oy(this.xu.syncEngine,n),this.gcScheduler&&(n&&!this.gcScheduler.started?this.gcScheduler.start():n||this.gcScheduler.stop()),this.indexBackfillerScheduler&&(n&&!this.indexBackfillerScheduler.started?this.indexBackfillerScheduler.start():n||this.indexBackfillerScheduler.stop())})}Du(t){const e=$d();if(!To.v(e))throw new C(P.UNIMPLEMENTED,"IndexedDB persistence is only available on platforms that support LocalStorage.");const n=xd(t.databaseInfo.databaseId,t.databaseInfo.persistenceKey);return new To(e,t.asyncQueue,n,t.clientId,t.initialUser)}}class Jr{async initialize(t,e){this.localStore||(this.localStore=t.localStore,this.sharedClientState=t.sharedClientState,this.datastore=this.createDatastore(e),this.remoteStore=this.createRemoteStore(e),this.eventManager=this.createEventManager(e),this.syncEngine=this.createSyncEngine(e,!t.synchronizeTabs),this.sharedClientState.onlineStateHandler=n=>Il(this.syncEngine,n,1),this.remoteStore.remoteSyncer.handleCredentialChange=Dy.bind(null,this.syncEngine),await Xo(this.remoteStore,this.syncEngine.isPrimaryClient))}createEventManager(t){return function(){return new gy}()}createDatastore(t){const e=Si(t.databaseInfo.databaseId),n=J_(t.databaseInfo);return ey(t.authCredentials,t.appCheckCredentials,n,e)}createRemoteStore(t){return function(n,s,i,a,u){return new ry(n,s,i,a,u)}(this.localStore,this.datastore,t.asyncQueue,e=>Il(this.syncEngine,e,0),function(){return fl.v()?new fl:new K_}())}createSyncEngine(t,e){return function(s,i,a,u,l,d,f){const g=new Ty(s,i,a,u,l,d);return f&&(g.gu=!0),g}(this.localStore,this.remoteStore,this.eventManager,this.sharedClientState,t.initialUser,t.maxConcurrentLimboResolutions,e)}async terminate(){var t,e;await async function(s){const i=F(s);V(sn,"RemoteStore shutting down."),i.Ea.add(5),await is(i),i.Aa.shutdown(),i.Va.set("Unknown")}(this.remoteStore),(t=this.datastore)==null||t.terminate(),(e=this.eventManager)==null||e.terminate()}}Jr.provider={build:()=>new Jr};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class za{constructor(t){this.observer=t,this.muted=!1}next(t){this.muted||this.observer.next&&this.Ou(this.observer.next,t)}error(t){this.muted||(this.observer.error?this.Ou(this.observer.error,t):ht("Uncaught Error in snapshot listener:",t.toString()))}Nu(){this.muted=!0}Ou(t,e){setTimeout(()=>{this.muted||t(e)},0)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Se="FirestoreClient";class jy{constructor(t,e,n,s,i){this.authCredentials=t,this.appCheckCredentials=e,this.asyncQueue=n,this._databaseInfo=s,this.user=Tt.UNAUTHENTICATED,this.clientId=hi.newId(),this.authCredentialListener=()=>Promise.resolve(),this.appCheckCredentialListener=()=>Promise.resolve(),this._uninitializedComponentsProvider=i,this.authCredentials.start(n,async a=>{V(Se,"Received user=",a.uid),await this.authCredentialListener(a),this.user=a}),this.appCheckCredentials.start(n,a=>(V(Se,"Received new app check token=",a),this.appCheckCredentialListener(a,this.user)))}get configuration(){return{asyncQueue:this.asyncQueue,databaseInfo:this._databaseInfo,clientId:this.clientId,authCredentials:this.authCredentials,appCheckCredentials:this.appCheckCredentials,initialUser:this.user,maxConcurrentLimboResolutions:100}}setCredentialChangeListener(t){this.authCredentialListener=t}setAppCheckTokenChangeListener(t){this.appCheckCredentialListener=t}terminate(){this.asyncQueue.enterRestrictedMode();const t=new Wt;return this.asyncQueue.enqueueAndForgetEvenWhileRestricted(async()=>{try{this._onlineComponents&&await this._onlineComponents.terminate(),this._offlineComponents&&await this._offlineComponents.terminate(),this.authCredentials.shutdown(),this.appCheckCredentials.shutdown(),t.resolve()}catch(e){const n=Na(e,"Failed to shutdown persistence");t.reject(n)}}),t.promise}}async function vo(r,t){r.asyncQueue.verifyOperationInProgress(),V(Se,"Initializing OfflineComponentProvider");const e=r.configuration;await t.initialize(e);let n=e.initialUser;r.setCredentialChangeListener(async s=>{n.isEqual(s)||(await Md(t.localStore,s),n=s)}),t.persistence.setDatabaseDeletedListener(()=>r.terminate()),r._offlineComponents=t}async function Tl(r,t){r.asyncQueue.verifyOperationInProgress();const e=await zy(r);V(Se,"Initializing OnlineComponentProvider"),await t.initialize(e,r.configuration),r.setCredentialChangeListener(n=>gl(t.remoteStore,n)),r.setAppCheckTokenChangeListener((n,s)=>gl(t.remoteStore,s)),r._onlineComponents=t}async function zy(r){if(!r._offlineComponents)if(r._uninitializedComponentsProvider){V(Se,"Using user provided OfflineComponentProvider");try{await vo(r,r._uninitializedComponentsProvider._offline)}catch(t){const e=t;if(!function(s){return s.name==="FirebaseError"?s.code===P.FAILED_PRECONDITION||s.code===P.UNIMPLEMENTED:!(typeof DOMException<"u"&&s instanceof DOMException)||s.code===22||s.code===20||s.code===11}(e))throw e;Vn("Error using user provided cache. Falling back to memory cache: "+e),await vo(r,new Qr)}}else V(Se,"Using default OfflineComponentProvider"),await vo(r,new Uy(void 0));return r._offlineComponents}async function of(r){return r._onlineComponents||(r._uninitializedComponentsProvider?(V(Se,"Using user provided OnlineComponentProvider"),await Tl(r,r._uninitializedComponentsProvider._online)):(V(Se,"Using default OnlineComponentProvider"),await Tl(r,new Jr))),r._onlineComponents}function $y(r){return of(r).then(t=>t.syncEngine)}async function ui(r){const t=await of(r),e=t.eventManager;return e.onListen=wy.bind(null,t.syncEngine),e.onUnlisten=Ay.bind(null,t.syncEngine),e.onFirstRemoteStoreListen=vy.bind(null,t.syncEngine),e.onLastRemoteStoreUnlisten=by.bind(null,t.syncEngine),e}function Gy(r,t,e,n){const s=new za(n),i=new Fa(t,s,e);return r.asyncQueue.enqueueAndForget(async()=>ka(await ui(r),i)),()=>{s.Nu(),r.asyncQueue.enqueueAndForget(async()=>Ma(await ui(r),i))}}function Ky(r,t,e={}){const n=new Wt;return r.asyncQueue.enqueueAndForget(async()=>function(i,a,u,l,d){const f=new za({next:_=>{f.Nu(),a.enqueueAndForget(()=>Ma(i,g));const S=_.docs.has(u);!S&&_.fromCache?d.reject(new C(P.UNAVAILABLE,"Failed to get document because the client is offline.")):S&&_.fromCache&&l&&l.source==="server"?d.reject(new C(P.UNAVAILABLE,'Failed to get document from server. (However, this document does exist in the local cache. Run again without setting source to "server" to retrieve the cached document.)')):d.resolve(_)},error:_=>d.reject(_)}),g=new Fa(ts(u.path),f,{includeMetadataChanges:!0,Ka:!0});return ka(i,g)}(await ui(r),r.asyncQueue,t,e,n)),n.promise}function Hy(r,t,e={}){const n=new Wt;return r.asyncQueue.enqueueAndForget(async()=>function(i,a,u,l,d){const f=new za({next:_=>{f.Nu(),a.enqueueAndForget(()=>Ma(i,g)),_.fromCache&&l.source==="server"?d.reject(new C(P.UNAVAILABLE,'Failed to get documents from server. (However, these documents may exist in the local cache. Run again without setting source to "server" to retrieve the cached documents.)')):d.resolve(_)},error:_=>d.reject(_)}),g=new Fa(u,f,{includeMetadataChanges:!0,Ka:!0});return ka(i,g)}(await ui(r),r.asyncQueue,t,e,n)),n.promise}function Wy(r,t){const e=new Wt;return r.asyncQueue.enqueueAndForget(async()=>Ry(await $y(r),t,e)),e.promise}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function af(r){const t={};return r.timeoutSeconds!==void 0&&(t.timeoutSeconds=r.timeoutSeconds),t}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Qy="ComponentProvider",wl=new Map;function Jy(r,t,e,n,s){return new wp(r,t,e,s.host,s.ssl,s.experimentalForceLongPolling,s.experimentalAutoDetectLongPolling,af(s.experimentalLongPollingOptions),s.useFetchStreams,s.isUsingEmulator,n)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Yy="firestore.googleapis.com",vl=!0;class Al{constructor(t){if(t.host===void 0){if(t.ssl!==void 0)throw new C(P.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host=Yy,this.ssl=vl}else this.host=t.host,this.ssl=t.ssl??vl;if(this.isUsingEmulator=t.emulatorOptions!==void 0,this.credentials=t.credentials,this.ignoreUndefinedProperties=!!t.ignoreUndefinedProperties,this.localCache=t.localCache,t.cacheSizeBytes===void 0)this.cacheSizeBytes=wd;else{if(t.cacheSizeBytes!==-1&&t.cacheSizeBytes<Rd)throw new C(P.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=t.cacheSizeBytes}sh("experimentalForceLongPolling",t.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",t.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!t.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:t.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!t.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=af(t.experimentalLongPollingOptions??{}),function(n){if(n.timeoutSeconds!==void 0){if(isNaN(n.timeoutSeconds))throw new C(P.INVALID_ARGUMENT,`invalid long polling timeout: ${n.timeoutSeconds} (must not be NaN)`);if(n.timeoutSeconds<5)throw new C(P.INVALID_ARGUMENT,`invalid long polling timeout: ${n.timeoutSeconds} (minimum allowed value is 5)`);if(n.timeoutSeconds>30)throw new C(P.INVALID_ARGUMENT,`invalid long polling timeout: ${n.timeoutSeconds} (maximum allowed value is 30)`)}}(this.experimentalLongPollingOptions),this.useFetchStreams=!!t.useFetchStreams}isEqual(t){return this.host===t.host&&this.ssl===t.ssl&&this.credentials===t.credentials&&this.cacheSizeBytes===t.cacheSizeBytes&&this.experimentalForceLongPolling===t.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===t.experimentalAutoDetectLongPolling&&function(n,s){return n.timeoutSeconds===s.timeoutSeconds}(this.experimentalLongPollingOptions,t.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===t.ignoreUndefinedProperties&&this.useFetchStreams===t.useFetchStreams}}class $a{constructor(t,e,n,s){this._authCredentials=t,this._appCheckCredentials=e,this._databaseId=n,this._app=s,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new Al({}),this._settingsFrozen=!1,this._emulatorOptions={},this._terminateTask="notTerminated"}get app(){if(!this._app)throw new C(P.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!=="notTerminated"}_setSettings(t){if(this._settingsFrozen)throw new C(P.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new Al(t),this._emulatorOptions=t.emulatorOptions||{},t.credentials!==void 0&&(this._authCredentials=function(n){if(!n)return new eh;switch(n.type){case"firstParty":return new Lg(n.sessionIndex||"0",n.iamToken||null,n.authTokenFactory||null);case"provider":return n.client;default:throw new C(P.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}}(t.credentials))}_getSettings(){return this._settings}_getEmulatorOptions(){return this._emulatorOptions}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask==="notTerminated"&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){this._terminateTask==="notTerminated"?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return function(e){const n=wl.get(e);n&&(V(Qy,"Removing Datastore"),wl.delete(e),n.terminate())}(this),Promise.resolve()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Xt{constructor(t,e,n){this.converter=e,this._query=n,this.type="query",this.firestore=t}withConverter(t){return new Xt(this.firestore,t,this._query)}}class at{constructor(t,e,n){this.converter=e,this._key=n,this.type="document",this.firestore=t}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new te(this.firestore,this.converter,this._key.path.popLast())}withConverter(t){return new at(this.firestore,t,this._key)}toJSON(){return{type:at._jsonSchemaVersion,referencePath:this._key.toString()}}static fromJSON(t,e,n){if(Yr(e,at._jsonSchema))return new at(t,n||null,new N(J.fromString(e.referencePath)))}}at._jsonSchemaVersion="firestore/documentReference/1.0",at._jsonSchema={type:ft("string",at._jsonSchemaVersion),referencePath:ft("string")};class te extends Xt{constructor(t,e,n){super(t,e,ts(n)),this._path=n,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){const t=this._path.popLast();return t.isEmpty()?null:new at(this.firestore,null,new N(t))}withConverter(t){return new te(this.firestore,t,this._path)}}function Xy(r,t,...e){if(r=Qt(r),rh("collection","path",t),r instanceof $a){const n=J.fromString(t,...e);return mc(n),new te(r,null,n)}{if(!(r instanceof at||r instanceof te))throw new C(P.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const n=r._path.child(J.fromString(t,...e));return mc(n),new te(r.firestore,null,n)}}function uf(r,t,...e){if(r=Qt(r),arguments.length===1&&(t=hi.newId()),rh("doc","path",t),r instanceof $a){const n=J.fromString(t,...e);return fc(n),new at(r,null,new N(n))}{if(!(r instanceof at||r instanceof te))throw new C(P.INVALID_ARGUMENT,"Expected first argument to doc() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const n=r._path.child(J.fromString(t,...e));return fc(n),new at(r.firestore,r instanceof te?r.converter:null,new N(n))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const bl="AsyncQueue";class Rl{constructor(t=Promise.resolve()){this.Yu=[],this.ec=!1,this.tc=[],this.nc=null,this.rc=!1,this.sc=!1,this.oc=[],this.M_=new Gd(this,"async_queue_retry"),this._c=()=>{const n=qs();n&&V(bl,"Visibility state changed to "+n.visibilityState),this.M_.w_()},this.ac=t;const e=qs();e&&typeof e.addEventListener=="function"&&e.addEventListener("visibilitychange",this._c)}get isShuttingDown(){return this.ec}enqueueAndForget(t){this.enqueue(t)}enqueueAndForgetEvenWhileRestricted(t){this.uc(),this.cc(t)}enterRestrictedMode(t){if(!this.ec){this.ec=!0,this.sc=t||!1;const e=qs();e&&typeof e.removeEventListener=="function"&&e.removeEventListener("visibilitychange",this._c)}}enqueue(t){if(this.uc(),this.ec)return new Promise(()=>{});const e=new Wt;return this.cc(()=>this.ec&&this.sc?Promise.resolve():(t().then(e.resolve,e.reject),e.promise)).then(()=>e.promise)}enqueueRetryable(t){this.enqueueAndForget(()=>(this.Yu.push(t),this.lc()))}async lc(){if(this.Yu.length!==0){try{await this.Yu[0](),this.Yu.shift(),this.M_.reset()}catch(t){if(!Ve(t))throw t;V(bl,"Operation failed with retryable error: "+t)}this.Yu.length>0&&this.M_.p_(()=>this.lc())}}cc(t){const e=this.ac.then(()=>(this.rc=!0,t().catch(n=>{throw this.nc=n,this.rc=!1,ht("INTERNAL UNHANDLED ERROR: ",Sl(n)),n}).then(n=>(this.rc=!1,n))));return this.ac=e,e}enqueueAfterDelay(t,e,n){this.uc(),this.oc.indexOf(t)>-1&&(e=0);const s=xa.createAndSchedule(this,t,e,n,i=>this.hc(i));return this.tc.push(s),s}uc(){this.nc&&O(47125,{Pc:Sl(this.nc)})}verifyOperationInProgress(){}async Tc(){let t;do t=this.ac,await t;while(t!==this.ac)}Ic(t){for(const e of this.tc)if(e.timerId===t)return!0;return!1}Ec(t){return this.Tc().then(()=>{this.tc.sort((e,n)=>e.targetTimeMs-n.targetTimeMs);for(const e of this.tc)if(e.skipDelay(),t!=="all"&&e.timerId===t)break;return this.Tc()})}Rc(t){this.oc.push(t)}hc(t){const e=this.tc.indexOf(t);this.tc.splice(e,1)}}function Sl(r){let t=r.message||"";return r.stack&&(t=r.stack.includes(r.message)?r.stack:r.message+`
`+r.stack),t}class Yt extends $a{constructor(t,e,n,s){super(t,e,n,s),this.type="firestore",this._queue=new Rl,this._persistenceKey=(s==null?void 0:s.name)||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){const t=this._firestoreClient.terminate();this._queue=new Rl(t),this._firestoreClient=void 0,await t}}}function Zy(r,t,e){e||(e=Ws);const n=pg(r,"firestore");if(n.isInitialized(e)){const s=n.getImmediate({identifier:e}),i=n.getOptions(e);if(Pn(i,t))return s;throw new C(P.FAILED_PRECONDITION,"initializeFirestore() has already been called with different options. To avoid this error, call initializeFirestore() with the same options as when it was originally called, or call getFirestore() to return the already initialized instance.")}if(t.cacheSizeBytes!==void 0&&t.localCache!==void 0)throw new C(P.INVALID_ARGUMENT,"cache and cacheSizeBytes cannot be specified at the same time as cacheSizeBytes willbe deprecated. Instead, specify the cache size in the cache object");if(t.cacheSizeBytes!==void 0&&t.cacheSizeBytes!==-1&&t.cacheSizeBytes<Rd)throw new C(P.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");return t.host&&ea(t.host)&&hm(t.host),n.initialize({options:t,instanceIdentifier:e})}function os(r){if(r._terminated)throw new C(P.FAILED_PRECONDITION,"The client has already been terminated.");return r._firestoreClient||tI(r),r._firestoreClient}function tI(r){var n,s,i,a;const t=r._freezeSettings(),e=Jy(r._databaseId,((n=r._app)==null?void 0:n.options.appId)||"",r._persistenceKey,(s=r._app)==null?void 0:s.options.apiKey,t);r._componentsProvider||(i=t.localCache)!=null&&i._offlineComponentProvider&&((a=t.localCache)!=null&&a._onlineComponentProvider)&&(r._componentsProvider={_offline:t.localCache._offlineComponentProvider,_online:t.localCache._onlineComponentProvider}),r._firestoreClient=new jy(r._authCredentials,r._appCheckCredentials,r._queue,e,r._componentsProvider&&function(l){const d=l==null?void 0:l._online.build();return{_offline:l==null?void 0:l._offline.build(d),_online:d}}(r._componentsProvider))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Mt{constructor(t){this._byteString=t}static fromBase64String(t){try{return new Mt(lt.fromBase64String(t))}catch(e){throw new C(P.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+e)}}static fromUint8Array(t){return new Mt(lt.fromUint8Array(t))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(t){return this._byteString.isEqual(t._byteString)}toJSON(){return{type:Mt._jsonSchemaVersion,bytes:this.toBase64()}}static fromJSON(t){if(Yr(t,Mt._jsonSchema))return Mt.fromBase64String(t.bytes)}}Mt._jsonSchemaVersion="firestore/bytes/1.0",Mt._jsonSchema={type:ft("string",Mt._jsonSchemaVersion),bytes:ft("string")};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Di{constructor(...t){for(let e=0;e<t.length;++e)if(t[e].length===0)throw new C(P.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new ot(t)}isEqual(t){return this._internalPath.isEqual(t._internalPath)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xe{constructor(t){this._methodName=t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qt{constructor(t,e){if(!isFinite(t)||t<-90||t>90)throw new C(P.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+t);if(!isFinite(e)||e<-180||e>180)throw new C(P.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+e);this._lat=t,this._long=e}get latitude(){return this._lat}get longitude(){return this._long}isEqual(t){return this._lat===t._lat&&this._long===t._long}_compareTo(t){return j(this._lat,t._lat)||j(this._long,t._long)}toJSON(){return{latitude:this._lat,longitude:this._long,type:qt._jsonSchemaVersion}}static fromJSON(t){if(Yr(t,qt._jsonSchema))return new qt(t.latitude,t.longitude)}}qt._jsonSchemaVersion="firestore/geoPoint/1.0",qt._jsonSchema={type:ft("string",qt._jsonSchemaVersion),latitude:ft("number"),longitude:ft("number")};/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Bt{constructor(t){this._values=(t||[]).map(e=>e)}toArray(){return this._values.map(t=>t)}isEqual(t){return function(n,s){if(n.length!==s.length)return!1;for(let i=0;i<n.length;++i)if(n[i]!==s[i])return!1;return!0}(this._values,t._values)}toJSON(){return{type:Bt._jsonSchemaVersion,vectorValues:this._values}}static fromJSON(t){if(Yr(t,Bt._jsonSchema)){if(Array.isArray(t.vectorValues)&&t.vectorValues.every(e=>typeof e=="number"))return new Bt(t.vectorValues);throw new C(P.INVALID_ARGUMENT,"Expected 'vectorValues' field to be a number array")}}}Bt._jsonSchemaVersion="firestore/vectorValue/1.0",Bt._jsonSchema={type:ft("string",Bt._jsonSchemaVersion),vectorValues:ft("object")};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const eI=/^__.*__$/;class nI{constructor(t,e,n){this.data=t,this.fieldMask=e,this.fieldTransforms=n}toMutation(t,e){return this.fieldMask!==null?new ie(t,this.data,this.fieldMask,e,this.fieldTransforms):new Jn(t,this.data,e,this.fieldTransforms)}}class cf{constructor(t,e,n){this.data=t,this.fieldMask=e,this.fieldTransforms=n}toMutation(t,e){return new ie(t,this.data,this.fieldMask,e,this.fieldTransforms)}}function lf(r){switch(r){case 0:case 2:case 1:return!0;case 3:case 4:return!1;default:throw O(40011,{dataSource:r})}}class xi{constructor(t,e,n,s,i,a){this.settings=t,this.databaseId=e,this.serializer=n,this.ignoreUndefinedProperties=s,i===void 0&&this.validatePath(),this.fieldTransforms=i||[],this.fieldMask=a||[]}get path(){return this.settings.path}get dataSource(){return this.settings.dataSource}contextWith(t){return new xi({...this.settings,...t},this.databaseId,this.serializer,this.ignoreUndefinedProperties,this.fieldTransforms,this.fieldMask)}childContextForField(t){var s;const e=(s=this.path)==null?void 0:s.child(t),n=this.contextWith({path:e,arrayElement:!1});return n.validatePathSegment(t),n}childContextForFieldPath(t){var s;const e=(s=this.path)==null?void 0:s.child(t),n=this.contextWith({path:e,arrayElement:!1});return n.validatePath(),n}childContextForArray(t){return this.contextWith({path:void 0,arrayElement:!0})}createError(t){return ci(t,this.settings.methodName,this.settings.hasConverter||!1,this.path,this.settings.targetDoc)}contains(t){return this.fieldMask.find(e=>t.isPrefixOf(e))!==void 0||this.fieldTransforms.find(e=>t.isPrefixOf(e.field))!==void 0}validatePath(){if(this.path)for(let t=0;t<this.path.length;t++)this.validatePathSegment(this.path.get(t))}validatePathSegment(t){if(t.length===0)throw this.createError("Document fields must not be empty");if(lf(this.dataSource)&&eI.test(t))throw this.createError('Document fields cannot begin and end with "__"')}}class rI{constructor(t,e,n){this.databaseId=t,this.ignoreUndefinedProperties=e,this.serializer=n||Si(t)}createContext(t,e,n,s=!1){return new xi({dataSource:t,methodName:e,targetDoc:n,path:ot.emptyPath(),arrayElement:!1,hasConverter:s},this.databaseId,this.serializer,this.ignoreUndefinedProperties)}}function Ni(r){const t=r._freezeSettings(),e=Si(r._databaseId);return new rI(r._databaseId,!!t.ignoreUndefinedProperties,e)}function hf(r,t,e,n,s,i={}){const a=r.createContext(i.merge||i.mergeFields?2:0,t,e,s);Qa("Data must be an object, but it was:",a,n);const u=ff(n,a);let l,d;if(i.merge)l=new Dt(a.fieldMask),d=a.fieldTransforms;else if(i.mergeFields){const f=[];for(const g of i.mergeFields){const _=on(t,g,e);if(!a.contains(_))throw new C(P.INVALID_ARGUMENT,`Field '${_}' is specified in your field mask but missing from your input data.`);pf(f,_)||f.push(_)}l=new Dt(f),d=a.fieldTransforms.filter(g=>l.covers(g.field))}else l=null,d=a.fieldTransforms;return new nI(new vt(u),l,d)}class ki extends xe{_toFieldTransform(t){if(t.dataSource!==2)throw t.dataSource===1?t.createError(`${this._methodName}() can only appear at the top level of your update data`):t.createError(`${this._methodName}() cannot be used with set() unless you pass {merge:true}`);return t.fieldMask.push(t.path),null}isEqual(t){return t instanceof ki}}function df(r,t,e){return new xi({dataSource:3,targetDoc:t.settings.targetDoc,methodName:r._methodName,arrayElement:e},t.databaseId,t.serializer,t.ignoreUndefinedProperties)}class Ga extends xe{_toFieldTransform(t){return new ns(t.path,new Un)}isEqual(t){return t instanceof Ga}}class Ka extends xe{constructor(t,e){super(t),this.Ac=e}_toFieldTransform(t){const e=df(this,t,!0),n=this.Ac.map(i=>un(i,e)),s=new Ze(n);return new ns(t.path,s)}isEqual(t){return t instanceof Ka&&Pn(this.Ac,t.Ac)}}class Ha extends xe{constructor(t,e){super(t),this.Ac=e}_toFieldTransform(t){const e=df(this,t,!0),n=this.Ac.map(i=>un(i,e)),s=new tn(n);return new ns(t.path,s)}isEqual(t){return t instanceof Ha&&Pn(this.Ac,t.Ac)}}class Wa extends xe{constructor(t,e){super(t),this.Vc=e}_toFieldTransform(t){const e=new qn(t.serializer,Wh(t.serializer,this.Vc));return new ns(t.path,e)}isEqual(t){return t instanceof Wa&&this.Vc===t.Vc}}function sI(r,t,e,n){const s=r.createContext(1,t,e);Qa("Data must be an object, but it was:",s,n);const i=[],a=vt.empty();Ce(n,(l,d)=>{const f=gf(t,l,e);d=Qt(d);const g=s.childContextForFieldPath(f);if(d instanceof ki)i.push(f);else{const _=un(d,g);_!=null&&(i.push(f),a.set(f,_))}});const u=new Dt(i);return new cf(a,u,s.fieldTransforms)}function iI(r,t,e,n,s,i){const a=r.createContext(1,t,e),u=[on(t,n,e)],l=[s];if(i.length%2!=0)throw new C(P.INVALID_ARGUMENT,`Function ${t}() needs to be called with an even number of arguments that alternate between field names and values.`);for(let _=0;_<i.length;_+=2)u.push(on(t,i[_])),l.push(i[_+1]);const d=[],f=vt.empty();for(let _=u.length-1;_>=0;--_)if(!pf(d,u[_])){const S=u[_];let D=l[_];D=Qt(D);const k=a.childContextForFieldPath(S);if(D instanceof ki)d.push(S);else{const M=un(D,k);M!=null&&(d.push(S),f.set(S,M))}}const g=new Dt(d);return new cf(f,g,a.fieldTransforms)}function oI(r,t,e,n=!1){return un(e,r.createContext(n?4:3,t))}function un(r,t){if(mf(r=Qt(r)))return Qa("Unsupported field value:",t,r),ff(r,t);if(r instanceof xe)return function(n,s){if(!lf(s.dataSource))throw s.createError(`${n._methodName}() can only be used with update() and set()`);if(!s.path)throw s.createError(`${n._methodName}() is not currently supported inside arrays`);const i=n._toFieldTransform(s);i&&s.fieldTransforms.push(i)}(r,t),null;if(r===void 0&&t.ignoreUndefinedProperties)return null;if(t.path&&t.fieldMask.push(t.path),r instanceof Array){if(t.settings.arrayElement&&t.dataSource!==4)throw t.createError("Nested arrays are not supported");return function(n,s){const i=[];let a=0;for(const u of n){let l=un(u,s.childContextForArray(a));l==null&&(l={nullValue:"NULL_VALUE"}),i.push(l),a++}return{arrayValue:{values:i}}}(r,t)}return function(n,s){if((n=Qt(n))===null)return{nullValue:"NULL_VALUE"};if(typeof n=="number")return Wh(s.serializer,n);if(typeof n=="boolean")return{booleanValue:n};if(typeof n=="string")return{stringValue:n};if(n instanceof Date){const i=X.fromDate(n);return{timestampValue:jn(s.serializer,i)}}if(n instanceof X){const i=new X(n.seconds,1e3*Math.floor(n.nanoseconds/1e3));return{timestampValue:jn(s.serializer,i)}}if(n instanceof qt)return{geoPointValue:{latitude:n.latitude,longitude:n.longitude}};if(n instanceof Mt)return{bytesValue:id(s.serializer,n._byteString)};if(n instanceof at){const i=s.databaseId,a=n.firestore._databaseId;if(!a.isEqual(i))throw s.createError(`Document reference is for database ${a.projectId}/${a.database} but should be for database ${i.projectId}/${i.database}`);return{referenceValue:Ea(n.firestore._databaseId||s.databaseId,n._key.path)}}if(n instanceof Bt)return function(a,u){const l=a instanceof Bt?a.toArray():a;return{mapValue:{fields:{[ha]:{stringValue:da},[On]:{arrayValue:{values:l.map(f=>{if(typeof f!="number")throw u.createError("VectorValues must only contain numeric values.");return ga(u.serializer,f)})}}}}}}(n,s);if(pd(n))return n._toProto(s.serializer);throw s.createError(`Unsupported field value: ${di(n)}`)}(r,t)}function ff(r,t){const e={};return wh(r)?t.path&&t.path.length>0&&t.fieldMask.push(t.path):Ce(r,(n,s)=>{const i=un(s,t.childContextForField(n));i!=null&&(e[n]=i)}),{mapValue:{fields:e}}}function mf(r){return!(typeof r!="object"||r===null||r instanceof Array||r instanceof Date||r instanceof X||r instanceof qt||r instanceof Mt||r instanceof at||r instanceof xe||r instanceof Bt||pd(r))}function Qa(r,t,e){if(!mf(e)||!ih(e)){const n=di(e);throw n==="an object"?t.createError(r+" a custom object"):t.createError(r+" "+n)}}function on(r,t,e){if((t=Qt(t))instanceof Di)return t._internalPath;if(typeof t=="string")return gf(r,t);throw ci("Field path arguments must be of type string or ",r,!1,void 0,e)}const aI=new RegExp("[~\\*/\\[\\]]");function gf(r,t,e){if(t.search(aI)>=0)throw ci(`Invalid field path (${t}). Paths must not contain '~', '*', '/', '[', or ']'`,r,!1,void 0,e);try{return new Di(...t.split("."))._internalPath}catch{throw ci(`Invalid field path (${t}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,r,!1,void 0,e)}}function ci(r,t,e,n,s){const i=n&&!n.isEmpty(),a=s!==void 0;let u=`Function ${t}() called with invalid data`;e&&(u+=" (via `toFirestore()`)"),u+=". ";let l="";return(i||a)&&(l+=" (found",i&&(l+=` in field ${n}`),a&&(l+=` in document ${s}`),l+=")"),new C(P.INVALID_ARGUMENT,u+r+l)}function pf(r,t){return r.some(e=>e.isEqual(t))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _f{convertValue(t,e="none"){switch(Ae(t)){case 0:return null;case 1:return t.booleanValue;case 2:return it(t.integerValue||t.doubleValue);case 3:return this.convertTimestamp(t.timestampValue);case 4:return this.convertServerTimestamp(t,e);case 5:return t.stringValue;case 6:return this.convertBytes(re(t.bytesValue));case 7:return this.convertReference(t.referenceValue);case 8:return this.convertGeoPoint(t.geoPointValue);case 9:return this.convertArray(t.arrayValue,e);case 11:return this.convertObject(t.mapValue,e);case 10:return this.convertVectorValue(t.mapValue);default:throw O(62114,{value:t})}}convertObject(t,e){return this.convertObjectMap(t.fields,e)}convertObjectMap(t,e="none"){const n={};return Ce(t,(s,i)=>{n[s]=this.convertValue(i,e)}),n}convertVectorValue(t){var n,s,i;const e=(i=(s=(n=t.fields)==null?void 0:n[On].arrayValue)==null?void 0:s.values)==null?void 0:i.map(a=>it(a.doubleValue));return new Bt(e)}convertGeoPoint(t){return new qt(it(t.latitude),it(t.longitude))}convertArray(t,e){return(t.values||[]).map(n=>this.convertValue(n,e))}convertServerTimestamp(t,e){switch(e){case"previous":const n=yi(t);return n==null?null:this.convertValue(n,e);case"estimate":return this.convertTimestamp($r(t));default:return null}}convertTimestamp(t){const e=ne(t);return new X(e.seconds,e.nanos)}convertDocumentKey(t,e){const n=J.fromString(t);L(gd(n),9688,{name:t});const s=new ve(n.get(1),n.get(3)),i=new N(n.popFirst(5));return s.isEqual(e)||ht(`Document ${i} contains a document reference within a different database (${s.projectId}/${s.database}) which is not supported. It will be treated as a reference in the current database (${e.projectId}/${e.database}) instead.`),i}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ja extends _f{constructor(t){super(),this.firestore=t}convertBytes(t){return new Mt(t)}convertReference(t){const e=this.convertDocumentKey(t,this.firestore._databaseId);return new at(this.firestore,null,e)}}function uI(){return new Ga("serverTimestamp")}function cI(...r){return new Ka("arrayUnion",r)}function lI(...r){return new Ha("arrayRemove",r)}function hI(r){return new Wa("increment",r)}const Pl="@firebase/firestore",Vl="4.10.0";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Cl(r){return function(e,n){if(typeof e!="object"||e===null)return!1;const s=e;for(const i of n)if(i in s&&typeof s[i]=="function")return!0;return!1}(r,["next","error","complete"])}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class yf{constructor(t,e,n,s,i){this._firestore=t,this._userDataWriter=e,this._key=n,this._document=s,this._converter=i}get id(){return this._key.path.lastSegment()}get ref(){return new at(this._firestore,this._converter,this._key)}exists(){return this._document!==null}data(){if(this._document){if(this._converter){const t=new dI(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(t)}return this._userDataWriter.convertValue(this._document.data.value)}}_fieldsProto(){var t;return((t=this._document)==null?void 0:t.data.clone().value.mapValue.fields)??void 0}get(t){if(this._document){const e=this._document.data.field(on("DocumentSnapshot.get",t));if(e!==null)return this._userDataWriter.convertValue(e)}}}class dI extends yf{data(){return super.data()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function If(r){if(r.limitType==="L"&&r.explicitOrderBy.length===0)throw new C(P.UNIMPLEMENTED,"limitToLast() queries require specifying at least one orderBy() clause")}class Ya{}class Mi extends Ya{}function fI(r,t,...e){let n=[];t instanceof Ya&&n.push(t),n=n.concat(e),function(i){const a=i.filter(l=>l instanceof Oi).length,u=i.filter(l=>l instanceof as).length;if(a>1||a>0&&u>0)throw new C(P.INVALID_ARGUMENT,"InvalidQuery. When using composite filters, you cannot use more than one filter at the top level. Consider nesting the multiple filters within an `and(...)` statement. For example: change `query(query, where(...), or(...))` to `query(query, and(where(...), or(...)))`.")}(n);for(const s of n)r=s._apply(r);return r}class as extends Mi{constructor(t,e,n){super(),this._field=t,this._op=e,this._value=n,this.type="where"}static _create(t,e,n){return new as(t,e,n)}_apply(t){const e=this._parse(t);return Ef(t._query,e),new Xt(t.firestore,t.converter,qo(t._query,e))}_parse(t){const e=Ni(t.firestore);return function(i,a,u,l,d,f,g){let _;if(d.isKeyField()){if(f==="array-contains"||f==="array-contains-any")throw new C(P.INVALID_ARGUMENT,`Invalid Query. You can't perform '${f}' queries on documentId().`);if(f==="in"||f==="not-in"){xl(g,f);const D=[];for(const k of g)D.push(Dl(l,i,k));_={arrayValue:{values:D}}}else _=Dl(l,i,g)}else f!=="in"&&f!=="not-in"&&f!=="array-contains-any"||xl(g,f),_=oI(u,a,g,f==="in"||f==="not-in");return K.create(d,f,_)}(t._query,"where",e,t.firestore._databaseId,this._field,this._op,this._value)}}function mI(r,t,e){const n=t,s=on("where",r);return as._create(s,n,e)}class Oi extends Ya{constructor(t,e){super(),this.type=t,this._queryConstraints=e}static _create(t,e){return new Oi(t,e)}_parse(t){const e=this._queryConstraints.map(n=>n._parse(t)).filter(n=>n.getFilters().length>0);return e.length===1?e[0]:Z.create(e,this._getOperator())}_apply(t){const e=this._parse(t);return e.getFilters().length===0?t:(function(s,i){let a=s;const u=i.getFlattenedFilters();for(const l of u)Ef(a,l),a=qo(a,l)}(t._query,e),new Xt(t.firestore,t.converter,qo(t._query,e)))}_getQueryConstraints(){return this._queryConstraints}_getOperator(){return this.type==="and"?"and":"or"}}class Fi extends Mi{constructor(t,e){super(),this._field=t,this._direction=e,this.type="orderBy"}static _create(t,e){return new Fi(t,e)}_apply(t){const e=function(s,i,a){if(s.startAt!==null)throw new C(P.INVALID_ARGUMENT,"Invalid query. You must not call startAt() or startAfter() before calling orderBy().");if(s.endAt!==null)throw new C(P.INVALID_ARGUMENT,"Invalid query. You must not call endAt() or endBefore() before calling orderBy().");return new Wr(i,a)}(t._query,this._field,this._direction);return new Xt(t.firestore,t.converter,Op(t._query,e))}}function gI(r,t="asc"){const e=t,n=on("orderBy",r);return Fi._create(n,e)}class Li extends Mi{constructor(t,e,n){super(),this.type=t,this._limit=e,this._limitType=n}static _create(t,e,n){return new Li(t,e,n)}_apply(t){return new Xt(t.firestore,t.converter,Ys(t._query,this._limit,this._limitType))}}function pI(r){return $g("limit",r),Li._create("limit",r,"F")}function Dl(r,t,e){if(typeof(e=Qt(e))=="string"){if(e==="")throw new C(P.INVALID_ARGUMENT,"Invalid query. When querying with documentId(), you must provide a valid document ID, but it was an empty string.");if(!Uh(t)&&e.indexOf("/")!==-1)throw new C(P.INVALID_ARGUMENT,`Invalid query. When querying a collection by documentId(), you must provide a plain document ID, but '${e}' contains a '/' character.`);const n=t.path.child(J.fromString(e));if(!N.isDocumentKey(n))throw new C(P.INVALID_ARGUMENT,`Invalid query. When querying a collection group by documentId(), the value provided must result in a valid document path, but '${n}' is not because it has an odd number of segments (${n.length}).`);return Kr(r,new N(n))}if(e instanceof at)return Kr(r,e._key);throw new C(P.INVALID_ARGUMENT,`Invalid query. When querying with documentId(), you must provide a valid string or a DocumentReference, but it was: ${di(e)}.`)}function xl(r,t){if(!Array.isArray(r)||r.length===0)throw new C(P.INVALID_ARGUMENT,`Invalid Query. A non-empty array is required for '${t.toString()}' filters.`)}function Ef(r,t){const e=function(s,i){for(const a of s)for(const u of a.getFlattenedFilters())if(i.indexOf(u.op)>=0)return u.op;return null}(r.filters,function(s){switch(s){case"!=":return["!=","not-in"];case"array-contains-any":case"in":return["not-in"];case"not-in":return["array-contains-any","in","not-in","!="];default:return[]}}(t.op));if(e!==null)throw e===t.op?new C(P.INVALID_ARGUMENT,`Invalid query. You cannot use more than one '${t.op.toString()}' filter.`):new C(P.INVALID_ARGUMENT,`Invalid query. You cannot use '${t.op.toString()}' filters with '${e.toString()}' filters.`)}function Tf(r,t,e){let n;return n=r?e&&(e.merge||e.mergeFields)?r.toFirestore(t,e):r.toFirestore(t):t,n}class _I{constructor(t){let e;this.kind="persistent",t!=null&&t.tabManager?(t.tabManager._initialize(t),e=t.tabManager):(e=wf(void 0),e._initialize(t)),this._onlineComponentProvider=e._onlineComponentProvider,this._offlineComponentProvider=e._offlineComponentProvider}toJSON(){return{kind:this.kind}}}function yI(r){return new _I(r)}class II{constructor(t){this.forceOwnership=t,this.kind="persistentSingleTab"}toJSON(){return{kind:this.kind}}_initialize(t){this._onlineComponentProvider=Jr.provider,this._offlineComponentProvider={build:e=>new sf(e,t==null?void 0:t.cacheSizeBytes,this.forceOwnership)}}}class EI{constructor(){this.kind="PersistentMultipleTab"}toJSON(){return{kind:this.kind}}_initialize(t){this._onlineComponentProvider=Jr.provider,this._offlineComponentProvider={build:e=>new qy(e,t==null?void 0:t.cacheSizeBytes)}}}function wf(r){return new II(r==null?void 0:r.forceOwnership)}function TI(){return new EI}class vn{constructor(t,e){this.hasPendingWrites=t,this.fromCache=e}isEqual(t){return this.hasPendingWrites===t.hasPendingWrites&&this.fromCache===t.fromCache}}class Te extends yf{constructor(t,e,n,s,i,a){super(t,e,n,s,a),this._firestore=t,this._firestoreImpl=t,this.metadata=i}exists(){return super.exists()}data(t={}){if(this._document){if(this._converter){const e=new Or(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(e,t)}return this._userDataWriter.convertValue(this._document.data.value,t.serverTimestamps)}}get(t,e={}){if(this._document){const n=this._document.data.field(on("DocumentSnapshot.get",t));if(n!==null)return this._userDataWriter.convertValue(n,e.serverTimestamps)}}toJSON(){if(this.metadata.hasPendingWrites)throw new C(P.FAILED_PRECONDITION,"DocumentSnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const t=this._document,e={};return e.type=Te._jsonSchemaVersion,e.bundle="",e.bundleSource="DocumentSnapshot",e.bundleName=this._key.toString(),!t||!t.isValidDocument()||!t.isFoundDocument()?e:(this._userDataWriter.convertObjectMap(t.data.value.mapValue.fields,"previous"),e.bundle=(this._firestore,this.ref.path,"NOT SUPPORTED"),e)}}Te._jsonSchemaVersion="firestore/documentSnapshot/1.0",Te._jsonSchema={type:ft("string",Te._jsonSchemaVersion),bundleSource:ft("string","DocumentSnapshot"),bundleName:ft("string"),bundle:ft("string")};class Or extends Te{data(t={}){return super.data(t)}}class we{constructor(t,e,n,s){this._firestore=t,this._userDataWriter=e,this._snapshot=s,this.metadata=new vn(s.hasPendingWrites,s.fromCache),this.query=n}get docs(){const t=[];return this.forEach(e=>t.push(e)),t}get size(){return this._snapshot.docs.size}get empty(){return this.size===0}forEach(t,e){this._snapshot.docs.forEach(n=>{t.call(e,new Or(this._firestore,this._userDataWriter,n.key,n,new vn(this._snapshot.mutatedKeys.has(n.key),this._snapshot.fromCache),this.query.converter))})}docChanges(t={}){const e=!!t.includeMetadataChanges;if(e&&this._snapshot.excludesMetadataChanges)throw new C(P.INVALID_ARGUMENT,"To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");return this._cachedChanges&&this._cachedChangesIncludeMetadataChanges===e||(this._cachedChanges=function(s,i){if(s._snapshot.oldDocs.isEmpty()){let a=0;return s._snapshot.docChanges.map(u=>{const l=new Or(s._firestore,s._userDataWriter,u.doc.key,u.doc,new vn(s._snapshot.mutatedKeys.has(u.doc.key),s._snapshot.fromCache),s.query.converter);return u.doc,{type:"added",doc:l,oldIndex:-1,newIndex:a++}})}{let a=s._snapshot.oldDocs;return s._snapshot.docChanges.filter(u=>i||u.type!==3).map(u=>{const l=new Or(s._firestore,s._userDataWriter,u.doc.key,u.doc,new vn(s._snapshot.mutatedKeys.has(u.doc.key),s._snapshot.fromCache),s.query.converter);let d=-1,f=-1;return u.type!==0&&(d=a.indexOf(u.doc.key),a=a.delete(u.doc.key)),u.type!==1&&(a=a.add(u.doc),f=a.indexOf(u.doc.key)),{type:wI(u.type),doc:l,oldIndex:d,newIndex:f}})}}(this,e),this._cachedChangesIncludeMetadataChanges=e),this._cachedChanges}toJSON(){if(this.metadata.hasPendingWrites)throw new C(P.FAILED_PRECONDITION,"QuerySnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const t={};t.type=we._jsonSchemaVersion,t.bundleSource="QuerySnapshot",t.bundleName=hi.newId(),this._firestore._databaseId.database,this._firestore._databaseId.projectId;const e=[],n=[],s=[];return this.docs.forEach(i=>{i._document!==null&&(e.push(i._document),n.push(this._userDataWriter.convertObjectMap(i._document.data.value.mapValue.fields,"previous")),s.push(i.ref.path))}),t.bundle=(this._firestore,this.query._query,t.bundleName,"NOT SUPPORTED"),t}}function wI(r){switch(r){case 0:return"added";case 2:case 3:return"modified";case 1:return"removed";default:return O(61501,{type:r})}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */we._jsonSchemaVersion="firestore/querySnapshot/1.0",we._jsonSchema={type:ft("string",we._jsonSchemaVersion),bundleSource:ft("string","QuerySnapshot"),bundleName:ft("string"),bundle:ft("string")};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function vI(r){r=xt(r,at);const t=xt(r.firestore,Yt),e=os(t);return Ky(e,r._key).then(n=>vf(t,r,n))}function AI(r){r=xt(r,Xt);const t=xt(r.firestore,Yt),e=os(t),n=new Ja(t);return If(r._query),Hy(e,r._query).then(s=>new we(t,n,r,s))}function bI(r,t,e){r=xt(r,at);const n=xt(r.firestore,Yt),s=Tf(r.converter,t,e),i=Ni(n);return us(n,[hf(i,"setDoc",r._key,s,r.converter!==null,e).toMutation(r._key,At.none())])}function RI(r,t,e,...n){r=xt(r,at);const s=xt(r.firestore,Yt),i=Ni(s);let a;return a=typeof(t=Qt(t))=="string"||t instanceof Di?iI(i,"updateDoc",r._key,t,e,n):sI(i,"updateDoc",r._key,t),us(s,[a.toMutation(r._key,At.exists(!0))])}function SI(r){return us(xt(r.firestore,Yt),[new vi(r._key,At.none())])}function PI(r,t){const e=xt(r.firestore,Yt),n=uf(r),s=Tf(r.converter,t),i=Ni(r.firestore);return us(e,[hf(i,"addDoc",n._key,s,r.converter!==null,{}).toMutation(n._key,At.exists(!1))]).then(()=>n)}function VI(r,...t){var d,f,g;r=Qt(r);let e={includeMetadataChanges:!1,source:"default"},n=0;typeof t[n]!="object"||Cl(t[n])||(e=t[n++]);const s={includeMetadataChanges:e.includeMetadataChanges,source:e.source};if(Cl(t[n])){const _=t[n];t[n]=(d=_.next)==null?void 0:d.bind(_),t[n+1]=(f=_.error)==null?void 0:f.bind(_),t[n+2]=(g=_.complete)==null?void 0:g.bind(_)}let i,a,u;if(r instanceof at)a=xt(r.firestore,Yt),u=ts(r._key.path),i={next:_=>{t[n]&&t[n](vf(a,r,_))},error:t[n+1],complete:t[n+2]};else{const _=xt(r,Xt);a=xt(_.firestore,Yt),u=_._query;const S=new Ja(a);i={next:D=>{t[n]&&t[n](new we(a,S,_,D))},error:t[n+1],complete:t[n+2]},If(r._query)}const l=os(a);return Gy(l,u,s,i)}function us(r,t){const e=os(r);return Wy(e,t)}function vf(r,t,e){const n=e.docs.get(t._key),s=new Ja(r);return new Te(r,s,t._key,n,new vn(e.hasPendingWrites,e.fromCache),t.converter)}(function(t,e=!0){kg(Eg),zs(new Fr("firestore",(n,{instanceIdentifier:s,options:i})=>{const a=n.getProvider("app").getImmediate(),u=new Yt(new Og(n.getProvider("auth-internal")),new Bg(a,n.getProvider("app-check-internal")),vp(a,s),a);return i={useFetchStreams:e,...i},u._setSettings(i),u},"PUBLIC").setMultipleInstances(!0)),An(Pl,Vl,t),An(Pl,Vl,"esm2020")})();const zI=Object.freeze(Object.defineProperty({__proto__:null,AbstractUserDataWriter:_f,Bytes:Mt,CollectionReference:te,DocumentReference:at,DocumentSnapshot:Te,FieldPath:Di,FieldValue:xe,Firestore:Yt,FirestoreError:C,GeoPoint:qt,Query:Xt,QueryCompositeFilterConstraint:Oi,QueryConstraint:Mi,QueryDocumentSnapshot:Or,QueryFieldFilterConstraint:as,QueryLimitConstraint:Li,QueryOrderByConstraint:Fi,QuerySnapshot:we,SnapshotMetadata:vn,Timestamp:X,VectorValue:Bt,_AutoId:hi,_ByteString:lt,_DatabaseId:ve,_DocumentKey:N,_EmptyAuthCredentialsProvider:eh,_FieldPath:ot,_cast:xt,_logWarn:Vn,_validateIsNotUsedTogether:sh,addDoc:PI,arrayRemove:lI,arrayUnion:cI,collection:Xy,deleteDoc:SI,doc:uf,ensureFirestoreConfigured:os,executeWrite:us,getDoc:vI,getDocs:AI,increment:hI,initializeFirestore:Zy,limit:pI,onSnapshot:VI,orderBy:gI,persistentLocalCache:yI,persistentMultipleTabManager:TI,persistentSingleTabManager:wf,query:fI,serverTimestamp:uI,setDoc:bI,updateDoc:RI,where:mI},Symbol.toStringTag,{value:"Module"}));export{om as A,BI as B,Fr as C,ea as D,jl as E,Hn as F,qI as G,pg as H,CI as I,Pn as J,hm as K,zl as L,xI as M,FI as N,LI as O,kI as P,Tg as Q,Zy as R,Eg as S,X as T,yI as U,TI as V,zI as W,zs as _,PI as a,SI as b,Xy as c,uf as d,vI as e,bI as f,AI as g,lI as h,hI as i,cI as j,DI as k,pI as l,NI as m,OI as n,gI as o,MI as p,fI as q,An as r,uI as s,_g as t,RI as u,Qt as v,mI as w,Sn as x,UI as y,W as z};
