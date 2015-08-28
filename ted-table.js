/* global jQuery */
(function($){
	$.fn.tedTable = function (options){
		var defaults = {
			head 		: [],
			data 		: [],
			num_rows 	: 10,
			page		: 1,
			filter		: {}
		}
		options = $.extend(defaults, options);
		
		var that   = this;
		var sorted = null;
		
		var tmp_data = options.data;
		
		var elements = {
			select 		: $('<div>', {class: 'col-md-6 form-inline'}),
			table  		: $('<div>'),
			pagination 	: $('<div>'),
			search_box	: $('<div>', {class: 'col-md-6 form-inline'}),
		};
		
		var get_thead = function(){
			var thead = $('<thead>');
			var tr = $('<tr>').appendTo(thead);
			for(var i=0; i<options.head.length; i++){
				var _th = $('<th>', { text : options.head[i], 'data-number': i}).appendTo(tr);
				$(_th).click(function(e){
					var number  = $(this).data('number');
					if(number==sorted){
						tmp_data.reverse(function(a,b){
							return a[number]<b[number] ? -1 : (a[number]>b[number]? 1 : 0);
						});
						sorted = -1;
					}
					else{
						tmp_data.sort(function(a,b){
							return a[number]<b[number] ? -1 : (a[number]>b[number]? 1 : 0);
						});
						sorted = number;
					}
					get_table();
				});
			}
			return thead;
		}
		
		var get_tbody = function(){
			var tbody = $('<tbody>');
			for(var row=(options.page-1)*options.num_rows; row<tmp_data.length && row<parseInt((options.page-1)*options.num_rows) + parseInt(options.num_rows); row++){
				var _tr = $('<tr>').appendTo(tbody);
					for(var column=0; column<tmp_data[row].length; column++){
						$('<td>', { text : tmp_data[row][column] }).appendTo(_tr);
					}
			}
			return tbody;
		}
		
		var get_table = function(){
			var table = $('<table>', { class : 'table table-striped table-bordered' });
			get_thead().appendTo(table);
			get_tbody().appendTo(table);
			get_pagination();
			elements.table.html(table);
		}
		
		var get_select_num_rows = function(){
			var label  = $('<label>', {text: 'View'});
			label.appendTo(elements.select);
			var select = 	$('<select>', {class: 'form-control'});
			$('<option>', { value: '1', text: '1'}).appendTo(select);
			$('<option>', { value: '10', text: '10'}).appendTo(select);
			$('<option>', { value: '20', text: '20'}).appendTo(select);
			$('<option>', { value: '50', text: '50'}).appendTo(select);
			$('<option>', { value: '100', text: '100'}).appendTo(select);
			
			$(select).on('change',function(e){
				options.num_rows = $(this).val();
				get_table();
			})
			select.appendTo(elements.select);
		}
		
		var get_pagination_element = function(text, data_page, ul, link, active){
			var _class = active ? "active" : "";
			_class +=  link ? "" : " disabled";
			var _li = $('<li>', {class: _class}).appendTo(ul);
			var _a  = $('<a>', {text: text, 'data-page': data_page}).appendTo(_li);
			if(link){
				_a.click(function(){
					options.page = $(this).data('page');
					get_table();
					return false;
				});
			}
		}
		
		var get_pagination = function(){
			var len = Math.ceil(tmp_data.length/options.num_rows)+1;
			var ul = $('<ul>', {class: 'pagination'});
			get_pagination_element('Prec', options.page-1, ul, options.page!=1);
			if(len<10){
				for(var i=1; i<Math.ceil(len/options.num_rows)+1; i++){
					get_pagination_element(i, i, ul, true);
				}
			}
			else{
				for(var i=1; i<5; i++){
					get_pagination_element(i, i, ul, true);
				}
				get_pagination_element(options.page,options.page,ul,true, true);
				for(var i=len-5; i<len; i++){
					get_pagination_element(i, i, ul, true);
				}
			}
			get_pagination_element('Succ', parseInt(options.page)+1, ul, options.page!=len-1);
			var container = $('<center>');
			ul.appendTo(container);
			elements.pagination.html(container);
		}
		
		var get_search_box = function(){
			var container = $('<div>', {class:'pull-right'});
			var label = $('<label>',{text: 'Search'});
			label.appendTo(container);
			var input = $('<input>', {class: 'form-control'});
			input.on('input', function(e){
				var str = $(this).val();
				if(str!=""){
					String.prototype.contains = function(str){return this.toUpperCase().indexOf(str.toUpperCase()) != -1; };
					tmp_data = $.grep(options.data, function(n,i){
						for(var i=0; i<n.length; i++){
							if((n[i]+"").contains(str)){
								return true;
							}
						}
						return false;
					});
				}
				else tmp_data = options.data;
				get_table();
			});
			input.appendTo(container);
			container.appendTo(elements.search_box);
		}
		
		var create_filter = function(index){
			$(options.filter[index].selector).on('input', function(){
				var str = $(this).val();
				if(str!=""){
					String.prototype.contains = function(str){return this.toUpperCase().indexOf(str.toUpperCase()) != -1; };
					tmp_data = $.grep(tmp_data, function(n,i){
						return (n[options.filter[index].column]+"").contains(str);
					});
				}
				else tmp_data = options.data;
				get_table();
			});
		}
		
		return that.each(function(){
			var top_bar = $('<div>', {class : 'row', 'style': 'margin-bottom: 20px;' });
			$(this).append(top_bar);		
			top_bar.append(elements.select);
			top_bar.append(elements.search_box);
			$(this).append(elements.table);
			$(this).append(elements.pagination);
			
			get_select_num_rows();
			get_search_box();
			get_table();
			
			for(var i=0; i<options.filter.length; i++){
				create_filter(i);
			}
			
		});
	};
})(jQuery)