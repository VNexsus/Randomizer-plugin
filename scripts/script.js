/*
 (c) Copyright VNexsus 2021

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
(function(window, undefined){

	const B_OK = 1
	
	var mode = 1;
	var pattern = "";
	var posiblesetlength = 0;
	var canchangepattern = false;
	var progress = 0;
	
	var symbolsets = [
		{
			name: "numbers",
			set: "0123456789"
		},
		{
			name: "letters",
			set: "ABCDEF"
		},
		{
			name: "symbols",
			set: "%*$#&?@"
		},
		{
			name: "custom",
			set: ""
		}
	];
	
	var patterns = [
		{ 
			name: "Произвольный тип", 
			minlength: 5, 
			maxlength: 25, 
			pattern: "⋆⋆⋆⋆⋆",
			canchangepattern: true,
			symbolset: ["numbers", "letters", "symbols", "custom"],
			canchangeset: true
		},
		{
			name: "GUID", 
			minlength: 36, 
			maxlength: 36, 
			pattern: "⋆⋆⋆⋆⋆⋆⋆⋆-⋆⋆⋆⋆-⋆⋆⋆⋆-⋆⋆⋆⋆-⋆⋆⋆⋆⋆⋆⋆⋆⋆⋆⋆⋆",
			canchangepattern: false,
			symbolset: ["numbers", "letters"],
			canchangeset: false
		},
		{
			name: "{GUID}", 
			minlength: 38, 
			maxlength: 38, 
			pattern: "{⋆⋆⋆⋆⋆⋆⋆⋆-⋆⋆⋆⋆-⋆⋆⋆⋆-⋆⋆⋆⋆-⋆⋆⋆⋆⋆⋆⋆⋆⋆⋆⋆⋆}",
			canchangepattern: false,
			symbolset: ["numbers", "letters"],
			canchangeset: false
		}
	];
	
	window.Asc.plugin.init = function(text){
		var sel = document.getElementById("patterns")
		if(sel){
			for(var i = 0; i < patterns.length; i++){
				var opt = document.createElement("option");
				opt.value = i;
				opt.text = patterns[i].name;
				sel.appendChild(opt);
			}
		}
		window.setpattern();
		document.getElementById("patterns").onchange = new Function("return window.setpattern()");
		$('#patterns').select2({ minimumResultsForSearch: Infinity });
		document.getElementById("length").onchange = new Function("return window.preparepattern()");
		document.getElementById("custom").onchange = new Function("return window.custom()");
	};
	
	window.setpattern = function(){
		var pat = patterns[parseInt(document.getElementById("patterns").value)];
		document.getElementById("length").min = pat.minlength;
		document.getElementById("length").max = pat.maxlength;
		document.getElementById("length").value = pat.minlength;
		document.getElementById("length").disabled = (pat.minlength == pat.maxlength) ? true : false;
		canchangepattern = pat.canchangepattern;
		window.preparepattern();
		if(pat.pattern != ""){
			var patternContainer = document.getElementById("pattern");
			if(patternContainer){
				for(var i = 0; i < patternContainer.children.length; i++){
					patternContainer.children[i].value = (pat.pattern.charAt(i) != "⋆") ? pat.pattern.charAt(i) : "";
					window.patterncheck(patternContainer.children[i]);
				}
			}
		}
		window.buildpattern();
		for(var i = 0; i < symbolsets.length; i++){
			if(pat.symbolset.indexOf(symbolsets[i].name) >= 0 && pat.canchangeset)
				document.getElementById(symbolsets[i].name).disabled = false;
			else if(pat.symbolset.indexOf(symbolsets[i].name) >= 0 && !pat.canchangeset){
				document.getElementById(symbolsets[i].name).disabled = true;
				document.getElementById(symbolsets[i].name).checked = true;
			}		
			else{
				document.getElementById(symbolsets[i].name).disabled = true;
				document.getElementById(symbolsets[i].name).checked = false;
			}
		}
	}

	window.custom = function(){
		if(document.getElementById("custom").checked == true)
			document.getElementById("customset").disabled = false;
		else
			document.getElementById("customset").disabled = true;
	}
	
	window.buildpattern = function(){
		pattern = "";
		var patternContainer = document.getElementById("pattern");
		if(patternContainer){
			var p = 0;
			for(var i = 0; i < patternContainer.children.length; i++){
				pattern += (patternContainer.children[i].value != "") ? patternContainer.children[i].value : "⋆";
				if(patternContainer.children[i].value == "")
					p++;
			}
			posiblesetlength = p;
		}
	}
	
	window.preparepattern = function(){
		var length = parseInt(document.getElementById("length").value);
		if(length < parseInt(document.getElementById("length").min)){
			document.getElementById("length").value = document.getElementById("length").min;
			length = document.getElementById("length").min;
		}
		if(length > parseInt(document.getElementById("length").max)){
			document.getElementById("length").value = document.getElementById("length").max;
			length = document.getElementById("length").max;
		}
		var patternContainer = document.getElementById("pattern");
		if(patternContainer){
			var els = patternContainer.children;
			if(els.length < length){
				var n = length - els.length;
				for(var i = 0; i < n; i++){
					var pat = document.createElement("input");
					pat.type = "text";
					pat.name = "pat";
					pat.maxlength = 1;
					pat.size = 1;
					pat.className = "form-control pattern"
					pat.placeholder = "⋆";
					patternContainer.appendChild(pat);
					pat.oninput = new Function("return window.patterninput(this)");
					pat.onkeydown = new Function("return window.patternkeydown(this, event)");
					pat.onfocus = new Function("return window.patternfocus(this, event)");
					pat.onmouseup = new Function("return window.patternfocus(this, event)");
					pat.onpaste = new Function("return window.patternpaste(this, event)")
				}
			}
			else if(els.length > length){
				var n = els.length;
				for(var i = length; i < n ; i++)
					patternContainer.removeChild(els[length]);
			}
			for(var i = 0; i < els.length; i++){
				els[i].disabled = !canchangepattern ? true : false;
			}
			window.buildpattern();
		}
	}
	
	window.patterninput = function(el, ev){
		var patternContainer = document.getElementById("pattern");
		var els = patternContainer.children;
		var position = Array.from(patternContainer.children).indexOf(el);
		if( position != -1 && position < els.length - 1)
			els[position + 1].focus();
		else
			el.select();
		window.patterncheck(el);
		window.buildpattern();
	}
	
	window.patterncheck = function(el){
		if(el.value != "")
			el.style.backgroundColor = "rgba(255,255,200,1)";
		else
			el.style.backgroundColor = "";
	}
	
	window.patternpaste = function(el, ev){
		var patternContainer = document.getElementById("pattern");
		var clipboardData = ev.clipboardData || window.clipboardData;
		var pastedData = clipboardData.getData('Text');
		if(pastedData.length > 0){
			var position = Array.from(el.parentElement.children).indexOf(el);
			if(position >= 0){
				for(var i = position; i < el.parentElement.children.length && pastedData.length > 0; i++){
					var chr = pastedData.charAt(0);
					el.parentElement.children[i].value = chr;
					window.patterncheck(el.parentElement.children[i]);
					pastedData = pastedData.substring(1);
				}
				el.parentElement.children[i-1].focus();
				window.buildpattern();
			}
		}
		event.preventDefault(); 
		return false;
	}

	window.patternkeydown = function(el, ev){
		var patternContainer = document.getElementById("pattern");
		switch(ev.key){
			case "ArrowLeft":
				var position = Array.from(patternContainer.children).indexOf(el);
				if( position != -1 && position > 0){
					patternContainer.children[position].blur();
					patternContainer.children[position - 1].focus();
					patternContainer.children[position - 1].select();
				}
				ev.cancelBubble = true;
				return false;
			case "ArrowRight":
				var position = Array.from(patternContainer.children).indexOf(el);
				if( position != -1 && position < patternContainer.children.length - 1){
					patternContainer.children[position + 1].focus();
					patternContainer.children[position + 1].select();
				}
				ev.cancelBubble = true;
				return false;
			case "Backspace":
				el.value = "";
				window.patterncheck(el);
				var position = Array.from(patternContainer.children).indexOf(el);
				if( position != -1 && position != 0){
					patternContainer.children[position].blur();
					patternContainer.children[position - 1].focus();
					patternContainer.children[position - 1].select();
				}
				ev.cancelBubble = true;
				ev.preventDefault();
				ev.stopPropagation();
				window.buildpattern();
				return false;
			case "Delete":
				el.value = "";
				window.patterncheck(el);
				var position = Array.from(patternContainer.children).indexOf(el);
				if( position != -1 && position < patternContainer.children.length - 1){
					patternContainer.children[position + 1].focus();
					patternContainer.children[position + 1].select();
				}
				ev.cancelBubble = true;
				window.buildpattern();
				return false;
			case "Home":
				patternContainer.children[0].focus();
				patternContainer.children[0].select();
				ev.cancelBubble = true;
				return false;
			case "End":
				patternContainer.children[patternContainer.children.length-1].focus();
				patternContainer.children[patternContainer.children.length-1].select();
				ev.cancelBubble = true;
				return false;
			default:
				if(el.value.length == el.value.maxlength){
					ev.cancelBubble = true;
					ev.preventDefault();
					return false;
				}
		}
	}

	window.patternfocus = function(el, ev){
		ev.cancelBubble = true;
		ev.preventDefault();
		ev.stopPropagation();
		el.select();
		return false;
	}

	window.generate = function(){
		var quantity = parseInt(document.getElementById("quantity").value);
		var length = parseInt(document.getElementById("length").value);
		var set = new Array();
		var symbols = "";
		if(document.getElementById("numbers").checked)
			symbols += symbolsets.find(function(el){return el.name == "numbers"}).set;
		if(document.getElementById("letters").checked)
			symbols += symbolsets.find(function(el){return el.name == "letters"}).set;
		if(document.getElementById("symbols").checked)
			symbols += symbolsets.find(function(el){return el.name == "symbols"}).set
		if(document.getElementById("custom").checked)
			symbols += document.getElementById("customset").value
		if(symbols.trim() == ""){
			window.OpenMsgBox("Не задан набор символов для генерации значений", B_OK);
			return;
		}
		var symbolsLength = symbols.length;
		if(Math.pow(symbolsLength, posiblesetlength) < quantity){
			window.OpenMsgBox("Для заданного шаблона невозможно сформировать необходимое количество уникальных значений", B_OK);
			return;
		}
		window.OpenMsgBox("Выполняется генерация значений");
		while(set.length < quantity){
			value = "";
			for(var i = 0 ; i < length; i++){
				if(pattern.charAt(i) == "⋆")
					value += symbols.charAt(Math.floor(Math.random() * symbolsLength))
				else
					value += pattern.charAt(i);
			}
			if(set.indexOf(value) == -1)
				set.push(value);
		}
		window.OpenMsgBox("<div class='inprogress'></div><div>Выполняется запись значений в таблицу</div>");
		for(var i = 0; i< quantity; i++){
			var cmd = "var oWorksheet = Api.GetActiveSheet();"
			cmd += "var oActiveCell = oWorksheet.GetActiveCell();"
			cmd += "var row = oActiveCell.GetRow();";
			cmd += "var col = oActiveCell.GetCol();";
			cmd += "oWorksheet.GetRangeByNumber(row + "+ i + ", col).SetValue(\"'" + set[i] + "\");";
			window.Asc.plugin.info.recalculate = true;
			window.Asc.plugin.executeCommand("command", cmd);
		}
		return true;
	}
	
	window.insertCallback = function(quantity){
		progress++;
		document.getElementById("progress").innerText = Math.round((progress/quantity) * 100) + "%"
	}
	
	window.OpenMsgBox = function(message, buttons){
		var popup = document.getElementById("popup");
		if(popup){
			var msg = document.getElementById("message");
			msg.innerHTML = message;
			if(buttons){
				var button_container = document.createElement("div");
				button_container.className = "button-container";
				msg.appendChild(button_container);
				if(buttons & B_OK){
					var btn = document.createElement("button")
					btn.innerText = "OK"
					btn.className = "btn-text-default"
					btn.onclick = new Function("return window.CloseMsgBox()");
					button_container.appendChild(btn);
				}
			}
			popup.style.display = "";
		}
	}
	
	window.CloseMsgBox = function(){
		var popup = document.getElementById("popup");
		if(popup){
			popup.style.display = "none";
		}
	}
	
	window.Asc.plugin.button = function(id){
 		if(id==0)
		{
			if(window.generate())
				this.executeCommand("close", "");
		}
		else
			this.executeCommand("close", "");
	};

	window.Asc.plugin.onExternalMouseUp = function(){
        var evt = document.createEvent("MouseEvents");
        evt.initMouseEvent("mouseup", true, true, window, 1, 0, 0, 0, 0,
            false, false, false, false, 0, null);

        document.dispatchEvent(evt);
    };

})(window, undefined);
