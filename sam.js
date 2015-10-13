var has_h264="";
var sr=[];

try{
  has_h264=document.createElement("video").canPlayType('video/mp4; codecs="avc1.42E01E"') .replace(/^no$/,"");
} catch(e){
}

var LZW = {
  encode:function(s) {
    var dict = {};
    var data = (s + "").split("");
    var out = [];
    var currChar;
    var phrase = data[0];
    var code = 256;
    for (var i=1; i<data.length; i++) {
        currChar=data[i];
        if (dict[phrase + currChar] !== null) {
            phrase += currChar;
        }
        else {
            out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
            dict[phrase + currChar] = code;
            code++;
            phrase=currChar;
        }
    }
    out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
    for (var j=0; j<out.length; j++) {
        out[j] = String.fromCharCode(out[j]);
    }
    return out.join("");
  },
  decode:function(s) {
    var dict = {};
    var data = (s + "").split("");
    var currChar = data[0];
    var oldPhrase = currChar;
    var out = [currChar];
    var code = 256;
    var phrase;
    for (var i=1; i<data.length; i++) {
        var currCode = data[i].charCodeAt(0);
        if (currCode < 256) {
            phrase = data[i];
        }
        else {
           phrase = dict[currCode] ? dict[currCode] : (oldPhrase + currChar);
        }
        out.push(phrase);
        currChar = phrase.charAt(0);
        dict[code] = oldPhrase + currChar;
        code++;
        oldPhrase = phrase;
    }
    return out.join("");
  }
};

var Base64 = {
	// private property
	_keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
	// public method for encoding
	encode : function (input) {
		var output = "";
		var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
		var i = 0;
		input = Base64._utf8_encode(input);
		while (i < input.length) {
			chr1 = input.charCodeAt(i++);
			chr2 = input.charCodeAt(i++);
			chr3 = input.charCodeAt(i++);
			enc1 = chr1 >> 2;
			enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
			enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
			enc4 = chr3 & 63;
			if (isNaN(chr2)) {
				enc3 = enc4 = 64;
			} else if (isNaN(chr3)) {
				enc4 = 64;
			}
			output = output +
			this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
			this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
		}
		return output;
	},
	// public method for decoding
	decode : function (input) {
		var output = "";
		var chr1, chr2, chr3;
		var enc1, enc2, enc3, enc4;
		var i = 0;
		input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
		while (i < input.length) {
			enc1 = this._keyStr.indexOf(input.charAt(i++));
			enc2 = this._keyStr.indexOf(input.charAt(i++));
			enc3 = this._keyStr.indexOf(input.charAt(i++));
			enc4 = this._keyStr.indexOf(input.charAt(i++));
			chr1 = (enc1 << 2) | (enc2 >> 4);
			chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
			chr3 = ((enc3 & 3) << 6) | enc4;
			output = output + String.fromCharCode(chr1);
			if (enc3 != 64) {
				output = output + String.fromCharCode(chr2);
			}
			if (enc4 != 64) {
				output = output + String.fromCharCode(chr3);
			}
		}
		output = Base64._utf8_decode(output);
		return output;
	},
	// private method for UTF-8 encoding
	_utf8_encode : function (string) {
		string = string.replace(/\r\n/g,"\n");
		var utftext = "";
		for (var n = 0; n < string.length; n++) {
			var c = string.charCodeAt(n);
			if (c < 128) {
				utftext += String.fromCharCode(c);
			}
			else if((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			}
			else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}
		}
		return utftext;
	},
	// private method for UTF-8 decoding
	_utf8_decode : function (utftext) {
		var string = "";
		var i = 0;
		var c,c3,c2;
    c = c3 = c2 = 0;
		while ( i < utftext.length ) {
			c = utftext.charCodeAt(i);
			if (c < 128) {
				string += String.fromCharCode(c);
				i++;
			}
			else if((c > 191) && (c < 224)) {
				c2 = utftext.charCodeAt(i+1);
				string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
				i += 2;
			}
			else {
				c2 = utftext.charCodeAt(i+1);
				c3 = utftext.charCodeAt(i+2);
				string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
				i += 3;
			}
		}
		return string;
	}
};

function MakeVideoTag(fn,w,h,cfn){
   if (has_h264===""){
     s='<object type="application/x-shockwave-flash" data="player_flv_maxi.swf" width='+(w===null?640:w)+' height='+(h===null?480:h)+'>';
     s+='<param name="movie" value="player_flv_maxi.swf" />';
     s+='<param name="FlashVars" value="flv='+fn+'&amp;startimage='+(cfn!==""?cfn:"default_flvideo_cover.jpg")+'" />';
     s+="</object>";
   } else {
     s="<video controls "+(w!==null?" width="+w:"")+" "+(h!==null?" height="+h:"")+" "+(cfn!==""?" poster="+cfn:"")+"><source src="+fn+"></video>";
  }
  document.write(s);
}

function hasAns(ans){
  if (ans.type=="radio" || ans.type=="checkbox") {
    return ans.checked;
  }
  return ans.value!=="";
}

