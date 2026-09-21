import{$ as e,B as t,C as n,D as r,F as i,I as a,J as o,L as s,M as c,P as l,R as u,S as d,T as f,U as p,V as m,W as h,X as g,Z as _,_ as v,a as y,c as b,et as ee,f as te,h as ne,i as re,it as x,k as ie,l as ae,n as oe,o as se,p as ce,q as S,r as C,rt as w,s as T,t as le,tt as ue,u as de,v as E,x as D,y as fe}from"./Geometry-BdkhKttj.js";var O=[];x.handleByNamedList(w.Environment,O);async function pe(e){if(!e)for(let e=0;e<O.length;e++){let t=O[e];if(t.value.test()){await t.value.load();return}}}var k;function me(){if(typeof k==`boolean`)return k;try{k=Function(`param1`,`param2`,`param3`,`return param1[param2] === param3;`)({a:`b`},`a`,`b`)===!0}catch(e){k=!1}return k}function he(e,t,n=2){let r=t&&t.length,i=r?t[0]*n:e.length,a=ge(e,0,i,n,!0),o=[];if(!a||a.next===a.prev)return o;let s,c,l;if(r&&(a=xe(e,t,a,n)),e.length>80*n){s=e[0],c=e[1];let t=s,r=c;for(let a=n;a<i;a+=n){let n=e[a],i=e[a+1];n<s&&(s=n),i<c&&(c=i),n>t&&(t=n),i>r&&(r=i)}l=Math.max(t-s,r-c),l=l===0?0:32767/l}return j(a,o,n,s,c,l,0),o}function ge(e,t,n,r,i){let a;if(i===Ie(e,t,n,r)>0)for(let i=t;i<n;i+=r)a=Fe(i/r|0,e[i],e[i+1],a);else for(let i=n-r;i>=t;i-=r)a=Fe(i/r|0,e[i],e[i+1],a);return a&&F(a,a.next)&&(z(a),a=a.next),a}function A(e,t){if(!e)return e;t||(t=e);let n=e,r;do if(r=!1,!n.steiner&&(F(n,n.next)||P(n.prev,n,n.next)===0)){if(z(n),n=t=n.prev,n===n.next)break;r=!0}else n=n.next;while(r||n!==t);return t}function j(e,t,n,r,i,a,o){if(!e)return;!o&&a&&Ee(e,r,i,a);let s=e;for(;e.prev!==e.next;){let c=e.prev,l=e.next;if(a?ve(e,r,i,a):_e(e)){t.push(c.i,e.i,l.i),z(e),e=l.next,s=l.next;continue}if(e=l,e===s){o?o===1?(e=ye(A(e),t),j(e,t,n,r,i,a,2)):o===2&&be(e,t,n,r,i,a):j(A(e),t,n,r,i,a,1);break}}}function _e(e){let t=e.prev,n=e,r=e.next;if(P(t,n,r)>=0)return!1;let i=t.x,a=n.x,o=r.x,s=t.y,c=n.y,l=r.y,u=Math.min(i,a,o),d=Math.min(s,c,l),f=Math.max(i,a,o),p=Math.max(s,c,l),m=r.next;for(;m!==t;){if(m.x>=u&&m.x<=f&&m.y>=d&&m.y<=p&&N(i,s,a,c,o,l,m.x,m.y)&&P(m.prev,m,m.next)>=0)return!1;m=m.next}return!0}function ve(e,t,n,r){let i=e.prev,a=e,o=e.next;if(P(i,a,o)>=0)return!1;let s=i.x,c=a.x,l=o.x,u=i.y,d=a.y,f=o.y,p=Math.min(s,c,l),m=Math.min(u,d,f),h=Math.max(s,c,l),g=Math.max(u,d,f),_=M(p,m,t,n,r),v=M(h,g,t,n,r),y=e.prevZ,b=e.nextZ;for(;y&&y.z>=_&&b&&b.z<=v;){if(y.x>=p&&y.x<=h&&y.y>=m&&y.y<=g&&y!==i&&y!==o&&N(s,u,c,d,l,f,y.x,y.y)&&P(y.prev,y,y.next)>=0||(y=y.prevZ,b.x>=p&&b.x<=h&&b.y>=m&&b.y<=g&&b!==i&&b!==o&&N(s,u,c,d,l,f,b.x,b.y)&&P(b.prev,b,b.next)>=0))return!1;b=b.nextZ}for(;y&&y.z>=_;){if(y.x>=p&&y.x<=h&&y.y>=m&&y.y<=g&&y!==i&&y!==o&&N(s,u,c,d,l,f,y.x,y.y)&&P(y.prev,y,y.next)>=0)return!1;y=y.prevZ}for(;b&&b.z<=v;){if(b.x>=p&&b.x<=h&&b.y>=m&&b.y<=g&&b!==i&&b!==o&&N(s,u,c,d,l,f,b.x,b.y)&&P(b.prev,b,b.next)>=0)return!1;b=b.nextZ}return!0}function ye(e,t){let n=e;do{let r=n.prev,i=n.next.next;!F(r,i)&&je(r,n,n.next,i)&&R(r,i)&&R(i,r)&&(t.push(r.i,n.i,i.i),z(n),z(n.next),n=e=i),n=n.next}while(n!==e);return A(n)}function be(e,t,n,r,i,a){let o=e;do{let e=o.next.next;for(;e!==o.prev;){if(o.i!==e.i&&Ae(o,e)){let s=Pe(o,e);o=A(o,o.next),s=A(s,s.next),j(o,t,n,r,i,a,0),j(s,t,n,r,i,a,0);return}e=e.next}o=o.next}while(o!==e)}function xe(e,t,n,r){let i=[];for(let n=0,a=t.length;n<a;n++){let o=ge(e,t[n]*r,n<a-1?t[n+1]*r:e.length,r,!1);o===o.next&&(o.steiner=!0),i.push(Oe(o))}i.sort(Se);for(let e=0;e<i.length;e++)n=Ce(i[e],n);return n}function Se(e,t){let n=e.x-t.x;return n===0&&(n=e.y-t.y,n===0&&(n=(e.next.y-e.y)/(e.next.x-e.x)-(t.next.y-t.y)/(t.next.x-t.x))),n}function Ce(e,t){let n=we(e,t);if(!n)return t;let r=Pe(n,e);return A(r,r.next),A(n,n.next)}function we(e,t){let n=t,r=e.x,i=e.y,a=-1/0,o;if(F(e,n))return n;do{if(F(e,n.next))return n.next;if(i<=n.y&&i>=n.next.y&&n.next.y!==n.y){let e=n.x+(i-n.y)*(n.next.x-n.x)/(n.next.y-n.y);if(e<=r&&e>a&&(a=e,o=n.x<n.next.x?n:n.next,e===r))return o}n=n.next}while(n!==t);if(!o)return null;let s=o,c=o.x,l=o.y,u=1/0;n=o;do{if(r>=n.x&&n.x>=c&&r!==n.x&&ke(i<l?r:a,i,c,l,i<l?a:r,i,n.x,n.y)){let t=Math.abs(i-n.y)/(r-n.x);R(n,e)&&(t<u||t===u&&(n.x>o.x||n.x===o.x&&Te(o,n)))&&(o=n,u=t)}n=n.next}while(n!==s);return o}function Te(e,t){return P(e.prev,e,t.prev)<0&&P(t.next,e,e.next)<0}function Ee(e,t,n,r){let i=e;do i.z===0&&(i.z=M(i.x,i.y,t,n,r)),i.prevZ=i.prev,i.nextZ=i.next,i=i.next;while(i!==e);i.prevZ.nextZ=null,i.prevZ=null,De(i)}function De(e){let t,n=1;do{let r=e,i;e=null;let a=null;for(t=0;r;){t++;let o=r,s=0;for(let e=0;e<n&&(s++,o=o.nextZ,o);e++);let c=n;for(;s>0||c>0&&o;)s!==0&&(c===0||!o||r.z<=o.z)?(i=r,r=r.nextZ,s--):(i=o,o=o.nextZ,c--),a?a.nextZ=i:e=i,i.prevZ=a,a=i;r=o}a.nextZ=null,n*=2}while(t>1);return e}function M(e,t,n,r,i){return e=(e-n)*i|0,t=(t-r)*i|0,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,t=(t|t<<8)&16711935,t=(t|t<<4)&252645135,t=(t|t<<2)&858993459,t=(t|t<<1)&1431655765,e|t<<1}function Oe(e){let t=e,n=e;do(t.x<n.x||t.x===n.x&&t.y<n.y)&&(n=t),t=t.next;while(t!==e);return n}function ke(e,t,n,r,i,a,o,s){return(i-o)*(t-s)>=(e-o)*(a-s)&&(e-o)*(r-s)>=(n-o)*(t-s)&&(n-o)*(a-s)>=(i-o)*(r-s)}function N(e,t,n,r,i,a,o,s){return!(e===o&&t===s)&&ke(e,t,n,r,i,a,o,s)}function Ae(e,t){return e.next.i!==t.i&&e.prev.i!==t.i&&!Me(e,t)&&(R(e,t)&&R(t,e)&&Ne(e,t)&&(P(e.prev,e,t.prev)||P(e,t.prev,t))||F(e,t)&&P(e.prev,e,e.next)>0&&P(t.prev,t,t.next)>0)}function P(e,t,n){return(t.y-e.y)*(n.x-t.x)-(t.x-e.x)*(n.y-t.y)}function F(e,t){return e.x===t.x&&e.y===t.y}function je(e,t,n,r){let i=L(P(e,t,n)),a=L(P(e,t,r)),o=L(P(n,r,e)),s=L(P(n,r,t));return!!(i!==a&&o!==s||i===0&&I(e,n,t)||a===0&&I(e,r,t)||o===0&&I(n,e,r)||s===0&&I(n,t,r))}function I(e,t,n){return t.x<=Math.max(e.x,n.x)&&t.x>=Math.min(e.x,n.x)&&t.y<=Math.max(e.y,n.y)&&t.y>=Math.min(e.y,n.y)}function L(e){return e>0?1:e<0?-1:0}function Me(e,t){let n=e;do{if(n.i!==e.i&&n.next.i!==e.i&&n.i!==t.i&&n.next.i!==t.i&&je(n,n.next,e,t))return!0;n=n.next}while(n!==e);return!1}function R(e,t){return P(e.prev,e,e.next)<0?P(e,t,e.next)>=0&&P(e,e.prev,t)>=0:P(e,t,e.prev)<0||P(e,e.next,t)<0}function Ne(e,t){let n=e,r=!1,i=(e.x+t.x)/2,a=(e.y+t.y)/2;do n.y>a!=n.next.y>a&&n.next.y!==n.y&&i<(n.next.x-n.x)*(a-n.y)/(n.next.y-n.y)+n.x&&(r=!r),n=n.next;while(n!==e);return r}function Pe(e,t){let n=B(e.i,e.x,e.y),r=B(t.i,t.x,t.y),i=e.next,a=t.prev;return e.next=t,t.prev=e,n.next=i,i.prev=n,r.next=n,n.prev=r,a.next=r,r.prev=a,r}function Fe(e,t,n,r){let i=B(e,t,n);return r?(i.next=r.next,i.prev=r,r.next.prev=i,r.next=i):(i.prev=i,i.next=i),i}function z(e){e.next.prev=e.prev,e.prev.next=e.next,e.prevZ&&(e.prevZ.nextZ=e.nextZ),e.nextZ&&(e.nextZ.prevZ=e.prevZ)}function B(e,t,n){return{i:e,x:t,y:n,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}function Ie(e,t,n,r){let i=0;for(let a=t,o=n-r;a<n;a+=r)i+=(e[o]-e[a])*(e[a+1]+e[o+1]),o=a;return i}var Le=he.default||he,V=(e=>(e[e.NONE=0]=`NONE`,e[e.COLOR=16384]=`COLOR`,e[e.STENCIL=1024]=`STENCIL`,e[e.DEPTH=256]=`DEPTH`,e[e.COLOR_DEPTH=16640]=`COLOR_DEPTH`,e[e.COLOR_STENCIL=17408]=`COLOR_STENCIL`,e[e.DEPTH_STENCIL=1280]=`DEPTH_STENCIL`,e[e.ALL=17664]=`ALL`,e))(V||{}),Re=class{constructor(e){this.items=[],this._name=e}emit(e,t,n,r,i,a,o,s){let{name:c,items:l}=this;for(let u=0,d=l.length;u<d;u++)l[u][c](e,t,n,r,i,a,o,s);return this}add(e){return e[this._name]&&(this.remove(e),this.items.push(e)),this}remove(e){let t=this.items.indexOf(e);return t!==-1&&this.items.splice(t,1),this}contains(e){return this.items.indexOf(e)!==-1}removeAll(){return this.items.length=0,this}destroy(){this.removeAll(),this.items=null,this._name=null}get empty(){return this.items.length===0}get name(){return this._name}},ze=[`init`,`destroy`,`contextChange`,`resolutionChange`,`resetState`,`renderEnd`,`renderStart`,`render`,`update`,`postrender`,`prerender`],Be=class e extends ue{constructor(e){var t;super(),this.tick=0,this.uid=g(`renderer`),this.runners=Object.create(null),this.renderPipes=Object.create(null),this._initOptions={},this._systemsHash=Object.create(null),this.type=e.type,this.name=e.name,this.config=e;let n=[...ze,...(t=this.config.runners)==null?[]:t];this._addRunners(...n),this._unsafeEvalCheck()}async init(t={}){await pe(t.skipExtensionImports===!0?!0:t.manageImports===!1),this._addSystems(this.config.systems),this._addPipes(this.config.renderPipes,this.config.renderPipeAdaptors);for(let e in this._systemsHash)t={...this._systemsHash[e].constructor.defaultOptions,...t};t={...e.defaultOptions,...t},this._roundPixels=+!!t.roundPixels;for(let e=0;e<this.runners.init.items.length;e++)await this.runners.init.items[e].init(t);this._initOptions=t}render(e,t){this.tick++;let n=e;if(n instanceof D&&(n={container:n},t&&(S(o,`passing a second argument is deprecated, please use render options instead`),n.target=t.renderTexture)),n.target||(n.target=this.view.renderTarget),n.target===this.view.renderTarget&&(this._lastObjectRendered=n.container,n.clearColor!=null||(n.clearColor=this.background.colorRgba),n.clear!=null||(n.clear=this.background.clearBeforeRender)),n.clearColor){let e=Array.isArray(n.clearColor)&&n.clearColor.length===4;n.clearColor=e?n.clearColor:s.shared.setValue(n.clearColor).toArray()}n.transform||(n.container.updateLocalTransform(),n.transform=n.container.localTransform),n.container.visible&&(n.container.enableRenderGroup(),this.runners.prerender.emit(n),this.runners.renderStart.emit(n),this.runners.render.emit(n),this.runners.renderEnd.emit(n),this.runners.postrender.emit(n))}resize(e,t,n){let r=this.view.resolution;this.view.resize(e,t,n),this.emit(`resize`,this.view.screen.width,this.view.screen.height,this.view.resolution),n!==void 0&&n!==r&&this.runners.resolutionChange.emit(n)}clear(e={}){let t=this;e.target||(e.target=t.renderTarget.renderTarget),e.clearColor||(e.clearColor=this.background.colorRgba),e.clear!=null||(e.clear=V.ALL);let{clear:n,clearColor:r,target:i,mipLevel:a,layer:o}=e;s.shared.setValue(r==null?this.background.colorRgba:r),t.renderTarget.clear(i,n,s.shared.toArray(),a==null?0:a,o==null?0:o)}get resolution(){return this.view.resolution}set resolution(e){this.view.resolution=e,this.runners.resolutionChange.emit(e)}get width(){return this.view.texture.frame.width}get height(){return this.view.texture.frame.height}get canvas(){return this.view.canvas}get lastObjectRendered(){return this._lastObjectRendered}get renderingToScreen(){return this.renderTarget.renderingToScreen}get screen(){return this.view.screen}_addRunners(...e){e.forEach(e=>{this.runners[e]=new Re(e)})}_addSystems(e){let t;for(t in e){let n=e[t];this._addSystem(n.value,n.name)}}_addSystem(e,t){let n=new e(this);if(this[t])throw Error(`Whoops! The name "${t}" is already in use`);this[t]=n,this._systemsHash[t]=n;for(let e in this.runners)this.runners[e].add(n);return this}_addPipes(e,t){let n=t.reduce((e,t)=>(e[t.name]=t.value,e),{});e.forEach(e=>{let t=e.value,r=e.name,i=n[r];this.renderPipes[r]=new t(this,i?new i:null),this.runners.destroy.add(this.renderPipes[r])})}destroy(e=!1){this.runners.destroy.items.reverse(),this.runners.destroy.emit(e),(e===!0||typeof e==`object`&&e.releaseGlobalResources)&&i.release(),Object.values(this.runners).forEach(e=>{e.destroy()}),this._systemsHash=null,this.renderPipes=null,this.removeAllListeners()}generateTexture(e){return this.textureGenerator.generateTexture(e)}get roundPixels(){return!!this._roundPixels}_unsafeEvalCheck(){if(!me())throw Error(`Current environment does not allow unsafe-eval, please use pixi.js/unsafe-eval module to enable support.`)}resetState(){this.runners.resetState.emit()}};Be.defaultOptions={resolution:1,failIfMajorPerformanceCaveat:!1,roundPixels:!1};var Ve=Be,He=`8.19.0`,Ue=class{static init(){var e,t;(e=(t=globalThis).__PIXI_APP_INIT__)==null||e.call(t,this,`8.19.0`)}static destroy(){}};Ue.extension=w.Application;var We=class{constructor(e){this._renderer=e}init(){var e,t;(e=(t=globalThis).__PIXI_RENDERER_INIT__)==null||e.call(t,this._renderer,`8.19.0`)}destroy(){this._renderer=null}};We.extension={type:[w.WebGLSystem,w.WebGPUSystem],name:`initHook`,priority:-10};var Ge=class{constructor(e){typeof e==`number`?this.rawBinaryData=new ArrayBuffer(e):e instanceof Uint8Array?this.rawBinaryData=e.buffer:this.rawBinaryData=e,this.uint32View=new Uint32Array(this.rawBinaryData),this.float32View=new Float32Array(this.rawBinaryData),this.size=this.rawBinaryData.byteLength}get int8View(){return this._int8View||(this._int8View=new Int8Array(this.rawBinaryData)),this._int8View}get uint8View(){return this._uint8View||(this._uint8View=new Uint8Array(this.rawBinaryData)),this._uint8View}get int16View(){return this._int16View||(this._int16View=new Int16Array(this.rawBinaryData)),this._int16View}get int32View(){return this._int32View||(this._int32View=new Int32Array(this.rawBinaryData)),this._int32View}get float64View(){return this._float64Array||(this._float64Array=new Float64Array(this.rawBinaryData)),this._float64Array}get bigUint64View(){return this._bigUint64Array||(this._bigUint64Array=new BigUint64Array(this.rawBinaryData)),this._bigUint64Array}view(e){return this[`${e}View`]}destroy(){this.rawBinaryData=null,this.uint32View=null,this.float32View=null,this.uint16View=null,this._int8View=null,this._uint8View=null,this._int16View=null,this._int32View=null,this._float64Array=null,this._bigUint64Array=null}static sizeOf(e){switch(e){case`int8`:case`uint8`:return 1;case`int16`:case`uint16`:return 2;case`int32`:case`uint32`:case`float32`:return 4;default:throw Error(`${e} isn't a valid view type`)}}};function H(e,t,n,r){if(n!=null||(n=0),r!=null||(r=Math.min(e.byteLength-n,t.byteLength)),!(n&7)&&!(r&7)){let i=r/8;new Float64Array(t,0,i).set(new Float64Array(e,n,i))}else if(!(n&3)&&!(r&3)){let i=r/4;new Float32Array(t,0,i).set(new Float32Array(e,n,i))}else new Uint8Array(t).set(new Uint8Array(e,n,r))}var Ke={normal:`normal-npm`,add:`add-npm`,screen:`screen-npm`},U=(e=>(e[e.DISABLED=0]=`DISABLED`,e[e.RENDERING_MASK_ADD=1]=`RENDERING_MASK_ADD`,e[e.MASK_ACTIVE=2]=`MASK_ACTIVE`,e[e.INVERSE_MASK_ACTIVE=3]=`INVERSE_MASK_ACTIVE`,e[e.RENDERING_MASK_REMOVE=4]=`RENDERING_MASK_REMOVE`,e[e.NONE=5]=`NONE`,e))(U||{});function qe(e,t){return t.alphaMode===`no-premultiply-alpha`&&Ke[e]||e}var Je=[`precision mediump float;`,`void main(void){`,`float test = 0.1;`,`%forloop%`,`gl_FragColor = vec4(0.0);`,`}`].join(`
`);function Ye(e){let t=``;for(let n=0;n<e;++n)n>0&&(t+=`
else `),n<e-1&&(t+=`if(test == ${n}.0){}`);return t}function Xe(e,t){if(e===0)throw Error("Invalid value of `0` passed to `checkMaxIfStatementsInShader`");let n=t.createShader(t.FRAGMENT_SHADER);try{for(;;){let r=Je.replace(/%forloop%/gi,Ye(e));if(t.shaderSource(n,r),t.compileShader(n),!t.getShaderParameter(n,t.COMPILE_STATUS))e=e/2|0;else break}}finally{t.deleteShader(n)}return e}var W=null;function Ze(){var e;if(W)return W;let t=ce();return W=t.getParameter(t.MAX_TEXTURE_IMAGE_UNITS),W=Xe(W,t),(e=t.getExtension(`WEBGL_lose_context`))==null||e.loseContext(),W}var Qe=class{constructor(){this.ids=Object.create(null),this.textures=[],this.count=0}clear(){for(let e=0;e<this.count;e++){let t=this.textures[e];this.textures[e]=null,this.ids[t.uid]=null}this.count=0}},$e=class{constructor(){this.renderPipeId=`batch`,this.action=`startBatch`,this.start=0,this.size=0,this.textures=new Qe,this.blendMode=`normal`,this.topology=`triangle-strip`,this.canBundle=!0}destroy(){this.textures=null,this.gpuBindGroup=null,this.bindGroup=null,this.batcher=null,this.elements=null}},G=[],K=0;i.register({clear:()=>{if(G.length>0)for(let e of G)e&&e.destroy();G.length=0,K=0}});function et(){return K>0?G[--K]:new $e}function tt(e){e.elements=null,G[K++]=e}var q=0,nt=class e{constructor(t){this.uid=g(`batcher`),this.dirty=!0,this.batchIndex=0,this.batches=[],this._elements=[],t={...e.defaultOptions,...t},t.maxTextures||(S(`v8.8.0`,`maxTextures is a required option for Batcher now, please pass it in the options`),t.maxTextures=Ze());let{maxTextures:n,attributesInitialSize:r,indicesInitialSize:i}=t;this.attributeBuffer=new Ge(r*4),this.indexBuffer=new Uint16Array(i),this.maxTextures=n}begin(){this.elementSize=0,this.elementStart=0,this.indexSize=0,this.attributeSize=0;for(let e=0;e<this.batchIndex;e++)tt(this.batches[e]);this.batchIndex=0,this._batchIndexStart=0,this._batchIndexSize=0,this.dirty=!0}add(e){this._elements[this.elementSize++]=e,e._indexStart=this.indexSize,e._attributeStart=this.attributeSize,e._batcher=this,this.indexSize+=e.indexSize,this.attributeSize+=e.attributeSize*this.vertexSize}checkAndUpdateTexture(e,t){let n=e._batch.textures.ids[t._source.uid];return!n&&n!==0?!1:(e._textureId=n,e.texture=t,!0)}updateElement(e){this.dirty=!0;let t=this.attributeBuffer;e.packAsQuad?this.packQuadAttributes(e,t.float32View,t.uint32View,e._attributeStart,e._textureId):this.packAttributes(e,t.float32View,t.uint32View,e._attributeStart,e._textureId)}break(e){let t=this._elements;if(!t[this.elementStart])return;let n=et(),r=n.textures;r.clear();let i=t[this.elementStart],a=qe(i.blendMode,i.texture._source),o=i.topology;this.attributeSize*4>this.attributeBuffer.size&&this._resizeAttributeBuffer(this.attributeSize*4),this.indexSize>this.indexBuffer.length&&this._resizeIndexBuffer(this.indexSize);let s=this.attributeBuffer.float32View,c=this.attributeBuffer.uint32View,l=this.indexBuffer,u=this._batchIndexSize,d=this._batchIndexStart,f=`startBatch`,p=[],m=this.maxTextures;for(let i=this.elementStart;i<this.elementSize;++i){let h=t[i];t[i]=null;let g=h.texture._source,_=qe(h.blendMode,g),v=a!==_||o!==h.topology;if(g._batchTick===q&&!v){h._textureId=g._textureBindLocation,u+=h.indexSize,h.packAsQuad?(this.packQuadAttributes(h,s,c,h._attributeStart,h._textureId),this.packQuadIndex(l,h._indexStart,h._attributeStart/this.vertexSize)):(this.packAttributes(h,s,c,h._attributeStart,h._textureId),this.packIndex(h,l,h._indexStart,h._attributeStart/this.vertexSize)),h._batch=n,p.push(h);continue}g._batchTick=q,(r.count>=m||v)&&(this._finishBatch(n,d,u-d,r,a,o,e,f,p),f=`renderBatch`,d=u,a=_,o=h.topology,n=et(),r=n.textures,r.clear(),p=[],++q),h._textureId=g._textureBindLocation=r.count,r.ids[g.uid]=r.count,r.textures[r.count++]=g,h._batch=n,p.push(h),u+=h.indexSize,h.packAsQuad?(this.packQuadAttributes(h,s,c,h._attributeStart,h._textureId),this.packQuadIndex(l,h._indexStart,h._attributeStart/this.vertexSize)):(this.packAttributes(h,s,c,h._attributeStart,h._textureId),this.packIndex(h,l,h._indexStart,h._attributeStart/this.vertexSize))}r.count>0&&(this._finishBatch(n,d,u-d,r,a,o,e,f,p),d=u,++q),this.elementStart=this.elementSize,this._batchIndexStart=d,this._batchIndexSize=u}_finishBatch(e,t,n,r,i,a,o,s,c){e.gpuBindGroup=null,e.bindGroup=null,e.action=s,e.batcher=this,e.textures=r,e.blendMode=i,e.topology=a,e.start=t,e.size=n,e.elements=c,++q,this.batches[this.batchIndex++]=e,o.add(e)}finish(e){this.break(e)}ensureAttributeBuffer(e){e*4<=this.attributeBuffer.size||this._resizeAttributeBuffer(e*4)}ensureIndexBuffer(e){e<=this.indexBuffer.length||this._resizeIndexBuffer(e)}_resizeAttributeBuffer(e){let t=new Ge(Math.max(e,this.attributeBuffer.size*2));H(this.attributeBuffer.rawBinaryData,t.rawBinaryData),this.attributeBuffer=t}_resizeIndexBuffer(e){let t=this.indexBuffer,n=Math.max(e,t.length*1.5);n+=n%2;let r=n>65535?new Uint32Array(n):new Uint16Array(n);if(r.BYTES_PER_ELEMENT!==t.BYTES_PER_ELEMENT)for(let e=0;e<t.length;e++)r[e]=t[e];else H(t.buffer,r.buffer);this.indexBuffer=r}packQuadIndex(e,t,n){e[t]=n+0,e[t+1]=n+1,e[t+2]=n+2,e[t+3]=n+0,e[t+4]=n+2,e[t+5]=n+3}packIndex(e,t,n,r){let i=e.indices,a=e.indexSize,o=e.indexOffset,s=e.attributeOffset;for(let e=0;e<a;e++)t[n++]=r+i[e+o]-s}destroy(e={}){if(this.batches!==null){for(let e=0;e<this.batchIndex;e++)tt(this.batches[e]);if(this.batches=null,this.geometry.destroy(!0),this.geometry=null,e.shader){var t;(t=this.shader)==null||t.destroy(),this.shader=null}for(let e=0;e<this._elements.length;e++)this._elements[e]&&(this._elements[e]._batch=null);this._elements=null,this.indexBuffer=null,this.attributeBuffer.destroy(),this.attributeBuffer=null}}};nt.defaultOptions={maxTextures:null,attributesInitialSize:4,indicesInitialSize:6};var rt=nt,it=new Float32Array(1),at=new Uint32Array(1),ot=class extends le{constructor(){let e=new oe({data:it,label:`attribute-batch-buffer`,usage:C.VERTEX|C.COPY_DST,shrinkToFit:!1}),t=new oe({data:at,label:`index-batch-buffer`,usage:C.INDEX|C.COPY_DST,shrinkToFit:!1});super({attributes:{aPosition:{buffer:e,format:`float32x2`,stride:24,offset:0},aUV:{buffer:e,format:`float32x2`,stride:24,offset:8},aColor:{buffer:e,format:`unorm8x4`,stride:24,offset:16},aTextureIdAndRound:{buffer:e,format:`uint16x2`,stride:24,offset:20}},indexBuffer:t})}};function st(e,t,n){if(e)for(let r in e){let i=t[r.toLocaleLowerCase()];if(i){let t=e[r];r===`header`&&(t=t.replace(/@in\s+[^;]+;\s*/g,``).replace(/@out\s+[^;]+;\s*/g,``)),n&&i.push(`//----${n}----//`),i.push(t)}else a(`${r} placement hook does not exist in shader`)}}var ct=/\{\{(.*?)\}\}/g;function lt(e){var t,n;let r={};return((t=(n=e.match(ct))==null?void 0:n.map(e=>e.replace(/[{()}]/g,``)))==null?[]:t).forEach(e=>{r[e]=[]}),r}function ut(e,t){let n,r=/@in\s+([^;]+);/g;for(;(n=r.exec(e))!==null;)t.push(n[1])}function dt(e,t,n=!1){let r=[];ut(t,r),e.forEach(e=>{e.header&&ut(e.header,r)});let i=r;n&&i.sort();let a=i.map((e,t)=>`       @location(${t}) ${e},`).join(`
`),o=t.replace(/@in\s+[^;]+;\s*/g,``);return o=o.replace(`{{in}}`,`
${a}
`),o}function ft(e,t){let n,r=/@out\s+([^;]+);/g;for(;(n=r.exec(e))!==null;)t.push(n[1])}function pt(e){let t=/\b(\w+)\s*:/g.exec(e);return t?t[1]:``}function mt(e){return e.replace(/@.*?\s+/g,``)}function ht(e,t){let n=[];ft(t,n),e.forEach(e=>{e.header&&ft(e.header,n)});let r=0,i=n.sort().map(e=>e.indexOf(`builtin`)>-1?e:`@location(${r++}) ${e}`).join(`,
`),a=n.sort().map(e=>`       var ${mt(e)};`).join(`
`),o=`return VSOutput(
            ${n.sort().map(e=>` ${pt(e)}`).join(`,
`)});`,s=t.replace(/@out\s+[^;]+;\s*/g,``);return s=s.replace(`{{struct}}`,`
${i}
`),s=s.replace(`{{start}}`,`
${a}
`),s=s.replace(`{{return}}`,`
${o}
`),s}function gt(e,t){let n=e;for(let e in t){let r=t[e];n=r.join(`
`).length?n.replace(`{{${e}}}`,`//-----${e} START-----//
${r.join(`
`)}
//----${e} FINISH----//`):n.replace(`{{${e}}}`,``)}return n}var J=Object.create(null),Y=new Map,_t=0;function vt({template:e,bits:t}){let n=xt(e,t);if(J[n])return J[n];let{vertex:r,fragment:i}=bt(e,t);return J[n]=St(r,i,t),J[n]}function yt({template:e,bits:t}){let n=xt(e,t);return J[n]||(J[n]=St(e.vertex,e.fragment,t)),J[n]}function bt(e,t){let n=t.map(e=>e.vertex).filter(e=>!!e),r=t.map(e=>e.fragment).filter(e=>!!e),i=dt(n,e.vertex,!0);i=ht(n,i);let a=dt(r,e.fragment,!0);return{vertex:i,fragment:a}}function xt(e,t){return t.map(e=>(Y.has(e)||Y.set(e,_t++),Y.get(e))).sort((e,t)=>e-t).join(`-`)+e.vertex+e.fragment}function St(e,t,n){let r=lt(e),i=lt(t);return n.forEach(e=>{st(e.vertex,r,e.name),st(e.fragment,i,e.name)}),{vertex:gt(e,r),fragment:gt(t,i)}}var Ct=`
    @in aPosition: vec2<f32>;
    @in aUV: vec2<f32>;

    @out @builtin(position) vPosition: vec4<f32>;
    @out vUV : vec2<f32>;
    @out vColor : vec4<f32>;

    {{header}}

    struct VSOutput {
        {{struct}}
    };

    @vertex
    fn main( {{in}} ) -> VSOutput {

        var worldTransformMatrix = globalUniforms.uWorldTransformMatrix;
        var modelMatrix = mat3x3<f32>(
            1.0, 0.0, 0.0,
            0.0, 1.0, 0.0,
            0.0, 0.0, 1.0
          );
        var position = aPosition;
        var uv = aUV;

        {{start}}

        vColor = vec4<f32>(1., 1., 1., 1.);

        {{main}}

        vUV = uv;

        var modelViewProjectionMatrix = globalUniforms.uProjectionMatrix * worldTransformMatrix * modelMatrix;

        vPosition =  vec4<f32>((modelViewProjectionMatrix *  vec3<f32>(position, 1.0)).xy, 0.0, 1.0);

        vColor *= globalUniforms.uWorldColorAlpha;

        {{end}}

        {{return}}
    };
`,wt=`
    @in vUV : vec2<f32>;
    @in vColor : vec4<f32>;

    {{header}}

    @fragment
    fn main(
        {{in}}
      ) -> @location(0) vec4<f32> {

        {{start}}

        var outColor:vec4<f32>;

        {{main}}

        var finalColor:vec4<f32> = outColor * vColor;

        {{end}}

        return finalColor;
      };
`,Tt=`
    in vec2 aPosition;
    in vec2 aUV;

    out vec4 vColor;
    out vec2 vUV;

    {{header}}

    void main(void){

        mat3 worldTransformMatrix = uWorldTransformMatrix;
        mat3 modelMatrix = mat3(
            1.0, 0.0, 0.0,
            0.0, 1.0, 0.0,
            0.0, 0.0, 1.0
          );
        vec2 position = aPosition;
        vec2 uv = aUV;

        {{start}}

        vColor = vec4(1.);

        {{main}}

        vUV = uv;

        mat3 modelViewProjectionMatrix = uProjectionMatrix * worldTransformMatrix * modelMatrix;

        gl_Position = vec4((modelViewProjectionMatrix * vec3(position, 1.0)).xy, 0.0, 1.0);

        vColor *= uWorldColorAlpha;

        {{end}}
    }
`,Et=`

    in vec4 vColor;
    in vec2 vUV;

    out vec4 finalColor;

    {{header}}

    void main(void) {

        {{start}}

        vec4 outColor;

        {{main}}

        finalColor = outColor * vColor;

        {{end}}
    }
`,Dt={name:`global-uniforms-bit`,vertex:{header:`
        struct GlobalUniforms {
            uProjectionMatrix:mat3x3<f32>,
            uWorldTransformMatrix:mat3x3<f32>,
            uWorldColorAlpha: vec4<f32>,
            uResolution: vec2<f32>,
        }

        @group(0) @binding(0) var<uniform> globalUniforms : GlobalUniforms;
        `}},Ot={name:`global-uniforms-bit`,vertex:{header:`
          uniform mat3 uProjectionMatrix;
          uniform mat3 uWorldTransformMatrix;
          uniform vec4 uWorldColorAlpha;
          uniform vec2 uResolution;
        `}};function kt({bits:e,name:t}){let n=vt({template:{fragment:wt,vertex:Ct},bits:[Dt,...e]});return de.from({name:t,vertex:{source:n.vertex,entryPoint:`main`},fragment:{source:n.fragment,entryPoint:`main`}})}function At({bits:e,name:t}){return new te({name:t,...yt({template:{vertex:Tt,fragment:Et},bits:[Ot,...e]})})}var jt={name:`color-bit`,vertex:{header:`
            @in aColor: vec4<f32>;
        `,main:`
            vColor *= vec4<f32>(aColor.rgb * aColor.a, aColor.a);
        `}},Mt={name:`color-bit`,vertex:{header:`
            in vec4 aColor;
        `,main:`
            vColor *= vec4(aColor.rgb * aColor.a, aColor.a);
        `}},Nt={};function Pt(e){let t=[];if(e===1)t.push(`@group(1) @binding(0) var textureSource1: texture_2d<f32>;`),t.push(`@group(1) @binding(1) var textureSampler1: sampler;`);else{let n=0;for(let r=0;r<e;r++)t.push(`@group(1) @binding(${n++}) var textureSource${r+1}: texture_2d<f32>;`),t.push(`@group(1) @binding(${n++}) var textureSampler${r+1}: sampler;`)}return t.join(`
`)}function Ft(e){let t=[];if(e===1)t.push(`outColor = textureSampleGrad(textureSource1, textureSampler1, vUV, uvDx, uvDy);`);else{t.push(`switch vTextureId {`);for(let n=0;n<e;n++)n===e-1?t.push(`  default:{`):t.push(`  case ${n}:{`),t.push(`      outColor = textureSampleGrad(textureSource${n+1}, textureSampler${n+1}, vUV, uvDx, uvDy);`),t.push(`      break;}`);t.push(`}`)}return t.join(`
`)}function It(e){return Nt[e]||(Nt[e]={name:`texture-batch-bit`,vertex:{header:`
                @in aTextureIdAndRound: vec2<u32>;
                @out @interpolate(flat) vTextureId : u32;
            `,main:`
                vTextureId = aTextureIdAndRound.y;
            `,end:`
                if(aTextureIdAndRound.x == 1)
                {
                    vPosition = vec4<f32>(roundPixels(vPosition.xy, globalUniforms.uResolution), vPosition.zw);
                }
            `},fragment:{header:`
                @in @interpolate(flat) vTextureId: u32;

                ${Pt(e)}
            `,main:`
                var uvDx = dpdx(vUV);
                var uvDy = dpdy(vUV);

                ${Ft(e)}
            `}}),Nt[e]}var Lt={};function Rt(e){let t=[];for(let n=0;n<e;n++)n>0&&t.push(`else`),n<e-1&&t.push(`if(vTextureId < ${n}.5)`),t.push(`{`),t.push(`	outColor = texture(uTextures[${n}], vUV);`),t.push(`}`);return t.join(`
`)}function zt(e){return Lt[e]||(Lt[e]={name:`texture-batch-bit`,vertex:{header:`
                in vec2 aTextureIdAndRound;
                out float vTextureId;

            `,main:`
                vTextureId = aTextureIdAndRound.y;
            `,end:`
                if(aTextureIdAndRound.x == 1.)
                {
                    gl_Position.xy = roundPixels(gl_Position.xy, uResolution);
                }
            `},fragment:{header:`
                in float vTextureId;

                uniform sampler2D uTextures[${e}];

            `,main:`

                ${Rt(e)}
            `}}),Lt[e]}var Bt={name:`round-pixels-bit`,vertex:{header:`
            fn roundPixels(position: vec2<f32>, targetSize: vec2<f32>) -> vec2<f32>
            {
                return (floor(((position * 0.5 + 0.5) * targetSize) + 0.5) / targetSize) * 2.0 - 1.0;
            }
        `}},Vt={name:`round-pixels-bit`,vertex:{header:`
            vec2 roundPixels(vec2 position, vec2 targetSize)
            {
                return (floor(((position * 0.5 + 0.5) * targetSize) + 0.5) / targetSize) * 2.0 - 1.0;
            }
        `}},Ht={};function Ut(e){let t=Ht[e];if(t)return t;let n=new Int32Array(e);for(let t=0;t<e;t++)n[t]=t;return t=Ht[e]=new ae({uTextures:{value:n,type:`i32`,size:e}},{isStatic:!0}),t}var Wt=class extends se{constructor(e){let t=At({name:`batch`,bits:[Mt,zt(e),Vt]}),n=kt({name:`batch`,bits:[jt,It(e),Bt]});super({glProgram:t,gpuProgram:n,resources:{batchSamplers:Ut(e)}}),this.maxTextures=e}},X=null,Gt=class e extends rt{constructor(t){super(t),this.geometry=new ot,this.name=e.extension.name,this.vertexSize=6,X!=null||(X=new Wt(t.maxTextures)),this.shader=X}packAttributes(e,t,n,r,i){let a=i<<16|e.roundPixels&65535,o=e.transform,s=o.a,c=o.b,l=o.c,u=o.d,d=o.tx,f=o.ty,{positions:p,uvs:m}=e,h=e.color,g=e.attributeOffset,_=g+e.attributeSize;for(let e=g;e<_;e++){let i=e*2,o=p[i],g=p[i+1];t[r++]=s*o+l*g+d,t[r++]=u*g+c*o+f,t[r++]=m[i],t[r++]=m[i+1],n[r++]=h,n[r++]=a}}packQuadAttributes(e,t,n,r,i){let a=e.texture,o=e.transform,s=o.a,c=o.b,l=o.c,u=o.d,d=o.tx,f=o.ty,p=e.bounds,m=p.maxX,h=p.minX,g=p.maxY,_=p.minY,v=a.uvs,y=e.color,b=i<<16|e.roundPixels&65535;t[r+0]=s*h+l*_+d,t[r+1]=u*_+c*h+f,t[r+2]=v.x0,t[r+3]=v.y0,n[r+4]=y,n[r+5]=b,t[r+6]=s*m+l*_+d,t[r+7]=u*_+c*m+f,t[r+8]=v.x1,t[r+9]=v.y1,n[r+10]=y,n[r+11]=b,t[r+12]=s*m+l*g+d,t[r+13]=u*g+c*m+f,t[r+14]=v.x2,t[r+15]=v.y2,n[r+16]=y,n[r+17]=b,t[r+18]=s*h+l*g+d,t[r+19]=u*g+c*h+f,t[r+20]=v.x3,t[r+21]=v.y3,n[r+22]=y,n[r+23]=b}_updateMaxTextures(e){this.shader.maxTextures!==e&&(X=new Wt(e),this.shader=X)}destroy(){this.shader=null,super.destroy()}};Gt.extension={type:[w.Batcher],name:`default`};var Kt=Gt,qt=class{constructor(e){this.items=Object.create(null);let{renderer:t,type:n,onUnload:r,priority:i,name:a}=e;this._renderer=t,t.gc.addResourceHash(this,`items`,n,i==null?0:i),this._onUnload=r,this.name=a}add(e){return this.items[e.uid]?!1:(this.items[e.uid]=e,e.once(`unload`,this.remove,this),e._gcLastUsed=this._renderer.gc.now,!0)}remove(e,...t){var n;if(!this.items[e.uid])return;let r=e._gpuData[this._renderer.uid];r&&((n=this._onUnload)==null||n.call(this,e,...t),r.destroy(),e._gpuData[this._renderer.uid]=null,this.items[e.uid]=null)}removeAll(...e){Object.values(this.items).forEach(t=>t&&this.remove(t,...e))}destroy(...e){this.removeAll(...e),this.items=Object.create(null),this._renderer=null,this._onUnload=null}},Jt=`in vec2 vMaskCoord;
in vec2 vTextureCoord;

uniform sampler2D uTexture;
uniform sampler2D uMaskTexture;

uniform float uAlpha;
uniform vec4 uMaskClamp;
uniform float uInverse;
uniform float uChannel;

out vec4 finalColor;

void main(void)
{
    float clip = step(3.5,
        step(uMaskClamp.x, vMaskCoord.x) +
        step(uMaskClamp.y, vMaskCoord.y) +
        step(vMaskCoord.x, uMaskClamp.z) +
        step(vMaskCoord.y, uMaskClamp.w));

    // TODO look into why this is needed
    float npmAlpha = uAlpha;
    vec4 original = texture(uTexture, vTextureCoord);
    vec4 masky = texture(uMaskTexture, vMaskCoord);

    float a;
    if (uChannel == 1.0) {
        a = masky.a * npmAlpha * clip;
    } else {
        float alphaMul = 1.0 - npmAlpha * (1.0 - masky.a);
        a = alphaMul * masky.r * npmAlpha * clip;
    }

    if (uInverse == 1.0) {
        a = 1.0 - a;
    }

    finalColor = original * a;
}
`,Yt=`in vec2 aPosition;

out vec2 vTextureCoord;
out vec2 vMaskCoord;


uniform vec4 uInputSize;
uniform vec4 uOutputFrame;
uniform vec4 uOutputTexture;
uniform mat3 uFilterMatrix;

vec4 filterVertexPosition(  vec2 aPosition )
{
    vec2 position = aPosition * uOutputFrame.zw + uOutputFrame.xy;
       
    position.x = position.x * (2.0 / uOutputTexture.x) - 1.0;
    position.y = position.y * (2.0*uOutputTexture.z / uOutputTexture.y) - uOutputTexture.z;

    return vec4(position, 0.0, 1.0);
}

vec2 filterTextureCoord(  vec2 aPosition )
{
    return aPosition * (uOutputFrame.zw * uInputSize.zw);
}

vec2 getFilterCoord( vec2 aPosition )
{
    return  ( uFilterMatrix * vec3( filterTextureCoord(aPosition), 1.0)  ).xy;
}   

void main(void)
{
    gl_Position = filterVertexPosition(aPosition);
    vTextureCoord = filterTextureCoord(aPosition);
    vMaskCoord = getFilterCoord(aPosition);
}
`,Xt=`struct GlobalFilterUniforms {
  uInputSize:vec4<f32>,
  uInputPixel:vec4<f32>,
  uInputClamp:vec4<f32>,
  uOutputFrame:vec4<f32>,
  uGlobalFrame:vec4<f32>,
  uOutputTexture:vec4<f32>,
};

struct MaskUniforms {
  uFilterMatrix:mat3x3<f32>,
  uMaskClamp:vec4<f32>,
  uAlpha:f32,
  uInverse:f32,
  uChannel:f32,
};

@group(0) @binding(0) var<uniform> gfu: GlobalFilterUniforms;
@group(0) @binding(1) var uTexture: texture_2d<f32>;
@group(0) @binding(2) var uSampler : sampler;

@group(1) @binding(0) var<uniform> filterUniforms : MaskUniforms;
@group(1) @binding(1) var uMaskTexture: texture_2d<f32>;

struct VSOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) uv : vec2<f32>,
    @location(1) filterUv : vec2<f32>,
};

fn filterVertexPosition(aPosition:vec2<f32>) -> vec4<f32>
{
    var position = aPosition * gfu.uOutputFrame.zw + gfu.uOutputFrame.xy;

    position.x = position.x * (2.0 / gfu.uOutputTexture.x) - 1.0;
    position.y = position.y * (2.0*gfu.uOutputTexture.z / gfu.uOutputTexture.y) - gfu.uOutputTexture.z;

    return vec4(position, 0.0, 1.0);
}

fn filterTextureCoord( aPosition:vec2<f32> ) -> vec2<f32>
{
    return aPosition * (gfu.uOutputFrame.zw * gfu.uInputSize.zw);
}

fn globalTextureCoord( aPosition:vec2<f32> ) -> vec2<f32>
{
  return  (aPosition.xy / gfu.uGlobalFrame.zw) + (gfu.uGlobalFrame.xy / gfu.uGlobalFrame.zw);
}

fn getFilterCoord(aPosition:vec2<f32> ) -> vec2<f32>
{
  return ( filterUniforms.uFilterMatrix * vec3( filterTextureCoord(aPosition), 1.0)  ).xy;
}

fn getSize() -> vec2<f32>
{
  return gfu.uGlobalFrame.zw;
}

@vertex
fn mainVertex(
  @location(0) aPosition : vec2<f32>,
) -> VSOutput {
  return VSOutput(
   filterVertexPosition(aPosition),
   filterTextureCoord(aPosition),
   getFilterCoord(aPosition)
  );
}

@fragment
fn mainFragment(
  @location(0) uv: vec2<f32>,
  @location(1) filterUv: vec2<f32>,
  @builtin(position) position: vec4<f32>
) -> @location(0) vec4<f32> {

    var maskClamp = filterUniforms.uMaskClamp;
    var uAlpha = filterUniforms.uAlpha;

    var clip = step(3.5,
      step(maskClamp.x, filterUv.x) +
      step(maskClamp.y, filterUv.y) +
      step(filterUv.x, maskClamp.z) +
      step(filterUv.y, maskClamp.w));

    var mask = textureSample(uMaskTexture, uSampler, filterUv);
    var source = textureSample(uTexture, uSampler, uv);

    var a: f32;
    if (filterUniforms.uChannel == 1.0) {
        a = mask.a * uAlpha * clip;
    } else {
        var alphaMul = 1.0 - uAlpha * (1.0 - mask.a);
        a = alphaMul * mask.r * uAlpha * clip;
    }

    if (filterUniforms.uInverse == 1.0) {
        a = 1.0 - a;
    }

    return source * a;
}
`,Zt=class extends re{constructor(t){let{sprite:n,...r}=t,i=new m(n.texture),a=new ae({uFilterMatrix:{value:new e,type:`mat3x3<f32>`},uMaskClamp:{value:i.uClampFrame,type:`vec4<f32>`},uAlpha:{value:1,type:`f32`},uInverse:{value:+!!t.inverse,type:`f32`},uChannel:{value:+(t.channel===`alpha`),type:`f32`}}),o=de.from({vertex:{source:Xt,entryPoint:`mainVertex`},fragment:{source:Xt,entryPoint:`mainFragment`}}),s=te.from({vertex:Yt,fragment:Jt,name:`mask-filter`});super({...r,gpuProgram:o,glProgram:s,clipToViewport:!1,resources:{filterUniforms:a,uMaskTexture:n.texture.source}}),this.sprite=n,this._textureMatrix=i}set inverse(e){this.resources.filterUniforms.uniforms.uInverse=+!!e}get inverse(){return this.resources.filterUniforms.uniforms.uInverse===1}set channel(e){this.resources.filterUniforms.uniforms.uChannel=+(e===`alpha`)}get channel(){return this.resources.filterUniforms.uniforms.uChannel===1?`alpha`:`red`}apply(e,t,n,r){this._textureMatrix.texture=this.sprite.texture,e.calculateSpriteMatrix(this.resources.filterUniforms.uniforms.uFilterMatrix,this.sprite).prepend(this._textureMatrix.mapCoord),this.resources.uMaskTexture=this.sprite.texture.source,e.applyFilter(this,t,n,r)}};function Qt(e,t,n){let r=(e>>24&255)/255;t[n++]=(e&255)/255*r,t[n++]=(e>>8&255)/255*r,t[n++]=(e>>16&255)/255*r,t[n++]=r}var $t=class{constructor(){this.batcherName=`default`,this.topology=`triangle-list`,this.attributeSize=4,this.indexSize=6,this.packAsQuad=!0,this.roundPixels=0,this._attributeStart=0,this._batcher=null,this._batch=null}get blendMode(){return this.renderable.groupBlendMode}get color(){return this.renderable.groupColorAlpha}reset(){this.renderable=null,this.texture=null,this._batcher=null,this._batch=null,this.bounds=null}destroy(){this.reset()}},en=class e{constructor(e,t){var n,r;this.state=y.for2d(),this._batchersByInstructionSet=Object.create(null),this._activeBatches=Object.create(null),this.renderer=e,this._adaptor=t,(n=(r=this._adaptor).init)==null||n.call(r,this)}static getBatcher(e,t){return new this._availableBatchers[e]({maxTextures:t})}buildStart(e){let t=this._batchersByInstructionSet[e.uid];t||(t=this._batchersByInstructionSet[e.uid]=Object.create(null),t.default||(t.default=new Kt({maxTextures:this.renderer.limits.maxBatchableTextures}))),this._activeBatches=t,this._activeBatch=this._activeBatches.default;for(let e in this._activeBatches)this._activeBatches[e].begin()}addToBatch(t,n){if(this._activeBatch.name!==t.batcherName){this._activeBatch.break(n);let r=this._activeBatches[t.batcherName];r||(r=this._activeBatches[t.batcherName]=e.getBatcher(t.batcherName,this.renderer.limits.maxBatchableTextures),r.begin()),this._activeBatch=r}this._activeBatch.add(t)}break(e){this._activeBatch.break(e)}buildEnd(e){this._activeBatch.break(e);let t=this._activeBatches;for(let e in t){let n=t[e],r=n.geometry;r.indexBuffer.setDataWithSize(n.indexBuffer,n.indexSize,!0),r.buffers[0].setDataWithSize(n.attributeBuffer.float32View,n.attributeSize,!1)}}upload(e){let t=this._batchersByInstructionSet[e.uid];for(let e in t){let n=t[e],r=n.geometry;n.dirty&&(n.dirty=!1,r.buffers[0].update(n.attributeSize*4))}}execute(e){if(e.action===`startBatch`){let t=e.batcher,n=t.geometry,r=t.shader;this._adaptor.start(this,n,r)}this._adaptor.execute(this,e)}destroy(){this.state=null,this.renderer=null,this._adaptor=null;for(let e in this._activeBatches)this._activeBatches[e].destroy();this._activeBatches=null}};en.extension={type:[w.WebGLPipes,w.WebGPUPipes,w.CanvasPipes],name:`batch`},en._availableBatchers=Object.create(null);var tn=en;x.handleByMap(w.Batcher,tn._availableBatchers),x.add(Kt);var nn=new u,rn=class extends c{constructor(){super(),this.filters=[new Zt({sprite:new fe(t.EMPTY),inverse:!1,resolution:`inherit`,antialias:`inherit`})]}get sprite(){return this.filters[0].sprite}set sprite(e){this.filters[0].sprite=e}get inverse(){return this.filters[0].inverse}set inverse(e){this.filters[0].inverse=e}get channel(){return this.filters[0].channel}set channel(e){this.filters[0].channel=e}},an=class{constructor(e){this._activeMaskStage=[],this._renderer=e}push(e,t,n){var r;let i=this._renderer;if(i.renderPipes.batch.break(n),n.add({renderPipeId:`alphaMask`,action:`pushMaskBegin`,mask:e,inverse:t._maskOptions.inverse,canBundle:!1,maskedContainer:t}),e.inverse=t._maskOptions.inverse,e.channel=(r=t._maskOptions.channel)==null?`red`:r,e.renderMaskToTexture){let t=e.mask;t.includeInBuild=!0,t.collectRenderables(n,i,null),t.includeInBuild=!1}i.renderPipes.batch.break(n),n.add({renderPipeId:`alphaMask`,action:`pushMaskEnd`,mask:e,maskedContainer:t,inverse:t._maskOptions.inverse,canBundle:!1})}pop(e,t,n){this._renderer.renderPipes.batch.break(n),n.add({renderPipeId:`alphaMask`,action:`popMaskEnd`,mask:e,inverse:t._maskOptions.inverse,canBundle:!1})}execute(e){let t=this._renderer,r=e.mask.renderMaskToTexture;if(e.action===`pushMaskBegin`){let i=l.get(rn);if(i.inverse=e.inverse,i.channel=e.mask.channel,r){e.mask.mask.measurable=!0;let r=ie(e.mask.mask,!0,nn);e.mask.mask.measurable=!1,r.ceil();let a=t.renderTarget.renderTarget.colorTexture.source,o=n.getOptimalTexture(r.width,r.height,a._resolution,a.antialias);t.renderTarget.push(o,!0),t.globalUniforms.push({offset:r,worldColor:4294967295});let s=i.sprite;s.texture=o,s.worldTransform.tx=r.minX,s.worldTransform.ty=r.minY,this._activeMaskStage.push({filterEffect:i,maskedContainer:e.maskedContainer,filterTexture:o})}else i.sprite=e.mask.mask,this._activeMaskStage.push({filterEffect:i,maskedContainer:e.maskedContainer})}else if(e.action===`pushMaskEnd`){let e=this._activeMaskStage[this._activeMaskStage.length-1];r&&(t.type===T.WEBGL&&t.renderTarget.finishRenderPass(),t.renderTarget.pop(),t.globalUniforms.pop()),t.filter.push({renderPipeId:`filter`,action:`pushFilter`,container:e.maskedContainer,filterEffect:e.filterEffect,canBundle:!1})}else if(e.action===`popMaskEnd`){t.filter.pop();let e=this._activeMaskStage.pop();r&&n.returnTexture(e.filterTexture),l.return(e.filterEffect)}}destroy(){this._renderer=null,this._activeMaskStage=null}};an.extension={type:[w.WebGLPipes,w.WebGPUPipes,w.CanvasPipes],name:`alphaMask`};var on=class{constructor(e){this._colorStack=[],this._colorStackIndex=0,this._currentColor=0,this._renderer=e}buildStart(){this._colorStack[0]=15,this._colorStackIndex=1,this._currentColor=15}push(e,t,n){this._renderer.renderPipes.batch.break(n);let r=this._colorStack;r[this._colorStackIndex]=r[this._colorStackIndex-1]&e.mask;let i=this._colorStack[this._colorStackIndex];i!==this._currentColor&&(this._currentColor=i,n.add({renderPipeId:`colorMask`,colorMask:i,canBundle:!1})),this._colorStackIndex++}pop(e,t,n){this._renderer.renderPipes.batch.break(n);let r=this._colorStack;this._colorStackIndex--;let i=r[this._colorStackIndex-1];i!==this._currentColor&&(this._currentColor=i,n.add({renderPipeId:`colorMask`,colorMask:i,canBundle:!1}))}execute(e){this._renderer.colorMask.setMask(e.colorMask)}destroy(){this._renderer=null,this._colorStack=null}};on.extension={type:[w.WebGLPipes,w.WebGPUPipes],name:`colorMask`};var sn=class{constructor(e){this._maskStackHash={},this._maskHash=new WeakMap,this._renderer=e}push(e,t,n){var r;let i=e,a=this._renderer;a.renderPipes.batch.break(n),a.renderPipes.blendMode.setBlendMode(i.mask,`none`,n),n.add({renderPipeId:`stencilMask`,action:`pushMaskBegin`,mask:e,inverse:t._maskOptions.inverse,canBundle:!1});let o=i.mask;o.includeInBuild=!0,this._maskHash.has(i)||this._maskHash.set(i,{instructionsStart:0,instructionsLength:0});let s=this._maskHash.get(i);s.instructionsStart=n.instructionSize,o.collectRenderables(n,a,null),o.includeInBuild=!1,a.renderPipes.batch.break(n),n.add({renderPipeId:`stencilMask`,action:`pushMaskEnd`,mask:e,inverse:t._maskOptions.inverse,canBundle:!1}),s.instructionsLength=n.instructionSize-s.instructionsStart-1;let c=a.renderTarget.renderTarget.uid;(r=this._maskStackHash)[c]!=null||(r[c]=0)}pop(e,t,n){let r=e,i=this._renderer;i.renderPipes.batch.break(n),i.renderPipes.blendMode.setBlendMode(r.mask,`none`,n),n.add({renderPipeId:`stencilMask`,action:`popMaskBegin`,inverse:t._maskOptions.inverse,canBundle:!1});let a=this._maskHash.get(e);for(let e=0;e<a.instructionsLength;e++)n.instructions[n.instructionSize++]=n.instructions[a.instructionsStart++];n.add({renderPipeId:`stencilMask`,action:`popMaskEnd`,canBundle:!1})}execute(e){var t,n;let r=this._renderer,i=r,a=r.renderTarget.renderTarget.uid,o=(t=(n=this._maskStackHash)[a])==null?n[a]=0:t;e.action===`pushMaskBegin`?(i.renderTarget.ensureDepthStencil(),i.stencil.setStencilMode(U.RENDERING_MASK_ADD,o),o++,i.colorMask.setMask(0)):e.action===`pushMaskEnd`?(e.inverse?i.stencil.setStencilMode(U.INVERSE_MASK_ACTIVE,o):i.stencil.setStencilMode(U.MASK_ACTIVE,o),i.colorMask.setMask(15)):e.action===`popMaskBegin`?(i.colorMask.setMask(0),o===0?(i.renderTarget.clear(null,V.STENCIL),i.stencil.setStencilMode(U.DISABLED,o)):i.stencil.setStencilMode(U.RENDERING_MASK_REMOVE,o),o--):e.action===`popMaskEnd`&&(e.inverse?i.stencil.setStencilMode(U.INVERSE_MASK_ACTIVE,o):i.stencil.setStencilMode(U.MASK_ACTIVE,o),i.colorMask.setMask(15)),this._maskStackHash[a]=o}destroy(){this._renderer=null,this._maskStackHash=null,this._maskHash=null}};sn.extension={type:[w.WebGLPipes,w.WebGPUPipes],name:`stencilMask`};var cn=class{constructor(e){this._renderer=e}updateRenderable(){}destroyRenderable(){}validateRenderable(){return!1}addRenderable(e,t){this._renderer.renderPipes.batch.break(t),t.add(e)}execute(e){e.isRenderable&&e.render(this._renderer)}destroy(){this._renderer=null}};cn.extension={type:[w.WebGLPipes,w.WebGPUPipes,w.CanvasPipes],name:`customRender`};function ln(e,t){let n=e.instructionSet,r=n.instructions;for(let e=0;e<n.instructionSize;e++){let n=r[e];t[n.renderPipeId].execute(n)}}var un=class{constructor(e){this._renderer=e}addRenderGroup(e,t){e.isCachedAsTexture?this._addRenderableCacheAsTexture(e,t):this._addRenderableDirect(e,t)}execute(e){e.isRenderable&&(e.isCachedAsTexture?this._executeCacheAsTexture(e):this._executeDirect(e))}destroy(){this._renderer=null}_addRenderableDirect(e,t){this._renderer.renderPipes.batch.break(t),e._batchableRenderGroup&&(l.return(e._batchableRenderGroup),e._batchableRenderGroup=null),t.add(e)}_addRenderableCacheAsTexture(e,t){var n;let r=(n=e._batchableRenderGroup)==null?e._batchableRenderGroup=l.get($t):n;r.renderable=e.root,r.transform=e.root.relativeGroupTransform,r.texture=e.texture,r.bounds=e._textureBounds,t.add(e),this._renderer.renderPipes.blendMode.pushBlendMode(e,e.root.groupBlendMode,t),this._renderer.renderPipes.batch.addToBatch(r,t),this._renderer.renderPipes.blendMode.popBlendMode(t)}_executeCacheAsTexture(t){if(t.textureNeedsUpdate){t.textureNeedsUpdate=!1;let n=new e().translate(-t._textureBounds.x,-t._textureBounds.y);this._renderer.renderTarget.push(t.texture,!0,null,t.texture.frame),this._renderer.globalUniforms.push({worldTransformMatrix:n,worldColor:4294967295,offset:{x:0,y:0}}),ln(t,this._renderer.renderPipes),this._renderer.renderTarget.finishRenderPass(),this._renderer.renderTarget.pop(),this._renderer.globalUniforms.pop()}t._batchableRenderGroup._batcher.updateElement(t._batchableRenderGroup),t._batchableRenderGroup._batcher.geometry.buffers[0].update()}_executeDirect(e){this._renderer.globalUniforms.push({worldTransformMatrix:e.inverseParentTextureTransform,worldColor:e.worldColorAlpha}),ln(e,this._renderer.renderPipes),this._renderer.globalUniforms.pop()}};un.extension={type:[w.WebGLPipes,w.WebGPUPipes,w.CanvasPipes],name:`renderGroup`};var dn=class{constructor(e){this._renderer=e}addRenderable(e,t){let n=this._getGpuSprite(e);e.didViewUpdate&&this._updateBatchableSprite(e,n),this._renderer.renderPipes.batch.addToBatch(n,t)}updateRenderable(e){let t=this._getGpuSprite(e);e.didViewUpdate&&this._updateBatchableSprite(e,t),t._batcher.updateElement(t)}validateRenderable(e){let t=this._getGpuSprite(e);return!t._batcher.checkAndUpdateTexture(t,e._texture)}_updateBatchableSprite(e,t){t.bounds=e.visualBounds,t.texture=e._texture}_getGpuSprite(e){return e._gpuData[this._renderer.uid]||this._initGPUSprite(e)}_initGPUSprite(e){let t=new $t;return t.renderable=e,t.transform=e.groupTransform,t.texture=e._texture,t.bounds=e.visualBounds,t.roundPixels=this._renderer._roundPixels|e._roundPixels,e._gpuData[this._renderer.uid]=t,t}destroy(){this._renderer=null}};dn.extension={type:[w.WebGLPipes,w.WebGPUPipes,w.CanvasPipes],name:`sprite`};var Z={};x.handle(w.BlendMode,e=>{if(!e.name)throw Error(`BlendMode extension must have a name property`);Z[e.name]=e.ref},e=>{delete Z[e.name]});var fn=class{constructor(e){this._blendModeStack=[],this._isAdvanced=!1,this._filterHash=Object.create(null),this._renderer=e,this._renderer.runners.prerender.add(this)}prerender(){this._activeBlendMode=`normal`,this._isAdvanced=!1}pushBlendMode(e,t,n){this._blendModeStack.push(t),this.setBlendMode(e,t,n)}popBlendMode(e){var t;this._blendModeStack.pop();let n=(t=this._blendModeStack[this._activeBlendMode.length-1])==null?`normal`:t;this.setBlendMode(null,n,e)}setBlendMode(e,t,n){let r=e instanceof d;if(this._activeBlendMode===t){if(this._isAdvanced&&e&&!r){var i;(i=this._renderableList)==null||i.push(e)}return}this._isAdvanced&&this._endAdvancedBlendMode(n),this._activeBlendMode=t,e&&(this._isAdvanced=!!Z[t],this._isAdvanced&&this._beginAdvancedBlendMode(e,n))}_beginAdvancedBlendMode(e,t){this._renderer.renderPipes.batch.break(t);let n=this._activeBlendMode;if(!Z[n]){a(`Unable to assign BlendMode: '${n}'. You may want to include: import 'pixi.js/advanced-blend-modes'`);return}let r=this._ensureFilterEffect(n),i=e instanceof d,o={renderPipeId:`filter`,action:`pushFilter`,filterEffect:r,renderables:i?null:[e],container:i?e.root:null,canBundle:!1};this._renderableList=o.renderables,t.add(o)}_ensureFilterEffect(e){let t=this._filterHash[e];return t||(t=this._filterHash[e]=new c,t.filters=[new Z[e]]),t}_endAdvancedBlendMode(e){this._isAdvanced=!1,this._renderableList=null,this._renderer.renderPipes.batch.break(e),e.add({renderPipeId:`filter`,action:`popFilter`,canBundle:!1})}buildStart(){this._isAdvanced=!1}buildEnd(e){this._isAdvanced&&this._endAdvancedBlendMode(e)}destroy(){this._renderer=null,this._renderableList=null;for(let e in this._filterHash)this._filterHash[e].destroy();this._filterHash=null}};fn.extension={type:[w.WebGLPipes,w.WebGPUPipes,w.CanvasPipes],name:`blendMode`};function pn(e,t){t||(t=0);for(let n=t;n<e.length&&e[n];n++)e[n]=null}var mn=new D,hn=7;function gn(e,t=!1){_n(e);let n=e.childrenToUpdate,r=e.updateTick++;for(let t in n){let i=Number(t),a=n[t],o=a.list,s=a.index;for(let t=0;t<s;t++){let n=o[t];n.parentRenderGroup===e&&n.relativeRenderGroupDepth===i&&vn(n,r,0)}pn(o,s),a.index=0}if(t)for(let n=0;n<e.renderGroupChildren.length;n++)gn(e.renderGroupChildren[n],t)}function _n(e){let t=e.root,n;if(e.renderGroupParent){let i=e.renderGroupParent;e.worldTransform.appendFrom(t.relativeGroupTransform,i.worldTransform),e.worldColor=r(t.groupColor,i.worldColor),n=t.groupAlpha*i.worldAlpha}else e.worldTransform.copyFrom(t.localTransform),e.worldColor=t.localColor,n=t.localAlpha;n=n<0?0:n>1?1:n,e.worldAlpha=n,e.worldColorAlpha=e.worldColor+((n*255|0)<<24)}function vn(e,t,n){if(t===e.updateTick)return;e.updateTick=t,e.didChange=!1;let r=e.localTransform;e.updateLocalTransform();let i=e.parent;if(i&&!i.renderGroup?(n|=e._updateFlags,e.relativeGroupTransform.appendFrom(r,i.relativeGroupTransform),n&hn&&yn(e,i,n)):(n=e._updateFlags,e.relativeGroupTransform.copyFrom(r),n&hn&&yn(e,mn,n)),!e.renderGroup){let r=e.children,i=r.length;for(let e=0;e<i;e++)vn(r[e],t,n);let a=e.parentRenderGroup,o=e;o.renderPipeId&&!a.structureDidChange&&a.updateRenderable(o)}}function yn(e,t,n){if(n&1){e.groupColor=r(e.localColor,t.groupColor);let n=e.localAlpha*t.groupAlpha;n=n<0?0:n>1?1:n,e.groupAlpha=n,e.groupColorAlpha=e.groupColor+((n*255|0)<<24)}n&2&&(e.groupBlendMode=e.localBlendMode===`inherit`?t.groupBlendMode:e.localBlendMode),n&4&&(e.globalDisplayStatus=e.localDisplayStatus&t.globalDisplayStatus),e._updateFlags=0}function bn(e,t){let{list:n}=e.childrenRenderablesToUpdate,r=!1;for(let i=0;i<e.childrenRenderablesToUpdate.index;i++){let e=n[i];if(r=t[e.renderPipeId].validateRenderable(e),r)break}return e.structureDidChange=r,r}var xn=new e,Sn=class{constructor(e){this._renderer=e}render({container:e,transform:t}){let n=e.parent,r=e.renderGroup.renderGroupParent;e.parent=null,e.renderGroup.renderGroupParent=null;let i=this._renderer,a=xn;t&&(a.copyFrom(e.renderGroup.localTransform),e.renderGroup.localTransform.copyFrom(t));let o=i.renderPipes;this._updateCachedRenderGroups(e.renderGroup,null),this._updateRenderGroups(e.renderGroup),i.globalUniforms.start({worldTransformMatrix:t?e.renderGroup.localTransform:e.renderGroup.worldTransform,worldColor:e.renderGroup.worldColorAlpha}),ln(e.renderGroup,o),o.uniformBatch&&o.uniformBatch.renderEnd(),t&&e.renderGroup.localTransform.copyFrom(a),e.parent=n,e.renderGroup.renderGroupParent=r}destroy(){this._renderer=null}_updateCachedRenderGroups(e,t){if(e._parentCacheAsTextureRenderGroup=t,e.isCachedAsTexture){if(!e.textureNeedsUpdate)return;t=e}for(let n=e.renderGroupChildren.length-1;n>=0;n--)this._updateCachedRenderGroups(e.renderGroupChildren[n],t);if(e.invalidateMatrices(),e.isCachedAsTexture){if(e.textureNeedsUpdate){var r,i;let t=e.root.getLocalBounds(),a=this._renderer,o=e.textureOptions.resolution||a.view.resolution,s=(r=e.textureOptions.antialias)==null?a.view.antialias:r,c=(i=e.textureOptions.scaleMode)==null?`linear`:i,l=e.texture;t.ceil(),e.texture&&n.returnTexture(e.texture,!0);let d=n.getOptimalTexture(t.width,t.height,o,s);d._source.style=new h({scaleMode:c}),e.texture=d,e._textureBounds||(e._textureBounds=new u),e._textureBounds.copyFrom(t),l!==e.texture&&e.renderGroupParent&&(e.renderGroupParent.structureDidChange=!0)}}else e.texture&&(n.returnTexture(e.texture,!0),e.texture=null)}_updateRenderGroups(e){let t=this._renderer,n=t.renderPipes;if(e.runOnRender(t),e.instructionSet.renderPipes=n,e.structureDidChange?pn(e.childrenRenderablesToUpdate.list,0):bn(e,n),gn(e),e.structureDidChange?(e.structureDidChange=!1,this._buildInstructions(e,t)):this._updateRenderables(e),e.childrenRenderablesToUpdate.index=0,t.renderPipes.batch.upload(e.instructionSet),!(e.isCachedAsTexture&&!e.textureNeedsUpdate))for(let t=0;t<e.renderGroupChildren.length;t++)this._updateRenderGroups(e.renderGroupChildren[t])}_updateRenderables(e){let{list:t,index:n}=e.childrenRenderablesToUpdate;for(let r=0;r<n;r++){let n=t[r];n.didViewUpdate&&e.updateRenderable(n)}pn(t,n)}_buildInstructions(e,t){let n=e.root,r=e.instructionSet;r.reset();let i=t.renderPipes?t:t.batch.renderer,a=i.renderPipes;a.batch.buildStart(r),a.blendMode.buildStart(),a.colorMask.buildStart(),n.sortableChildren&&n.sortChildren(),n.collectRenderablesWithEffects(r,i,null),a.batch.buildEnd(r),a.blendMode.buildEnd(r)}};Sn.extension={type:[w.WebGLSystem,w.WebGPUSystem,w.CanvasSystem],name:`renderGroup`};var Cn=class e{constructor(){this.clearBeforeRender=!0,this._backgroundColor=new s(0),this.color=this._backgroundColor,this.alpha=1}init(t){t={...e.defaultOptions,...t},this.clearBeforeRender=t.clearBeforeRender,this.color=t.background||t.backgroundColor||this._backgroundColor,this.alpha=t.backgroundAlpha,this._backgroundColor.setAlpha(t.backgroundAlpha)}get color(){return this._backgroundColor}set color(e){s.shared.setValue(e).alpha<1&&this._backgroundColor.alpha===1&&a(`Cannot set a transparent background on an opaque canvas. To enable transparency, set backgroundAlpha < 1 when initializing your Application.`),this._backgroundColor.setValue(e)}get alpha(){return this._backgroundColor.alpha}set alpha(e){this._backgroundColor.setAlpha(e)}get colorRgba(){return this._backgroundColor.toArray()}destroy(){}};Cn.extension={type:[w.WebGLSystem,w.WebGPUSystem,w.CanvasSystem],name:`background`,priority:0},Cn.defaultOptions={backgroundAlpha:1,backgroundColor:0,clearBeforeRender:!0};var wn=Cn,Tn={png:`image/png`,jpg:`image/jpeg`,webp:`image/webp`},En=class e{constructor(e){this._renderer=e}_normalizeOptions(e,n={}){return e instanceof D||e instanceof t?{target:e,...n}:{...n,...e}}async image(e){let t=E.get().createImage();return t.src=await this.base64(e),t}async base64(t){t=this._normalizeOptions(t,e.defaultImageOptions);let{format:n,quality:r}=t,i=this.canvas(t);if(i.toBlob!==void 0)return new Promise((e,t)=>{i.toBlob(n=>{if(!n){t(Error(`ICanvas.toBlob failed!`));return}let r=new FileReader;r.onload=()=>e(r.result),r.onerror=t,r.readAsDataURL(n)},Tn[n],r)});if(i.toDataURL!==void 0)return i.toDataURL(Tn[n],r);if(i.convertToBlob!==void 0){let e=await i.convertToBlob({type:Tn[n],quality:r});return new Promise((t,n)=>{let r=new FileReader;r.onload=()=>t(r.result),r.onerror=n,r.readAsDataURL(e)})}throw Error(`Extract.base64() requires ICanvas.toDataURL, ICanvas.toBlob, or ICanvas.convertToBlob to be implemented`)}canvas(e){e=this._normalizeOptions(e);let n=e.target,r=this._renderer;if(n instanceof t)return r.texture.generateCanvas(n);let i=r.textureGenerator.generateTexture(e),a=r.texture.generateCanvas(i);return i.destroy(!0),a}pixels(e){e=this._normalizeOptions(e);let n=e.target,r=this._renderer,i=n instanceof t?n:r.textureGenerator.generateTexture(e),a=r.texture.getPixels(i);return n instanceof D&&i.destroy(!0),a}texture(e){return e=this._normalizeOptions(e),e.target instanceof t?e.target:this._renderer.textureGenerator.generateTexture(e)}download(e){var t;e=this._normalizeOptions(e);let n=this.canvas(e),r=document.createElement(`a`);r.download=(t=e.filename)==null?`image.png`:t,r.href=n.toDataURL(`image/png`),document.body.appendChild(r),r.click(),document.body.removeChild(r)}log(e){var t;let n=(t=e.width)==null?200:t;e=this._normalizeOptions(e);let r=this.canvas(e),i=r.toDataURL();console.log(`[Pixi Texture] ${r.width}px ${r.height}px`);let a=[`font-size: 1px;`,`padding: ${n}px 300px;`,`background: url(${i}) no-repeat;`,`background-size: contain;`].join(` `);console.log(`%c `,a)}destroy(){this._renderer=null}};En.extension={type:[w.WebGLSystem,w.WebGPUSystem,w.CanvasSystem],name:`extract`},En.defaultImageOptions={format:`png`,quality:1};var Dn=En,On=class e extends t{static create(t){let{dynamic:n,textureOptions:r,...i}=t;return new e({...r,source:new p(i),dynamic:n==null?!1:n})}resize(e,t,n){return this.source.resize(e,t,n),this}},kn=new _,An=new u,jn=[0,0,0,0],Mn=class{constructor(e){this._renderer=e}generateTexture(t){var n;t instanceof D&&(t={target:t,frame:void 0,textureSourceOptions:{},resolution:void 0});let r=t.resolution||this._renderer.resolution,i=t.antialias||this._renderer.view.antialias,a=t.target,o=t.clearColor;o=o?Array.isArray(o)&&o.length===4?o:s.shared.setValue(o).toArray():jn;let c=((n=t.frame)==null?void 0:n.copyTo(kn))||f(a,An).rectangle,l=t.defaultAnchor&&{defaultAnchor:t.defaultAnchor};c.width=Math.max(c.width,1/r)|0,c.height=Math.max(c.height,1/r)|0;let u=On.create({...t.textureSourceOptions,width:c.width,height:c.height,resolution:r,antialias:i,textureOptions:l}),d=e.shared.translate(-c.x,-c.y);return this._renderer.render({container:a,transform:d,target:u,clearColor:o}),u.source.updateMipmaps(),u}destroy(){this._renderer=null}};Mn.extension={type:[w.WebGLSystem,w.WebGPUSystem,w.CanvasSystem],name:`textureGenerator`};function Nn(e){let t=!1;for(let n in e)if(e[n]==null){t=!0;break}if(!t)return e;let n=Object.create(null);for(let t in e){let r=e[t];r&&(n[t]=r)}return n}function Pn(e){let t=0;for(let n=0;n<e.length;n++)e[n]==null?t++:e[n-t]=e[n];return e.length-=t,e}var Fn=class e{constructor(e){this._managedResources=[],this._managedResourceHashes=[],this._managedCollections=[],this._ready=!1,this._renderer=e}init(t){t={...e.defaultOptions,...t},this.maxUnusedTime=t.gcMaxUnusedTime,this._frequency=t.gcFrequency,this.enabled=t.gcActive,this.now=performance.now()}get enabled(){return!!this._handler}set enabled(e){this.enabled!==e&&(e?(this._handler=this._renderer.scheduler.repeat(()=>{this._ready=!0},this._frequency,!1),this._collectionsHandler=this._renderer.scheduler.repeat(()=>{for(let e of this._managedCollections){let{context:t,collection:n,type:r}=e;r===`hash`?t[n]=Nn(t[n]):t[n]=Pn(t[n])}},this._frequency)):(this._renderer.scheduler.cancel(this._handler),this._renderer.scheduler.cancel(this._collectionsHandler),this._handler=0,this._collectionsHandler=0))}prerender({container:e}){this.now=performance.now(),e.renderGroup.gcTick=this._renderer.tick++,this._updateInstructionGCTick(e.renderGroup,e.renderGroup.gcTick)}postrender(){!this._ready||!this.enabled||(this.run(),this._ready=!1)}_updateInstructionGCTick(e,t){e.instructionSet.gcTick=t,e.gcTick=t;for(let n of e.renderGroupChildren)this._updateInstructionGCTick(n,t)}addCollection(e,t,n){this._managedCollections.push({context:e,collection:t,type:n})}addResource(e,t){var n;if(e._gcLastUsed!==-1){var r;e._gcLastUsed=this.now,(r=e._onTouch)==null||r.call(e,this.now);return}e._gcData={index:this._managedResources.length,type:t},e._gcLastUsed=this.now,(n=e._onTouch)==null||n.call(e,this.now),e.once(`unload`,this.removeResource,this),this._managedResources.push(e)}removeResource(e){let t=e._gcData;if(!t)return;let n=t.index,r=this._managedResources.length-1;if(n!==r){let e=this._managedResources[r];this._managedResources[n]=e,e._gcData.index=n}this._managedResources.length--,e._gcData=null,e._gcLastUsed=-1}addResourceHash(e,t,n,r=0){this._managedResourceHashes.push({context:e,hash:t,type:n,priority:r}),this._managedResourceHashes.sort((e,t)=>e.priority-t.priority)}run(){let e=performance.now(),t=this._managedResourceHashes;for(let n of t)this.runOnHash(n,e);let n=0;for(let t=0;t<this._managedResources.length;t++){let r=this._managedResources[t];n=this.runOnResource(r,e,n)}this._managedResources.length=n}updateRenderableGCTick(e,t){var n,r,i,a;let o=(n=e.renderGroup)==null?e.parentRenderGroup:n,s=(r=o==null||(i=o.instructionSet)==null?void 0:i.gcTick)==null?-1:r;if(((a=o==null?void 0:o.gcTick)==null?0:a)===s){var c;e._gcLastUsed=t,(c=e._onTouch)==null||c.call(e,t)}}runOnResource(e,t,n){let r=e._gcData;return r.type===`renderable`&&this.updateRenderableGCTick(e,t),t-e._gcLastUsed<this.maxUnusedTime||!e.autoGarbageCollect?(this._managedResources[n]=e,r.index=n,n++):(e.unload(),e._gcData=null,e._gcLastUsed=-1,e.off(`unload`,this.removeResource,this)),n}_createHashClone(e,t){let n=Object.create(null);for(let r in e){if(r===t)break;e[r]!==null&&(n[r]=e[r])}return n}runOnHash(e,t){let{context:n,hash:r,type:i}=e,a=n[r],o=null,s=0;for(let e in a){let n=a[e];if(n===null){s++,s===1e4&&!o&&(o=this._createHashClone(a,e));continue}if(n._gcLastUsed===-1){var c;n._gcLastUsed=t,(c=n._onTouch)==null||c.call(n,t),o&&(o[e]=n);continue}if(i===`renderable`&&this.updateRenderableGCTick(n,t),!(t-n._gcLastUsed<this.maxUnusedTime)&&n.autoGarbageCollect){if(i===`renderable`){var l;let e=n,t=(l=e.renderGroup)==null?e.parentRenderGroup:l;t&&(t.structureDidChange=!0)}n.unload(),n._gcData=null,n._gcLastUsed=-1,o||(s+1===1e4?o=this._createHashClone(a,e):(a[e]=null,s++))}else o&&(o[e]=n)}o&&(n[r]=o)}destroy(){this.enabled=!1,this._managedResources.forEach(e=>{e.off(`unload`,this.removeResource,this)}),this._managedResources.length=0,this._managedResourceHashes.length=0,this._managedCollections.length=0,this._renderer=null}};Fn.extension={type:[w.WebGLSystem,w.WebGPUSystem,w.CanvasSystem],name:`gc`,priority:0},Fn.defaultOptions={gcActive:!0,gcMaxUnusedTime:6e4,gcFrequency:3e4};var In=Fn,Ln=class{constructor(e){this._stackIndex=0,this._globalUniformDataStack=[],this._uniformsPool=[],this._activeUniforms=[],this._bindGroupPool=[],this._activeBindGroups=[],this._renderer=e}reset(){this._stackIndex=0;for(let e=0;e<this._activeUniforms.length;e++)this._uniformsPool.push(this._activeUniforms[e]);for(let e=0;e<this._activeBindGroups.length;e++)this._bindGroupPool.push(this._activeBindGroups[e]);this._activeUniforms.length=0,this._activeBindGroups.length=0}start(e){this.reset(),this.push(e)}bind({size:t,projectionMatrix:n,worldTransformMatrix:r,worldColor:i,offset:a}){let o=this._renderer.renderTarget.renderTarget,s=this._stackIndex?this._globalUniformDataStack[this._stackIndex-1]:{projectionData:o,worldTransformMatrix:new e,worldColor:4294967295,offset:new ee},c={projectionMatrix:n||this._renderer.renderTarget.projectionMatrix,resolution:t||o.size,worldTransformMatrix:r||s.worldTransformMatrix,worldColor:i||s.worldColor,offset:a||s.offset,bindGroup:null},l=this._uniformsPool.pop()||this._createUniforms();this._activeUniforms.push(l);let u=l.uniforms;u.uProjectionMatrix=c.projectionMatrix,u.uResolution=c.resolution,u.uWorldTransformMatrix.copyFrom(c.worldTransformMatrix),u.uWorldTransformMatrix.tx-=c.offset.x,u.uWorldTransformMatrix.ty-=c.offset.y,Qt(c.worldColor,u.uWorldColorAlpha,0),l.update();let d;this._renderer.renderPipes.uniformBatch?d=this._renderer.renderPipes.uniformBatch.getUniformBindGroup(l,!1):(d=this._bindGroupPool.pop()||new b,this._activeBindGroups.push(d),d.setResource(l,0)),c.bindGroup=d,this._currentGlobalUniformData=c}push(e){this.bind(e),this._globalUniformDataStack[this._stackIndex++]=this._currentGlobalUniformData}pop(){this._currentGlobalUniformData=this._globalUniformDataStack[--this._stackIndex-1],this._renderer.type===T.WEBGL&&this._currentGlobalUniformData.bindGroup.resources[0].update()}get bindGroup(){return this._currentGlobalUniformData.bindGroup}get globalUniformData(){return this._currentGlobalUniformData}get uniformGroup(){return this._currentGlobalUniformData.bindGroup.resources[0]}_createUniforms(){return new ae({uProjectionMatrix:{value:new e,type:`mat3x3<f32>`},uWorldTransformMatrix:{value:new e,type:`mat3x3<f32>`},uWorldColorAlpha:{value:new Float32Array(4),type:`vec4<f32>`},uResolution:{value:[0,0],type:`vec2<f32>`}},{isStatic:!0})}destroy(){this._renderer=null,this._globalUniformDataStack.length=0,this._uniformsPool.length=0,this._activeUniforms.length=0,this._bindGroupPool.length=0,this._activeBindGroups.length=0,this._currentGlobalUniformData=null}};Ln.extension={type:[w.WebGLSystem,w.WebGPUSystem,w.CanvasSystem],name:`globalUniforms`};var Rn=1,zn=class{constructor(){this._tasks=[],this._offset=0}init(){ne.system.add(this._update,this)}repeat(e,t,n=!0){let r=Rn++,i=0;return n&&(this._offset+=1e3,i=this._offset),this._tasks.push({func:e,duration:t,start:performance.now(),offset:i,last:performance.now(),repeat:!0,id:r}),r}cancel(e){for(let t=0;t<this._tasks.length;t++)if(this._tasks[t].id===e){this._tasks.splice(t,1);return}}_update(){let e=performance.now();for(let t=0;t<this._tasks.length;t++){let n=this._tasks[t];if(e-n.offset-n.last>=n.duration){let t=e-n.start;n.func(t),n.last=e}}}destroy(){ne.system.remove(this._update,this),this._tasks.length=0}};zn.extension={type:[w.WebGLSystem,w.WebGPUSystem,w.CanvasSystem],name:`scheduler`,priority:0};var Bn=!1;function Vn(e){if(!Bn){if(E.get().getNavigator().userAgent.toLowerCase().indexOf(`chrome`)>-1){let t=[`%c  %c  %c  %c  %c PixiJS %c v${He} (${e}) http://www.pixijs.com/

`,`background: #E72264; padding:5px 0;`,`background: #6CA2EA; padding:5px 0;`,`background: #B5D33D; padding:5px 0;`,`background: #FED23F; padding:5px 0;`,`color: #FFFFFF; background: #E72264; padding:5px 0;`,`color: #E72264; background: #FFFFFF; padding:5px 0;`];globalThis.console.log(...t)}else globalThis.console&&globalThis.console.log(`PixiJS ${He} - ${e} - http://www.pixijs.com/`);Bn=!0}}var Q=class{constructor(e){this._renderer=e}init(e){if(e.hello){let e=this._renderer.name;this._renderer.type===T.WEBGL&&(e+=` ${this._renderer.context.webGLVersion}`),Vn(e)}}};Q.extension={type:[w.WebGLSystem,w.WebGPUSystem,w.CanvasSystem],name:`hello`,priority:-2},Q.defaultOptions={hello:!1};var Hn=class e{constructor(e){this._renderer=e}init(t){t={...e.defaultOptions,...t},this.maxUnusedTime=t.renderableGCMaxUnusedTime}get enabled(){return S(`8.15.0`,`RenderableGCSystem.enabled is deprecated, please use the GCSystem.enabled instead.`),this._renderer.gc.enabled}set enabled(e){S(`8.15.0`,`RenderableGCSystem.enabled is deprecated, please use the GCSystem.enabled instead.`),this._renderer.gc.enabled=e}addManagedHash(e,t){S(`8.15.0`,`RenderableGCSystem.addManagedHash is deprecated, please use the GCSystem.addCollection instead.`),this._renderer.gc.addCollection(e,t,`hash`)}addManagedArray(e,t){S(`8.15.0`,`RenderableGCSystem.addManagedArray is deprecated, please use the GCSystem.addCollection instead.`),this._renderer.gc.addCollection(e,t,`array`)}addRenderable(e){S(`8.15.0`,`RenderableGCSystem.addRenderable is deprecated, please use the GCSystem instead.`),this._renderer.gc.addResource(e,`renderable`)}run(){S(`8.15.0`,`RenderableGCSystem.run is deprecated, please use the GCSystem instead.`),this._renderer.gc.run()}destroy(){this._renderer=null}};Hn.extension={type:[w.WebGLSystem,w.WebGPUSystem,w.CanvasSystem],name:`renderableGC`,priority:0},Hn.defaultOptions={renderableGCActive:!0,renderableGCMaxUnusedTime:6e4,renderableGCFrequency:3e4};var Un=Hn,Wn=class e{get count(){return this._renderer.tick}get checkCount(){return this._checkCount}set checkCount(e){S(`8.15.0`,`TextureGCSystem.run is deprecated, please use the GCSystem instead.`),this._checkCount=e}get maxIdle(){return this._renderer.gc.maxUnusedTime/1e3*60}set maxIdle(e){S(`8.15.0`,`TextureGCSystem.run is deprecated, please use the GCSystem instead.`),this._renderer.gc.maxUnusedTime=e/60*1e3}get checkCountMax(){return Math.floor(this._renderer.gc._frequency/1e3)}set checkCountMax(e){S(`8.15.0`,`TextureGCSystem.run is deprecated, please use the GCSystem instead.`)}get active(){return this._renderer.gc.enabled}set active(e){S(`8.15.0`,`TextureGCSystem.run is deprecated, please use the GCSystem instead.`),this._renderer.gc.enabled=e}constructor(e){this._renderer=e,this._checkCount=0}init(t){t.textureGCActive!==e.defaultOptions.textureGCActive&&(this.active=t.textureGCActive),t.textureGCMaxIdle!==e.defaultOptions.textureGCMaxIdle&&(this.maxIdle=t.textureGCMaxIdle),t.textureGCCheckCountMax!==e.defaultOptions.textureGCCheckCountMax&&(this.checkCountMax=t.textureGCCheckCountMax)}run(){S(`8.15.0`,`TextureGCSystem.run is deprecated, please use the GCSystem instead.`),this._renderer.gc.run()}destroy(){this._renderer=null}};Wn.extension={type:[w.WebGLSystem,w.WebGPUSystem],name:`textureGC`},Wn.defaultOptions={textureGCActive:!0,textureGCAMaxIdle:null,textureGCMaxIdle:3600,textureGCCheckCountMax:600};var Gn=Wn,Kn=class e{constructor(n={}){if(this.uid=g(`renderTarget`),this.colorTextures=[],this.dirtyId=0,this.isRoot=!1,this._size=new Float32Array(2),this._managedColorTextures=!1,n={...e.defaultOptions,...n},this.stencil=n.stencil,this.depth=n.depth,this.isRoot=n.isRoot,typeof n.colorTextures==`number`){this._managedColorTextures=!0;for(let e=0;e<n.colorTextures;e++)this.colorTextures.push(new p({width:n.width,height:n.height,resolution:n.resolution,antialias:n.antialias}))}else{this.colorTextures=[...n.colorTextures.map(e=>e.source)];let e=this.colorTexture.source;this.resize(e.width,e.height,e._resolution)}this.colorTexture.source.on(`resize`,this.onSourceResize,this),(n.depthStencilTexture||this.stencil)&&(n.depthStencilTexture instanceof t||n.depthStencilTexture instanceof p?this.depthStencilTexture=n.depthStencilTexture.source:this.ensureDepthStencilTexture())}get size(){let e=this._size;return e[0]=this.pixelWidth,e[1]=this.pixelHeight,e}get width(){return this.colorTexture.source.width}get height(){return this.colorTexture.source.height}get pixelWidth(){return this.colorTexture.source.pixelWidth}get pixelHeight(){return this.colorTexture.source.pixelHeight}get resolution(){return this.colorTexture.source._resolution}get colorTexture(){return this.colorTextures[0]}onSourceResize(e){this.resize(e.width,e.height,e._resolution,!0)}ensureDepthStencilTexture(){this.depthStencilTexture||(this.depthStencilTexture=new p({width:this.width,height:this.height,resolution:this.resolution,format:`depth24plus-stencil8`,autoGenerateMipmaps:!1,antialias:!1,mipLevelCount:1}))}resize(e,t,n=this.resolution,r=!1){this.dirtyId++,this.colorTextures.forEach((i,a)=>{r&&a===0||i.source.resize(e,t,n)}),this.depthStencilTexture&&this.depthStencilTexture.source.resize(e,t,n)}destroy(){this.colorTexture.source.off(`resize`,this.onSourceResize,this),this._managedColorTextures&&this.colorTextures.forEach(e=>{e.destroy()}),this.depthStencilTexture&&(this.depthStencilTexture.destroy(),delete this.depthStencilTexture)}};Kn.defaultOptions={width:0,height:0,resolution:1,colorTextures:1,stencil:!1,depth:!1,antialias:!1,isRoot:!1};var qn=Kn,$=new Map;i.register($);function Jn(e,n){if(!$.has(e)){let r=new t({source:new v({resource:e,...n})}),i=()=>{$.get(e)===r&&$.delete(e)};r.once(`destroy`,i),r.source.once(`destroy`,i),$.set(e,r)}return $.get(e)}var Yn=class e{get autoDensity(){return this.texture.source.autoDensity}set autoDensity(e){this.texture.source.autoDensity=e}get resolution(){return this.texture.source._resolution}set resolution(e){this.texture.source.resize(this.texture.source.width,this.texture.source.height,e)}init(t){t={...e.defaultOptions,...t},t.view&&(S(o,`ViewSystem.view has been renamed to ViewSystem.canvas`),t.canvas=t.view),this.screen=new _(0,0,t.width,t.height),this.canvas=t.canvas||E.get().createCanvas(),this.antialias=!!t.antialias,this.texture=Jn(this.canvas,t),this.renderTarget=new qn({colorTextures:[this.texture],depth:!!t.depth,isRoot:!0}),this.texture.source.transparent=t.backgroundAlpha<1,this.resolution=t.resolution}resize(e,t,n){this.texture.source.resize(e,t,n),this.screen.width=this.texture.frame.width,this.screen.height=this.texture.frame.height}destroy(e=!1){(typeof e==`boolean`?e:e!=null&&e.removeView)&&this.canvas.parentNode&&this.canvas.parentNode.removeChild(this.canvas),this.texture.destroy()}};Yn.extension={type:[w.WebGLSystem,w.WebGPUSystem,w.CanvasSystem],name:`view`,priority:0},Yn.defaultOptions={width:800,height:600,autoDensity:!1,antialias:!1};var Xn=[wn,Ln,Q,Yn,Sn,In,Gn,Mn,Dn,We,Un,zn],Zn=[fn,tn,dn,un,an,sn,on,cn];function Qn(e,t,n,r,i,a){let o=a?1:-1;return e.identity(),e.a=1/r*2,e.d=o*(1/i*2),e.tx=-1-t*e.a,e.ty=-o-n*e.d,e}function $n(e){let t=e.colorTexture.source.resource;return globalThis.HTMLCanvasElement&&t instanceof HTMLCanvasElement&&document.body.contains(t)}var er=class{constructor(t){this.rootViewPort=new _,this.viewport=new _,this.mipLevel=0,this.layer=0,this.onRenderTargetChange=new Re(`onRenderTargetChange`),this.projectionMatrix=new e,this.defaultClearColor=[0,0,0,0],this._renderSurfaceToRenderTargetHash=new Map,this._gpuRenderTargetHash=Object.create(null),this._renderTargetStack=[],this._renderer=t,t.gc.addCollection(this,`_gpuRenderTargetHash`,`hash`)}finishRenderPass(){this.adaptor.finishRenderPass(this.renderTarget)}renderStart({target:e,clear:t,clearColor:n,frame:r,mipLevel:i,layer:a}){var o,s;this._renderTargetStack.length=0,this.push(e,t,n,r,i==null?0:i,a==null?0:a),this.rootViewPort.copyFrom(this.viewport),this.rootRenderTarget=this.renderTarget,this.renderingToScreen=$n(this.rootRenderTarget),(o=(s=this.adaptor).prerender)==null||o.call(s,this.rootRenderTarget)}postrender(){var e,t;(e=(t=this.adaptor).postrender)==null||e.call(t,this.rootRenderTarget)}bind(e,n=!0,r,i,a=0,o=0){let s=this.getRenderTarget(e),c=this.renderTarget!==s;this.renderTarget=s,this.renderSurface=e;let l=this.getGpuRenderTarget(s);(s.pixelWidth!==l.width||s.pixelHeight!==l.height)&&(this.adaptor.resizeGpuRenderTarget(s),l.width=s.pixelWidth,l.height=s.pixelHeight);let u=s.colorTexture,d=this.viewport,f=u.arrayLayerCount||1;if((o|0)!==o&&(o|=0),o<0||o>=f)throw Error(`[RenderTargetSystem] layer ${o} is out of bounds (arrayLayerCount=${f}).`);this.mipLevel=a|0,this.layer=o|0;let p=Math.max(u.pixelWidth>>a,1),m=Math.max(u.pixelHeight>>a,1);if(!i&&e instanceof t&&(i=e.frame),i){let e=u._resolution,t=1<<Math.max(a|0,0),n=i.x*e+.5|0,r=i.y*e+.5|0,o=i.width*e+.5|0,s=i.height*e+.5|0,c=Math.floor(n/t),l=Math.floor(r/t),f=Math.ceil(o/t),h=Math.ceil(s/t);c=Math.min(Math.max(c,0),p-1),l=Math.min(Math.max(l,0),m-1),f=Math.min(Math.max(f,1),p-c),h=Math.min(Math.max(h,1),m-l),d.x=c,d.y=l,d.width=f,d.height=h}else d.x=0,d.y=0,d.width=p,d.height=m;return Qn(this.projectionMatrix,0,0,d.width/u.resolution,d.height/u.resolution,!s.isRoot),this.adaptor.startRenderPass(s,n,r,d,a,o),c&&this.onRenderTargetChange.emit(s),s}clear(e,t=V.ALL,n,r=this.mipLevel,i=this.layer){t&&(e&&(e=this.getRenderTarget(e)),this.adaptor.clear(e||this.renderTarget,t,n,this.viewport,r,i))}contextChange(){this._gpuRenderTargetHash=Object.create(null)}push(e,t=V.ALL,n,r,i=0,a=0){let o=this.bind(e,t,n,r,i,a);return this._renderTargetStack.push({renderTarget:o,frame:r,mipLevel:i,layer:a}),o}pop(){this._renderTargetStack.pop();let e=this._renderTargetStack[this._renderTargetStack.length-1];this.bind(e.renderTarget,!1,null,e.frame,e.mipLevel,e.layer)}getRenderTarget(e){var t;return e.isTexture&&(e=e.source),(t=this._renderSurfaceToRenderTargetHash.get(e))==null?this._initRenderTarget(e):t}copyToTexture(e,t,n,r,i){n.x<0&&(r.width+=n.x,i.x-=n.x,n.x=0),n.y<0&&(r.height+=n.y,i.y-=n.y,n.y=0);let{pixelWidth:a,pixelHeight:o}=e;return r.width=Math.min(r.width,a-n.x),r.height=Math.min(r.height,o-n.y),this.adaptor.copyToTexture(e,t,n,r,i)}ensureDepthStencil(){this.renderTarget.stencil||(this.renderTarget.stencil=!0,this.adaptor.startRenderPass(this.renderTarget,!1,null,this.viewport,0,this.layer))}destroy(){this._renderer=null,this._renderSurfaceToRenderTargetHash.forEach((e,t)=>{e!==t&&e.destroy()}),this._renderSurfaceToRenderTargetHash.clear(),this._gpuRenderTargetHash=Object.create(null)}_initRenderTarget(e){let t=null;return v.test(e)&&(e=Jn(e).source),e instanceof qn?t=e:e instanceof p&&(t=new qn({colorTextures:[e]}),e.source instanceof v&&(t.isRoot=!0),e.once(`destroy`,()=>{t.destroy(),this._renderSurfaceToRenderTargetHash.delete(e);let n=this._gpuRenderTargetHash[t.uid];n&&(this._gpuRenderTargetHash[t.uid]=null,this.adaptor.destroyGpuRenderTarget(n))})),this._renderSurfaceToRenderTargetHash.set(e,t),t}getGpuRenderTarget(e){return this._gpuRenderTargetHash[e.uid]||(this._gpuRenderTargetHash[e.uid]=this.adaptor.initGpuRenderTarget(e))}resetState(){this.renderTarget=null,this.renderSurface=null}};export{me as A,Xe as C,Ve as D,Ue as E,V as O,kt as S,H as T,It as _,dn as a,Mt as b,an as c,Qt as d,qt as f,Vt as g,Bt as h,fn as i,Le as k,tn as l,Ut as m,Zn as n,un as o,Kt as p,Xn as r,cn as s,er as t,$t as u,zt as v,U as w,At as x,jt as y};