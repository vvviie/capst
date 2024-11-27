"use strict";exports.id=1552,exports.ids=[1552],exports.modules={11552:(e,t,n)=>{n.d(t,{oq:()=>ei,Jt:()=>eo,cF:()=>el,aF:()=>es,iH:()=>ea,KV:()=>er});var r,s,o=n(33497),i=n(2377),a=n(83122),l=n(77752);/**
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
 */let u="firebasestorage.googleapis.com",c="storageBucket";/**
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
 */class h extends i.ZR{constructor(e,t,n=0){super(d(e),`Firebase Storage: ${t} (${d(e)})`),this.status_=n,this.customData={serverResponse:null},this._baseMessage=this.message,Object.setPrototypeOf(this,h.prototype)}get status(){return this.status_}set status(e){this.status_=e}_codeEquals(e){return d(e)===this.code}get serverResponse(){return this.customData.serverResponse}set serverResponse(e){this.customData.serverResponse=e,this.customData.serverResponse?this.message=`${this._baseMessage}
${this.customData.serverResponse}`:this.message=this._baseMessage}}function d(e){return"storage/"+e}function p(){return new h(r.UNKNOWN,"An unknown error occurred, please check the error payload for server response.")}function f(e){return new h(r.INVALID_ARGUMENT,e)}function _(){return new h(r.APP_DELETED,"The Firebase app was deleted.")}function g(e,t){return new h(r.INVALID_FORMAT,"String does not match format '"+e+"': "+t)}function m(e){throw new h(r.INTERNAL_ERROR,"Internal error: "+e)}!function(e){e.UNKNOWN="unknown",e.OBJECT_NOT_FOUND="object-not-found",e.BUCKET_NOT_FOUND="bucket-not-found",e.PROJECT_NOT_FOUND="project-not-found",e.QUOTA_EXCEEDED="quota-exceeded",e.UNAUTHENTICATED="unauthenticated",e.UNAUTHORIZED="unauthorized",e.UNAUTHORIZED_APP="unauthorized-app",e.RETRY_LIMIT_EXCEEDED="retry-limit-exceeded",e.INVALID_CHECKSUM="invalid-checksum",e.CANCELED="canceled",e.INVALID_EVENT_NAME="invalid-event-name",e.INVALID_URL="invalid-url",e.INVALID_DEFAULT_BUCKET="invalid-default-bucket",e.NO_DEFAULT_BUCKET="no-default-bucket",e.CANNOT_SLICE_BLOB="cannot-slice-blob",e.SERVER_FILE_WRONG_SIZE="server-file-wrong-size",e.NO_DOWNLOAD_URL="no-download-url",e.INVALID_ARGUMENT="invalid-argument",e.INVALID_ARGUMENT_COUNT="invalid-argument-count",e.APP_DELETED="app-deleted",e.INVALID_ROOT_OPERATION="invalid-root-operation",e.INVALID_FORMAT="invalid-format",e.INTERNAL_ERROR="internal-error",e.UNSUPPORTED_ENVIRONMENT="unsupported-environment"}(r||(r={}));/**
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
 */class R{constructor(e,t){this.bucket=e,this.path_=t}get path(){return this.path_}get isRoot(){return 0===this.path.length}fullServerUrl(){let e=encodeURIComponent;return"/b/"+e(this.bucket)+"/o/"+e(this.path)}bucketOnlyServerUrl(){return"/b/"+encodeURIComponent(this.bucket)+"/o"}static makeFromBucketSpec(e,t){let n;try{n=R.makeFromUrl(e,t)}catch(t){return new R(e,"")}if(""===n.path)return n;throw new h(r.INVALID_DEFAULT_BUCKET,"Invalid default bucket '"+e+"'.")}static makeFromUrl(e,t){let n=null,s="([A-Za-z0-9.\\-_]+)",o=RegExp("^gs://"+s+"(/(.*))?$","i");function i(e){e.path_=decodeURIComponent(e.path)}let a=t.replace(/[.]/g,"\\."),l=[{regex:o,indices:{bucket:1,path:3},postModify:function(e){"/"===e.path.charAt(e.path.length-1)&&(e.path_=e.path_.slice(0,-1))}},{regex:RegExp(`^https?://${a}/v[A-Za-z0-9_]+/b/${s}/o(/([^?#]*).*)?$`,"i"),indices:{bucket:1,path:3},postModify:i},{regex:RegExp(`^https?://${t===u?"(?:storage.googleapis.com|storage.cloud.google.com)":t}/${s}/([^?#]*)`,"i"),indices:{bucket:1,path:2},postModify:i}];for(let t=0;t<l.length;t++){let r=l[t],s=r.regex.exec(e);if(s){let e=s[r.indices.bucket],t=s[r.indices.path];t||(t=""),n=new R(e,t),r.postModify(n);break}}if(null==n)throw new h(r.INVALID_URL,"Invalid URL '"+e+"'.");return n}}class b{constructor(e){this.promise_=Promise.reject(e)}getPromise(){return this.promise_}cancel(e=!1){}}function w(e){return"string"==typeof e||e instanceof String}function T(e){return E()&&e instanceof Blob}function E(){return"undefined"!=typeof Blob}function k(e,t,n,r){if(r<t)throw f(`Invalid value for '${e}'. Expected ${t} or greater.`);if(r>n)throw f(`Invalid value for '${e}'. Expected ${n} or less.`)}/**
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
 */function y(e,t,n){let r=t;return null==n&&(r=`https://${t}`),`${n}://${r}/v0${e}`}function A(e){let t=encodeURIComponent,n="?";for(let r in e)e.hasOwnProperty(r)&&(n=n+(t(r)+"=")+t(e[r])+"&");return n.slice(0,-1)}!function(e){e[e.NO_ERROR=0]="NO_ERROR",e[e.NETWORK_ERROR=1]="NETWORK_ERROR",e[e.ABORT=2]="ABORT"}(s||(s={}));/**
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
 */class O{constructor(e,t,n,r,s,o,i,a,l,u,c,h=!0){this.url_=e,this.method_=t,this.headers_=n,this.body_=r,this.successCodes_=s,this.additionalRetryCodes_=o,this.callback_=i,this.errorCallback_=a,this.timeout_=l,this.progressCallback_=u,this.connectionFactory_=c,this.retry=h,this.pendingConnection_=null,this.backoffId_=null,this.canceled_=!1,this.appDelete_=!1,this.promise_=new Promise((e,t)=>{this.resolve_=e,this.reject_=t,this.start_()})}start_(){let e=(e,t)=>{let n=this.resolve_,s=this.reject_,o=t.connection;if(t.wasSuccessCode)try{let e=this.callback_(o,o.getResponse());void 0!==e?n(e):n()}catch(e){s(e)}else if(null!==o){let e=p();e.serverResponse=o.getErrorText(),s(this.errorCallback_?this.errorCallback_(o,e):e)}else s(t.canceled?this.appDelete_?_():new h(r.CANCELED,"User canceled the upload/download."):new h(r.RETRY_LIMIT_EXCEEDED,"Max retry time for operation exceeded, please try again."))};this.canceled_?e(!1,new U(!1,null,!0)):this.backoffId_=/**
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
 */function(e,t,n){let r=1,s=null,o=null,i=!1,a=0,l=!1;function u(...e){l||(l=!0,t.apply(null,e))}function c(t){s=setTimeout(()=>{s=null,e(d,2===a)},t)}function h(){o&&clearTimeout(o)}function d(e,...t){let n;if(l){h();return}if(e||2===a||i){h(),u.call(null,e,...t);return}r<64&&(r*=2),1===a?(a=2,n=0):n=(r+Math.random())*1e3,c(n)}let p=!1;function f(e){!p&&(p=!0,h(),!l&&(null!==s?(e||(a=2),clearTimeout(s),c(0)):e||(a=1)))}return c(0),o=setTimeout(()=>{i=!0,f(!0)},n),f}((e,t)=>{if(t){e(!1,new U(!1,null,!0));return}let n=this.connectionFactory_();this.pendingConnection_=n;let r=e=>{let t=e.loaded,n=e.lengthComputable?e.total:-1;null!==this.progressCallback_&&this.progressCallback_(t,n)};null!==this.progressCallback_&&n.addUploadProgressListener(r),n.send(this.url_,this.method_,this.body_,this.headers_).then(()=>{null!==this.progressCallback_&&n.removeUploadProgressListener(r),this.pendingConnection_=null;let t=n.getErrorCode()===s.NO_ERROR,o=n.getStatus();if(!t||/**
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
 */function(e,t){let n=e>=500&&e<600,r=-1!==[408,429].indexOf(e),s=-1!==t.indexOf(e);return n||r||s}(o,this.additionalRetryCodes_)&&this.retry){e(!1,new U(!1,null,n.getErrorCode()===s.ABORT));return}e(!0,new U(-1!==this.successCodes_.indexOf(o),n))})},e,this.timeout_)}getPromise(){return this.promise_}cancel(e){this.canceled_=!0,this.appDelete_=e||!1,null!==this.backoffId_&&(0,this.backoffId_)(!1),null!==this.pendingConnection_&&this.pendingConnection_.abort()}}class U{constructor(e,t,n){this.wasSuccessCode=e,this.connection=t,this.canceled=!!n}}function I(...e){let t="undefined"!=typeof BlobBuilder?BlobBuilder:"undefined"!=typeof WebKitBlobBuilder?WebKitBlobBuilder:void 0;if(void 0!==t){let n=new t;for(let t=0;t<e.length;t++)n.append(e[t]);return n.getBlob()}if(E())return new Blob(e);throw new h(r.UNSUPPORTED_ENVIRONMENT,"This browser doesn't seem to support creating Blobs")}/**
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
 */let C={RAW:"raw",BASE64:"base64",BASE64URL:"base64url",DATA_URL:"data_url"};class v{constructor(e,t){this.data=e,this.contentType=t||null}}function N(e){let t=[];for(let n=0;n<e.length;n++){let r=e.charCodeAt(n);r<=127?t.push(r):r<=2047?t.push(192|r>>6,128|63&r):(64512&r)==55296?n<e.length-1&&(64512&e.charCodeAt(n+1))==56320?(r=65536|(1023&r)<<10|1023&e.charCodeAt(++n),t.push(240|r>>18,128|r>>12&63,128|r>>6&63,128|63&r)):t.push(239,191,189):(64512&r)==56320?t.push(239,191,189):t.push(224|r>>12,128|r>>6&63,128|63&r)}return new Uint8Array(t)}function x(e,t){let n;switch(e){case C.BASE64:{let n=-1!==t.indexOf("-"),r=-1!==t.indexOf("_");if(n||r)throw g(e,"Invalid character '"+(n?"-":"_")+"' found: is it base64url encoded?");break}case C.BASE64URL:{let n=-1!==t.indexOf("+"),r=-1!==t.indexOf("/");if(n||r)throw g(e,"Invalid character '"+(n?"+":"/")+"' found: is it base64 encoded?");t=t.replace(/-/g,"+").replace(/_/g,"/")}}try{n=/**
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
 */function(e){if(/[^-A-Za-z0-9+/=]/.test(e))throw g("base64","Invalid character found");return Buffer.from(e,"base64").toString("binary")}(t)}catch(t){if(t.message.includes("polyfill"))throw t;throw g(e,"Invalid character found")}let r=new Uint8Array(n.length);for(let e=0;e<n.length;e++)r[e]=n.charCodeAt(e);return r}class D{constructor(e){this.base64=!1,this.contentType=null;let t=e.match(/^data:([^,]+)?,/);if(null===t)throw g(C.DATA_URL,"Must be formatted 'data:[<mediatype>][;base64],<data>");let n=t[1]||null;null!=n&&(this.base64=function(e,t){return e.length>=t.length&&e.substring(e.length-t.length)===t}(n,";base64"),this.contentType=this.base64?n.substring(0,n.length-7):n),this.rest=e.substring(e.indexOf(",")+1)}}/**
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
 */class S{constructor(e,t){let n=0,r="";T(e)?(this.data_=e,n=e.size,r=e.type):e instanceof ArrayBuffer?(t?this.data_=new Uint8Array(e):(this.data_=new Uint8Array(e.byteLength),this.data_.set(new Uint8Array(e))),n=this.data_.length):e instanceof Uint8Array&&(t?this.data_=e:(this.data_=new Uint8Array(e.length),this.data_.set(e)),n=e.length),this.size_=n,this.type_=r}size(){return this.size_}type(){return this.type_}slice(e,t){if(!T(this.data_))return new S(new Uint8Array(this.data_.buffer,e,t-e),!0);{var n;let r=(n=this.data_).webkitSlice?n.webkitSlice(e,t):n.mozSlice?n.mozSlice(e,t):n.slice?n.slice(e,t):null;return null===r?null:new S(r)}}static getBlob(...e){if(E()){let t=e.map(e=>e instanceof S?e.data_:e);return new S(I.apply(null,t))}{let t=e.map(e=>w(e)?function(e,t){switch(e){case C.RAW:return new v(N(t));case C.BASE64:case C.BASE64URL:return new v(x(e,t));case C.DATA_URL:return new v(function(e){let t=new D(e);return t.base64?x(C.BASE64,t.rest):function(e){let t;try{t=decodeURIComponent(e)}catch(e){throw g(C.DATA_URL,"Malformed data URL.")}return N(t)}(t.rest)}(t),new D(t).contentType)}throw p()}(C.RAW,e).data:e.data_),n=0;t.forEach(e=>{n+=e.byteLength});let r=new Uint8Array(n),s=0;return t.forEach(e=>{for(let t=0;t<e.length;t++)r[s++]=e[t]}),new S(r,!0)}}uploadData(){return this.data_}}/**
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
 */function P(e){var t;let n;try{n=JSON.parse(e)}catch(e){return null}return"object"!=typeof(t=n)||Array.isArray(t)?null:n}function L(e){let t=e.lastIndexOf("/",e.length-2);return -1===t?e:e.slice(t+1)}/**
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
 */function B(e,t){return t}class F{constructor(e,t,n,r){this.server=e,this.local=t||e,this.writable=!!n,this.xform=r||B}}let M=null;function V(){if(M)return M;let e=[];e.push(new F("bucket")),e.push(new F("generation")),e.push(new F("metageneration")),e.push(new F("name","fullPath",!0));let t=new F("name");t.xform=function(e,t){return!w(t)||t.length<2?t:L(t)},e.push(t);let n=new F("size");return n.xform=function(e,t){return void 0!==t?Number(t):t},e.push(n),e.push(new F("timeCreated")),e.push(new F("updated")),e.push(new F("md5Hash",null,!0)),e.push(new F("cacheControl",null,!0)),e.push(new F("contentDisposition",null,!0)),e.push(new F("contentEncoding",null,!0)),e.push(new F("contentLanguage",null,!0)),e.push(new F("contentType",null,!0)),e.push(new F("metadata","customMetadata",!0)),M=e}function $(e,t,n){let r=P(t);return null===r?null:function(e,t,n){let r={};r.type="file";let s=n.length;for(let e=0;e<s;e++){let s=n[e];r[s.local]=s.xform(r,t[s.server])}return Object.defineProperty(r,"ref",{get:function(){let t=new R(r.bucket,r.fullPath);return e._makeStorageReference(t)}}),r}(e,r,n)}/**
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
 */let q="prefixes",z="items";class W{constructor(e,t,n,r){this.url=e,this.method=t,this.handler=n,this.timeout=r,this.urlParams={},this.headers={},this.body=null,this.errorHandler=null,this.progressCallback=null,this.successCodes=[200],this.additionalRetryCodes=[]}}/**
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
 */function j(e){if(!e)throw p()}function H(e){return function(t,n){var s,o;let i;return 401===t.getStatus()?i=t.getErrorText().includes("Firebase App Check token is invalid")?new h(r.UNAUTHORIZED_APP,"This app does not have permission to access Firebase Storage on this project."):new h(r.UNAUTHENTICATED,"User is not authenticated, please authenticate using Firebase Authentication and try again."):402===t.getStatus()?(s=e.bucket,i=new h(r.QUOTA_EXCEEDED,"Quota for bucket '"+s+"' exceeded, please view quota on https://firebase.google.com/pricing/.")):403===t.getStatus()?(o=e.path,i=new h(r.UNAUTHORIZED,"User does not have permission to access '"+o+"'.")):i=n,i.status=t.getStatus(),i.serverResponse=n.serverResponse,i}}function K(e){let t=H(e);return function(n,s){let o=t(n,s);if(404===n.getStatus()){var i;i=e.path,o=new h(r.OBJECT_NOT_FOUND,"Object '"+i+"' does not exist.")}return o.serverResponse=s.serverResponse,o}}let X={RUNNING:"running",PAUSED:"paused",SUCCESS:"success",CANCELED:"canceled",ERROR:"error"};class Z{constructor(){this.errorText_="",this.sent_=!1,this.fetch_=a.fetch,this.errorCode_=s.NO_ERROR}async send(e,t,n,r){if(this.sent_)throw m("cannot .send() more than once");this.sent_=!0;try{let o=await this.fetch_(e,{method:t,headers:r||{},body:n});this.headers_=o.headers,this.statusCode_=o.status,this.errorCode_=s.NO_ERROR,this.body_=await o.arrayBuffer()}catch(e){this.errorText_=null==e?void 0:e.message,this.statusCode_=0,this.errorCode_=s.NETWORK_ERROR}}getErrorCode(){if(void 0===this.errorCode_)throw m("cannot .getErrorCode() before receiving response");return this.errorCode_}getStatus(){if(void 0===this.statusCode_)throw m("cannot .getStatus() before receiving response");return this.statusCode_}getErrorText(){return this.errorText_}abort(){}getResponseHeader(e){if(!this.headers_)throw m("cannot .getResponseHeader() before receiving response");return this.headers_.get(e)}addUploadProgressListener(e){}removeUploadProgressListener(e){}}class G extends Z{getResponse(){if(!this.body_)throw m("cannot .getResponse() before receiving response");return Buffer.from(this.body_).toString("utf-8")}}function J(){return new G}/**
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
 */class Y{constructor(e,t){this._service=e,t instanceof R?this._location=t:this._location=R.makeFromUrl(t,e.host)}toString(){return"gs://"+this._location.bucket+"/"+this._location.path}_newRef(e,t){return new Y(e,t)}get root(){let e=new R(this._location.bucket,"");return this._newRef(this._service,e)}get bucket(){return this._location.bucket}get fullPath(){return this._location.path}get name(){return L(this._location.path)}get storage(){return this._service}get parent(){let e=/**
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
 */function(e){if(0===e.length)return null;let t=e.lastIndexOf("/");return -1===t?"":e.slice(0,t)}(this._location.path);if(null===e)return null;let t=new R(this._location.bucket,e);return new Y(this._service,t)}_throwIfRoot(e){if(""===this._location.path)throw new h(r.INVALID_ROOT_OPERATION,"The operation '"+e+"' cannot be performed on a root reference, create a non-root reference using child, such as .child('file.png').")}}async function Q(e,t,n){let r=await function(e,t){null!=t&&"number"==typeof t.maxResults&&k("options.maxResults",1,1e3,t.maxResults);let n=t||{},r=function(e,t,n,r,s){var o;let i={};t.isRoot?i.prefix="":i.prefix=t.path+"/",i.delimiter="/",r&&(i.pageToken=r),s&&(i.maxResults=s);let a=y(t.bucketOnlyServerUrl(),e.host,e._protocol),l=e.maxOperationRetryTime,u=new W(a,"GET",(o=t.bucket,function(t,n){let r=function(e,t,n){let r=P(n);return null===r?null:function(e,t,n){let r={prefixes:[],items:[],nextPageToken:n.nextPageToken};if(n[q])for(let s of n[q]){let n=s.replace(/\/$/,""),o=e._makeStorageReference(new R(t,n));r.prefixes.push(o)}if(n[z])for(let s of n[z]){let n=e._makeStorageReference(new R(t,s.name));r.items.push(n)}return r}(e,t,r)}(e,o,n);return j(null!==r),r}),l);return u.urlParams=i,u.errorHandler=H(t),u}(e.storage,e._location,"/",n.pageToken,n.maxResults);return e.storage.makeRequestWithTokens(r,J)}(e,{pageToken:n});t.prefixes.push(...r.prefixes),t.items.push(...r.items),null!=r.nextPageToken&&await Q(e,t,r.nextPageToken)}function ee(e,t){let n=null==t?void 0:t[c];return null==n?null:R.makeFromBucketSpec(n,e)}class et{constructor(e,t,n,r,s){this.app=e,this._authProvider=t,this._appCheckProvider=n,this._url=r,this._firebaseVersion=s,this._bucket=null,this._host=u,this._protocol="https",this._appId=null,this._deleted=!1,this._maxOperationRetryTime=12e4,this._maxUploadRetryTime=6e5,this._requests=new Set,null!=r?this._bucket=R.makeFromBucketSpec(r,this._host):this._bucket=ee(this._host,this.app.options)}get host(){return this._host}set host(e){this._host=e,null!=this._url?this._bucket=R.makeFromBucketSpec(this._url,e):this._bucket=ee(e,this.app.options)}get maxUploadRetryTime(){return this._maxUploadRetryTime}set maxUploadRetryTime(e){k("time",0,Number.POSITIVE_INFINITY,e),this._maxUploadRetryTime=e}get maxOperationRetryTime(){return this._maxOperationRetryTime}set maxOperationRetryTime(e){k("time",0,Number.POSITIVE_INFINITY,e),this._maxOperationRetryTime=e}async _getAuthToken(){if(this._overrideAuthToken)return this._overrideAuthToken;let e=this._authProvider.getImmediate({optional:!0});if(e){let t=await e.getToken();if(null!==t)return t.accessToken}return null}async _getAppCheckToken(){let e=this._appCheckProvider.getImmediate({optional:!0});return e?(await e.getToken()).token:null}_delete(){return this._deleted||(this._deleted=!0,this._requests.forEach(e=>e.cancel()),this._requests.clear()),Promise.resolve()}_makeStorageReference(e){return new Y(this,e)}_makeRequest(e,t,n,r,s=!0){if(this._deleted)return new b(_());{let o=function(e,t,n,r,s,o,i=!0){let a=A(e.urlParams),l=e.url+a,u=Object.assign({},e.headers);return t&&(u["X-Firebase-GMPID"]=t),null!==n&&n.length>0&&(u.Authorization="Firebase "+n),u["X-Firebase-Storage-Version"]="webjs/"+(null!=o?o:"AppManager"),null!==r&&(u["X-Firebase-AppCheck"]=r),new O(l,e.method,u,e.body,e.successCodes,e.additionalRetryCodes,e.handler,e.errorHandler,e.timeout,e.progressCallback,s,i)}(e,this._appId,n,r,t,this._firebaseVersion,s);return this._requests.add(o),o.getPromise().then(()=>this._requests.delete(o),()=>this._requests.delete(o)),o}}async makeRequestWithTokens(e,t){let[n,r]=await Promise.all([this._getAuthToken(),this._getAppCheckToken()]);return this._makeRequest(e,t,n,r).getPromise()}}/**
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
 */let en="storage";function er(e,t,n){return function(e,t,n){e._throwIfRoot("uploadBytes");let s=function(e,t,n,s,o){var i,a;let l=t.bucketOnlyServerUrl(),u={"X-Goog-Upload-Protocol":"multipart"},c=function(){let e="";for(let t=0;t<2;t++)e+=Math.random().toString().slice(2);return e}();u["Content-Type"]="multipart/related; boundary="+c;let d=function(e,t,n){let r=Object.assign({},n);return r.fullPath=e.path,r.size=t.size(),!r.contentType&&(r.contentType=t&&t.type()||"application/octet-stream"),r}(t,s,o),p="--"+c+"\r\nContent-Type: application/json; charset=utf-8\r\n\r\n"+function(e,t){let n={},r=t.length;for(let s=0;s<r;s++){let r=t[s];r.writable&&(n[r.server]=e[r.local])}return JSON.stringify(n)}(d,n)+"\r\n--"+c+"\r\nContent-Type: "+d.contentType+"\r\n\r\n",f=S.getBlob(p,s,"\r\n--"+c+"--");if(null===f)throw new h(r.CANNOT_SLICE_BLOB,"Cannot slice blob for upload. Please retry the upload.");let _={name:d.fullPath},g=y(l,e.host,e._protocol),m=e.maxUploadRetryTime,R=new W(g,"POST",(i=e,a=n,function(e,t){let n=$(i,t,a);return j(null!==n),n}),m);return R.urlParams=_,R.headers=u,R.body=f.uploadData(),R.errorHandler=H(t),R}(e.storage,e._location,V(),new S(t,!0),n);return e.storage.makeRequestWithTokens(s,J).then(t=>({metadata:t,ref:e}))}(e=(0,i.m9)(e),t,n)}function es(e){return function(e){let t={prefixes:[],items:[]};return Q(e,t).then(()=>t)}(e=(0,i.m9)(e))}function eo(e){return function(e){e._throwIfRoot("getDownloadURL");let t=function(e,t,n){let r=new W(y(t.fullServerUrl(),e.host,e._protocol),"GET",function(t,r){let s=$(e,r,n);return j(null!==s),function(e,t,n,r){let s=P(t);if(null===s||!w(s.downloadTokens))return null;let o=s.downloadTokens;if(0===o.length)return null;let i=encodeURIComponent;return o.split(",").map(t=>{let s=e.bucket,o=e.fullPath;return y("/b/"+i(s)+"/o/"+i(o),n,r)+A({alt:"media",token:t})})[0]}(s,r,e.host,e._protocol)},e.maxOperationRetryTime);return r.errorHandler=K(t),r}(e.storage,e._location,V());return e.storage.makeRequestWithTokens(t,J).then(e=>{if(null===e)throw new h(r.NO_DOWNLOAD_URL,"The given file does not have any download URLs.");return e})}(e=(0,i.m9)(e))}function ei(e){return function(e){e._throwIfRoot("deleteObject");let t=function(e,t){let n=new W(y(t.fullServerUrl(),e.host,e._protocol),"DELETE",function(e,t){},e.maxOperationRetryTime);return n.successCodes=[200,204],n.errorHandler=K(t),n}(e.storage,e._location);return e.storage.makeRequestWithTokens(t,J)}(e=(0,i.m9)(e))}function ea(e,t){return function(e,t){if(!(t&&/^[A-Za-z]+:\/\//.test(t)))return function e(t,n){if(t instanceof et){if(null==t._bucket)throw new h(r.NO_DEFAULT_BUCKET,"No default bucket found. Did you set the '"+c+"' property when initializing the app?");let s=new Y(t,t._bucket);return null!=n?e(s,n):s}return void 0!==n?function(e,t){let n=function(e,t){let n=t.split("/").filter(e=>e.length>0).join("/");return 0===e.length?n:e+"/"+n}(e._location.path,t),r=new R(e._location.bucket,n);return new Y(e.storage,r)}(t,n):t}(e,t);if(e instanceof et)return new Y(e,t);throw f("To use ref(service, url), the first argument must be a Storage instance.")}(e=(0,i.m9)(e),t)}function el(e=(0,o.Mq)(),t){e=(0,i.m9)(e);let n=(0,o.qX)(e,en).getImmediate({identifier:t}),r=(0,i.P0)("storage");return r&&function(e,t,n,r={}){!function(e,t,n,r={}){e.host=`${t}:${n}`,e._protocol="http";let{mockUserToken:s}=r;s&&(e._overrideAuthToken="string"==typeof s?s:(0,i.Sg)(s,e.app.options.projectId))}(e,t,n,r)}(n,...r),n}(0,o.Xd)(new l.wA(en,function(e,{instanceIdentifier:t}){return new et(e.getProvider("app").getImmediate(),e.getProvider("auth-internal"),e.getProvider("app-check-internal"),t,o.Jn)},"PUBLIC").setMultipleInstances(!0)),(0,o.KN)("@firebase/storage","0.13.2")}};