function evaluateAns(ans,r,i,j,ok){
  var anstype,usrres,res,c,rok,cmt;
  anstype=ans.type;
  res=ok;
  c=document.getElementById("QANSW"+(i+1)+"_"+(j+1)) ;
  cmt=document.getElementById("QCMT"+(i+1)+"_"+(j+1));
  if (anstype=="radio") {
    if (ans.checked) {
      if (res) res=(r[j+1]==1);
      c.style.color=(r[j+1]==1?"green":"red");
      if (c.parentNode.className=="s_pos") c.parentNode.style.border="solid 2pt "+(r[j+1]==1?"green":"red");
      if (cmt) cmt.style.display="block";
    }
    if (qmode==1) {
      ans.checked=false  ;
      c.style.color="black";
      if (cmt) cmt.style.display="none";
      if (c.parentNode.className=="s_pos") c.parentNode.style.border="";
    }
  } else if (anstype=="checkbox") {
    if (ans.checked) {
       if (res) res=(r[j+1]==1);
       c.style.color=(r[j+1]==1?"green":"red");
       if (cmt) cmt.style.display="block";
       if (c.parentNode.className=="s_pos") c.parentNode.style.border="solid 2pt "+(r[j+1]==1?"green":"red");
    } else {
       if (res) res=(r[j+1]!=1);
       if (r[j+1]==1) c.style.color="red";
       if (r[j+1]==1 && c.parentNode.className=="s_pos") c.parentNode.style.border="solid 2pt red";
    }
    if (qmode==1) {
      ans.checked=false  ;
      c.style.color="black";
      if (cmt) cmt.style.display="none";
      if (c.parentNode.className=="s_pos") c.parentNode.style.border="";
    }
  } else if (anstype=="text") {
    usrres=ans.value;
    rok=r[j+1].toLowerCase()==usrres.toLowerCase();
    if (res) res=rok;
    c.style.color=(rok?"green":"red");
    if (qmode==1) {
      ans.value="" ;
      c.style.color="black";
      if (cmt) cmt.style.display="none";
    } else {
      if (cmt) cmt.style.display="block";
    }
  }
  return res;
}

var qmode=0;

function evaluateQuiz(r,nd){
  var i,j,qn,ans,esatte=0,errate=0,s="<ol>",c,ok,rr,frm;
  var rpl=[];
  // controlla a quali domande e` stata data una risposta
  for(i=0;i<nd;i++){
    frm=document.forms['quiz'+(i+1)];
    qn="frm.QANSW"+(i+1);
    ans=eval(qn);
    if (ans!==undefined){
      if (ans.length===undefined){
        rpl.push(hasAns(ans));
      } else {
        replied=false;
        for(j=0;j<ans.length;j++){
          replied=replied || hasAns(ans[j]) ;
        }
        rpl.push(replied);
      }
    }
  }
  // valuta la risposta
  for(i=0;i<nd;i++){
    rr=eval("new Array("+LZW.decode(Base64.decode(r[i]))+")");
    frm=document.forms['quiz'+(i+1)];
    qn="frm.QANSW"+(i+1);
    ans=eval(qn);
    if (ans!==undefined){
      ok=true;
      if (ans.length===undefined){
        if (rpl[i]) ok=evaluateAns(ans,rr,i,0,ok);
      } else {
        for(j=0;j<ans.length;j++){
          if (rpl[i]) ok=evaluateAns(ans[j],rr,i,j,ok);
        }
      }
      if (rpl[i]){
        if (ok) {
          s+="<li>esatta</li>";
          esatte++;
        } else {
          s+="<li>errata</li>";
          errate++;
        }
      } else {
        s +="<li>--</li>" ;
      }
    } else {
      s +="<li>--</li>";
    }
  }
  c=document.getElementById("quizresult");
  c.innerHTML=(qmode===0?s+"</ol><br/>"+esatte+" "+(esatte==1?"risposta esatta":"risposte esatte")+" e "+errate+" "+(errate==1?"risposta errata":"risposte errate")+" su "+(nd)+" domande.":"");
  qmode=(qmode===0?1:0);
  c=document.getElementById("quizbtn");
  c.value=(qmode===0?"Valutazione":"Azzera risultati");
}

function spot(spotId, textId, status) {
    spotEl = document.getElementById(spotId);
    if (spotEl) {
        spotEl.style.backgroundColor = status ? "Crimson": "inherit";
    }
    textEl = document.getElementById(textId);
    if (textEl)
        textEl.style.backgroundColor = status ? "LightPink": "inherit";
}


function collapseExpand($this)
{
    if ($this.parentNode); // the "p"
        note = $this.parentNode.nextElementSibling; // the note after the "p"

    if (note)
        if (!note.style.display || note.style.display === "" || note.style.display === "none")
            note.style.display = "block";
        else
            note.style.display = "none";
}

window.addEventListener(
  "message",
  function (event) {
    var name = window.name;
    if (window === top) {
        idxFrame = window.document.getElementById('idx');
        idxFrame.contentWindow.postMessage(event.data, '*');
    } else if (window.name === "idx"){
      elems = window.document.getElementsByClassName('idxlnk');
    }
  },
  false);

function onLinkClicked(ctrl) {
  elems = window.document.getElementsByClassName('idxlnk');
  elems.forEach(function(elem) {

  });
}

function onPrevNextClicked(ctrl) {
  var name = window.name;
  top.postMessage(ctrl.href, '*');
}
