import{q as e}from"./vendor-react-nkjetNgR.js";import{a as t,b as n,l as r}from"./vendor-DVTe_ucZ.js";const s={query:o,get:function(e,t){return o(e).then((n=>{const r=n.find((e=>e._id===t));if(!r)throw new Error(`Get failed, cannot find entity with id: ${t} in: ${e}`);return r}))},post:function(e,t){return t._id=c(),o(e).then((n=>(n.push(t),a(e,n),t)))},put:function(e,t){return o(e).then((n=>{const r=n.findIndex((e=>e._id===t._id));if(r<0)throw new Error(`Update failed, cannot find entity with id: ${t._id} in: ${e}`);const s={...n[r],...t};return n.splice(r,1,s),a(e,n),s}))},remove:function(e,t){return o(e).then((n=>{const r=n.findIndex((e=>e._id===t));if(r<0)throw new Error(`Remove failed, cannot find entity with id: ${t} in: ${e}`);n.splice(r,1),a(e,n)}))}};function o(e,t=500){var n=JSON.parse(localStorage.getItem(e))||[];return new Promise((e=>setTimeout((()=>e(n)),t)))}function a(e,t){localStorage.setItem(e,JSON.stringify(t))}function c(e=5){for(var t="",n="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",r=0;r<e;r++)t+=n.charAt(Math.floor(62*Math.random()));return t}const i="loggedinUser",u={login:async function(e){const t=(await s.query("user")).find((t=>t.username===e.username));if(t)return d(t)},logout:async function(){sessionStorage.removeItem(i)},signup:async function(e){e.imgUrl||(e.imgUrl="https://cdn.pixabay.com/photo/2020/07/01/12/58/icon-5359553_1280.png");e.score=1e4;return d(await s.post("user",e))},getUsers:function(){return s.query("user")},getById:async function(e){return await s.get("user",e)},remove:function(e){return s.remove("user",e)},update:async function({_id:e,score:t}){const n=await s.get("user",e);n.score=t,await s.put("user",n);l()._id===n._id&&d(n);return n},getLoggedinUser:l};function l(){return JSON.parse(sessionStorage.getItem(i))}function d(e){return e={_id:e._id,fullname:e.fullname,imgUrl:e.imgUrl,score:e.score,isAdmin:e.isAdmin},sessionStorage.setItem(i,JSON.stringify(e)),e}const y=t.create({withCredentials:!0}),f={get:(e,t)=>m(e,"GET",t),post:(e,t)=>m(e,"POST",t),put:(e,t)=>m(e,"PUT",t),delete:(e,t)=>m(e,"DELETE",t)};async function m(e,t="GET",n=null){const r={url:`/api/${e}`,method:t,data:n,params:"GET"===t?n:null};try{return(await y(r)).data}catch(s){throw s.response&&401===s.response.status&&(sessionStorage.clear(),window.location.assign("/")),s}}const h="loggedinUser",p={login:async function(e){const t=await f.post("auth/login",e);if(t)return function(e){return e={_id:e._id,username:e.username,name:e.name,isAdmin:e.isAdmin},sessionStorage.setItem(h,JSON.stringify(e)),e}(t)},logout:async function(){return sessionStorage.removeItem(h),await f.post("auth/logout")},getLoggedinUser:function(){return JSON.parse(sessionStorage.getItem(h))}};const{VITE_LOCAL:E}={},g={..."true"===E?u:p},w="SET_USER",_={count:10,user:g.getLoggedinUser(),users:[],watchedUser:null};const S="LOADING_START",v="LOADING_DONE",O="SET_FILTER_BY",I={isLoading:!1,filterBy:{name:(null==(T=g.getLoggedinUser())?void 0:T.name)||"",username:(null==(U=g.getLoggedinUser())?void 0:U.username)||""}};var T,U;function L(e){return P.dispatch({type:O,filterBy:e})}function D(){return P.dispatch({type:S})}function b(){return P.dispatch({type:v})}const R="SET_EMPLOYEES",F="REMOVE_EMPLOYEE",M="ADD_EMPLOYEE",A="UPDATE_EMPLOYEE",C={employees:[],employee:null,error:null};const N="SET_SCHEDULES",k="UPDATE_SCHEDULE",$={schedule:{branchId:"",branchName:"",days:[]},schedules:[],error:null};const P=r(n({userModule:function(e=_,t){var n=e;switch(t.type){case"INCREMENT":n={...e,count:e.count+1};break;case"DECREMENT":n={...e,count:e.count-1};break;case"CHANGE_COUNT":n={...e,count:e.count+t.diff};break;case w:n={...e,user:t.user};break;case"SET_WATCHED_USER":n={...e,watchedUser:t.user};break;case"REMOVE_USER":n={...e,users:e.users.filter((e=>e._id!==t.userId))};break;case"SET_USERS":n={...e,users:t.users};break;case"SET_SCORE":n={...e,user:{...e.user,score:t.score}}}return n},employeeModule:function(e=C,t){var n,r=e;switch(t.type){case R:r={...e,employees:t.employees};break;case"SET_EMPLOYEE":r={...e,employee:t.employee};break;case F:const s=e.employees.find((e=>e.id===t.employeeId));n=e.employees.filter((e=>e.id!==t.employeeId)),r={...e,employees:n,lastRemovedEmployee:s};break;case M:r={...e,employees:[...e.employees,t.employee]};break;case A:n=e.employees.map((e=>e.id===t.employee.id?t.employee:e)),r={...e,employees:n};break;case"SET_ERROR":r={...e,error:t.error}}return r},systemModule:function(e=I,t={}){switch(t.type){case O:return{...e,filterBy:t.filterBy};case S:return{...e,isLoading:!0};case v:return{...e,isLoading:!1};default:return e}},scheduleModule:function(e=$,t){var n,r=e;switch(t.type){case N:r={...e,schedules:t.schedules};break;case"SET_SCHEDULE":r={...e,schedule:t.schedule};break;case"REMOVE_SCHEDULE":const s=e.find((e=>e.id===t.scheduleId));n=e.schedules.filter((e=>e.id!==t.scheduleId)),r={...e,schedules:n,lastRemovedSchedule:s};break;case"ADD_SCHEDULE":r={...e,schedules:[...e.schedules,t.schedule]};break;case k:r={...e,schedules:{...e.schedules,...t.schedule}};break;case"ADD_SCHEDULE_MSG":r={...e,schedule:{...e.schedule,msgs:[...e.schedule.msgs||[],t.msg]}};break;case"SET_ERROR":r={...e,error:t.error}}return r}}),window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__?window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__():void 0);async function q(e){try{const t=await g.login(e);return P.dispatch({type:w,user:t}),t}catch(t){throw t}}async function B(){try{await g.logout(),P.dispatch({type:w,user:null})}catch(e){throw e}}function G(e=5){var t="",n="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";for(let r=0;r<e;r++)t+=n.charAt(Math.floor(62*Math.random()));return t}function H(){const e=["#FF0000","#0000FF","#008000","#FFFF00","#800080","#FFA500","#FFC0CB","#A52A2A","#808080","#000000","#FFFFFF"];return e[Math.floor(Math.random()*e.length)]}const J="employee";x();const V={query:async function(e={name:""}){var t=await s.query(J);t.length||(t=x());const{name:n}=e;if(n){const n=new RegExp(e.name,"i");t=t.filter((e=>n.test(e.name)))}return t=t.map((({_id:e,name:t,color:n})=>({_id:e,name:t,color:n})))},getById:function(e){return s.get(J,e)},save:async function(e){var t;if(e._id){const n={_id:e._id,color:e.color,name:e.name};t=await s.put(J,n)}else{const n={color:e.color,name:e.name};t=await s.post(J,n)}return t},remove:async function(e){await s.remove(J,e)}};function x(){let e=s.query();if(!e.length){e=[];for(let t=0;t<10;t++)e.push({_id:G(),name:`Employee ${t}`,color:H()});localStorage.setItem(J,JSON.stringify(e))}}window.cs=V;const Y={query:async function(e={name:"",branch:"",sortField:"",sortDir:""}){return f.get("employee",e)},getById:function(e){return f.get(`employee/${e}`)},save:async function(e){var t;t=e.id?await f.put(`employee/${e.id}`,e):await f.post("employee",e);return t},remove:async function(e){return f.delete(`employee/${e}`)}};const{VITE_LOCAL:X}={};const j={getEmptyEmployee:function(){return{name:G()}},getDefaultFilter:function(){return{txt:"",sortField:"",sortDir:""}},..."true"===X?V:Y};async function W(e){try{D();const t=await j.query({...e});P.dispatch(function(e){return{type:R,employees:e}}(t))}catch(t){throw t}finally{b()}}async function z(e){try{D(),await j.remove(e),P.dispatch(function(e){return{type:F,employeeId:e}}(e))}catch(t){throw t}finally{b()}}async function K(e){try{D();const t=await j.save(e);return P.dispatch(function(e){return{type:M,employee:e}}(t)),t}catch(t){throw t}finally{b()}}async function Q(e){try{D();const t=await j.save(e);return P.dispatch(function(e){return{type:A,employee:e}}(t)),t}catch(t){throw t}finally{b()}}const Z={query:async function(e={username:"",sortField:"",sortDir:""}){return f.get("schedule",e)},getScheduleByBranchId:function(e){return f.get(`schedule/${e}`)},save:async function(e){var t;t=e.branchId?await f.put(`schedule/${e.branchId}`,e):await f.post("schedule",e);return t},remove:async function(e){return f.delete(`schedule/${e}`)},update:async function(e){return f.put(`schedule/${e.branchId}`,e)}};async function ee(e){try{D();const t=await Z.query({...e});P.dispatch(function(e){return{type:N,schedules:e}}(t))}catch(t){throw t}finally{b()}}async function te(t){const n=structuredClone(t);try{P.dispatch(re(t));return await Z.save(t)}catch(r){throw P.dispatch(re(n)),e.error("שגיאה בעדכון המשמרת"),r}}async function ne(e){try{D();const t=await Z.save(e);return P.dispatch(re(t)),t}catch(t){throw t}finally{b()}}function re(e){return{type:k,schedule:e}}export{q as a,L as b,W as c,K as d,ee as e,ne as f,te as g,B as l,z as r,P as s,Q as u};
