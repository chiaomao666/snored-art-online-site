(function(root){'use strict';
function probabilityAtLeast(n,k,p){
  n=Math.max(0,Math.floor(n));k=Math.max(0,Math.floor(k));
  if(k===0)return 1;if(n<k||p<=0)return 0;if(p>=1)return 1;
  let term=Math.pow(1-p,n),sum=term;
  for(let i=1;i<k;i++){term*=((n-i+1)/i)*(p/(1-p));sum+=term;}
  return Math.max(0,Math.min(1,1-sum));
}
const api={probabilityAtLeast};root.GuideDropMath=api;if(typeof module==='object')module.exports=api;
})(typeof globalThis==='object'?globalThis:this);
