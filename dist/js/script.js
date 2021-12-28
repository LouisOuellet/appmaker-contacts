API.Plugins.contacts = {
	forms:{
		create:{
			0:"first_name",
			1:"middle_name",
			2:"last_name",
			3:"job_title",
			information:{
				0:"email",
				1:"phone",
				2:"mobile",
				3:"office_num",
				4:"other_num",
			},
		},
		update:{
			0:"first_name",
			1:"middle_name",
			2:"last_name",
			3:"job_title",
			information:{
				0:"email",
				1:"phone",
				2:"mobile",
				3:"office_num",
				4:"other_num",
			},
		},
	},
	init:function(){
		API.GUI.Sidebar.Nav.add('Contacts', 'development');
		var isInitialized = setInterval(function() {
			if(API.initiated){
				clearInterval(isInitialized);
				for(var [key, plugin] of Object.entries(['organizations','leads','my_leads','my_prospects','clients','my_clients'])){
					API.Plugins.contacts.customize(plugin);
				}
			}
		}, 100);
	},
	customize:function(plugin){
		if(API.Helper.isSet(API.Contents,['Settings','plugins',plugin,'status']) && API.Contents.Settings.plugins[plugin].status){
			var isInitialized = setInterval(function() {
				if(API.Helper.isSet(API.Plugins,[plugin,'forms','create'])){
					clearInterval(isInitialized);
					API.Plugins[plugin].forms.create.contact = {
						0:"first_name",
						1:"middle_name",
						2:"last_name",
						3:"job_title",
					}
				}
			}, 100);
		}
	},
	load:{
		index:function(){
			API.Builder.card($('#pagecontent'),{ title: 'Contacts', icon: 'contacts'}, function(card){
				API.request('contacts','read',{
					data:{options:{ link_to:'ContactsIndex',plugin:'contacts',view:'index' }},
				},function(result) {
					var dataset = JSON.parse(result);
					if(dataset.success != undefined){
						for(var [key, value] of Object.entries(dataset.output.dom)){ API.Helper.set(API.Contents,['data','dom','contacts',value.id],value); }
						for(var [key, value] of Object.entries(dataset.output.raw)){ API.Helper.set(API.Contents,['data','raw','contacts',value.id],value); }
						API.Builder.table(card.children('.card-body'), dataset.output.dom, {
							headers:dataset.output.headers,
							id:'ContactsIndex',
							modal:true,
							key:'first_name',
							clickable:{ enable:true, view:'details'},
							controls:{ toolbar:true},
							import:{ key:'id', },
						},function(response){});
					}
				});
			});
		},
		details:function(){
			var url = new URL(window.location.href);
			var id = url.searchParams.get("id"), values = '';
			setTimeout(function() {
				$('[data-plugin="contacts"][data-key]').each(function(){
					values += $(this).html();
				});
				if(values == ''){
					API.request('contacts','read',{data:{id:id,key:'id'}},function(result){
						var dataset = JSON.parse(result);
						if(dataset.success != undefined){
							for(var [key, value] of Object.entries(dataset.output.dom)){ API.Helper.set(API.Contents,['data','dom','contacts',value.id],value); }
							for(var [key, value] of Object.entries(dataset.output.raw)){ API.Helper.set(API.Contents,['data','raw','contacts',value.id],value); }
							var contact = API.Contents.data.raw.contacts[id];
							API.GUI.insert(contact);
						}
					});
				} else {
					var contact = API.Contents.data.raw.contacts[id];
				}
			}, 1000);
			var checkExist = setInterval(function() {
				if((typeof contact !== 'undefined')&&(contact.length > 0)){
					clearInterval(checkExist);
				}
			}, 100);
		},
	},
	Timeline:{
		icon:"address-card",
		object:function(dataset,layout,options = {},callback = null){
			if(options instanceof Function){ callback = options; options = {}; }
			var defaults = {icon: API.Plugins.contacts.Timeline.icon,color: "secondary"};
			if(API.Helper.isSet(options,['icon'])){ defaults.icon = options.icon; }
			if(API.Helper.isSet(options,['color'])){ defaults.color = options.color; }
			if(typeof dataset.id !== 'undefined'){
				var dateItem = new Date(dataset.created);
				var dateUS = dateItem.toLocaleDateString('en-US', {day: 'numeric', month: 'short', year: 'numeric'}).replace(/ /g, '-').replace(/,/g, '');
				API.Builder.Timeline.add.date(layout.timeline,dataset.created);
				var checkExist = setInterval(function() {
					if(layout.timeline.find('div.time-label[data-dateus="'+dateUS+'"]').length > 0){
						clearInterval(checkExist);
						API.Builder.Timeline.add.filter(layout,'contacts','Contacts');
						var html = '';
						html += '<div data-plugin="contacts" data-id="'+dataset.id+'" data-name="'+dataset.name+'" data-date="'+dateItem.getTime()+'">';
							html += '<i class="fas fa-'+defaults.icon+' bg-'+defaults.color+'"></i>';
							html += '<div class="timeline-item">';
								html += '<span class="time"><i class="fas fa-clock mr-2"></i><time class="timeago" datetime="'+dataset.created.replace(/ /g, "T")+'">'+dataset.created+'</time></span>';
								html += '<h3 class="timeline-header border-0">'+dataset.name+' was created</h3>';
							html += '</div>';
						html += '</div>';
						layout.timeline.find('div.time-label[data-dateus="'+dateUS+'"]').after(html);
						var element = layout.timeline.find('[data-plugin="contacts"][data-id="'+dataset.id+'"]');
						element.find('time').timeago();
						var items = layout.timeline.children('div').detach().get();
						items.sort(function(a, b){
							return new Date($(b).data("date")) - new Date($(a).data("date"));
						});
						layout.timeline.append(items);
						if(API.Helper.isSet(layout,['tabs','contacts'])){
							element.find('i').first().addClass('pointer');
							element.find('i').first().off().click(function(){
								value = element.attr('data-name').toLowerCase();
								layout.content.contacts.find('input').val(value);
								layout.tabs.contacts.find('a').tab('show');
								layout.content.contacts.find('[data-csv]').hide();
								layout.content.contacts.find('[data-csv*="'+value+'"]').each(function(){ $(this).show(); });
							});
						}
						if(callback != null){ callback(element); }
					}
				}, 100);
			}
		},
	},
	Layouts:{
		details:{
			tab:function(data,layout,options = {},callback = null){
				if(options instanceof Function){ callback = options; options = {}; }
				var defaults = {field: "name"};
				if(API.Helper.isSet(options,['field'])){ defaults.field = options.field; }
				API.GUI.Layouts.details.tab(data,layout,{icon:"fas fa-address-book",text:API.Contents.Language["Contacts"]},function(data,layout,tab,content){
					API.Builder.Timeline.add.filter(layout,'contacts','Contacts');
					layout.content.contacts = content;
					layout.tabs.contacts = tab;
					content.addClass('p-3');
					var html = '';
					html += '<div class="row">';
						html += '<div class="col-md-12 mb-3">';
							html += '<div class="input-group">';
								html += '<input type="text" class="form-control">';
								html += '<div class="input-group-append pointer" data-action="clear">';
									html += '<span class="input-group-text"><i class="fas fa-times" aria-hidden="true"></i></span>';
								html += '</div>';
								html += '<div class="input-group-append">';
									html += '<span class="input-group-text"><i class="icon icon-search mr-1"></i>'+API.Contents.Language["Search"]+'</span>';
								html += '</div>';
							html += '</div>';
						html += '</div>';
					html += '</div>';
					html += '<div class="row"></div>';
					content.append(html);
					area = content.find('div.row').last();
					if(API.Auth.validate('plugin', 'contacts', 2)){
						var html = '';
						html += '<div class="col-sm-12 col-md-6">';
							html += '<div class="card pointer addContact">';
								html += '<div class="card-body py-4">';
									html += '<div class="text-center p-5">';
										html += '<i class="fas fa-plus-circle fa-10x mt-3 mb-2"></i>';
									html += '</div>';
								html += '</div>';
							html += '</div>';
						html += '</div>';
						area.append(html);
					}
					if(API.Helper.isSet(data,['relations','contacts'])){
						for(var [id, relation] of Object.entries(data.relations.contacts)){
							if(relation.isActive||API.Auth.validate('custom', 'contacts_isActive', 1)){
								API.Plugins.contacts.Layouts.details.GUI.contact(relation,layout);
							}
						}
					}
				});
				API.Plugins.contacts.Layouts.details.Events(data,layout);
				if(callback != null){ callback(dataset,layout); }
			},
			GUI:{
				contact:function(dataset,layout,plugin = 'contacts'){
					var area = layout.content.contacts.find('div.row').eq(1);
					area.prepend(API.Plugins.contacts.Layouts.details.GUI.card(dataset));
					var card = area.find('div.col-sm-12.col-md-6').first();
					if(API.Helper.isSet(dataset,['users'])){
						if(API.Auth.validate('custom', 'contacts_btn_details', 1)){
							card.find('div.btn-group').append(API.Plugins.contacts.Layouts.details.GUI.button(dataset,{id:'id',color:'primary',icon:'fas fa-user',action:'details',content:API.Contents.Language['Details']}));
						}
					} else {
						if(API.Auth.validate('custom', 'contacts_btn_link', 1)){
							card.find('div.btn-group').append(API.Plugins.contacts.Layouts.details.GUI.button(dataset,{id:'id',color:'teal',icon:'fas fa-link',action:'link',content:API.Contents.Language['Add User']}));
						}
					}
					if(API.Helper.isSet(dataset,['event_attendances'])){
						if(API.Auth.validate('custom', 'contacts_btn_attendance', 1)){
							card.find('div.btn-group').append(API.Plugins.contacts.Layouts.details.GUI.button(dataset,{id:'id',color:'navy',icon:'fas fa-calendar-check',action:'attendance',content:API.Contents.Language['Attendance']}));
						}
					} else {
						if(API.Auth.validate('custom', 'contacts_btn_add_attendance', 1)){
							card.find('div.btn-group').append(API.Plugins.contacts.Layouts.details.GUI.button(dataset,{id:'id',color:'olive',icon:'fas fa-calendar-plus',action:'add',content:API.Contents.Language['Add Attendance']}));
						}
					}
					if(API.Auth.validate('plugins', 'contacts', 3)){
						card.find('div.btn-group').append(API.Plugins.contacts.Layouts.details.GUI.button(dataset,{id:'id',color:'warning',icon:'fas fa-edit',action:'edit',content:API.Contents.Language['Edit']}));
					}
					if(API.Auth.validate('custom', 'contacts_btn_delete', 1)){
						card.find('div.btn-group').append(API.Plugins.contacts.Layouts.details.GUI.button(dataset,{id:'id',color:'danger',icon:'fas fa-trash-alt',action:'delete',content:''}));
					}
				},
				button:function(dataset,options = {}){
					var defaults = {
						icon:"fas fa-building",
						action:"details",
						color:"primary",
						key:"name",
						id:"id",
						content:"",
					};
					if(API.Helper.isSet(options,['icon'])){ defaults.icon = options.icon; }
					if(API.Helper.isSet(options,['action'])){ defaults.action = options.action; }
					if(API.Helper.isSet(options,['color'])){ defaults.color = options.color; }
					if(API.Helper.isSet(options,['key'])){ defaults.key = options.key; }
					if(API.Helper.isSet(options,['id'])){ defaults.id = options.id; }
					if(API.Helper.isSet(options,['content'])){ defaults.content = options.content; }
					else { defaults.content = dataset[defaults.key]; }
					if(defaults.content != ''){ defaults.icon += ' mr-1'; }
					return '<button type="button" class="btn btn-sm bg-'+defaults.color+'" data-id="'+dataset[defaults.id]+'" data-action="'+defaults.action+'"><i class="'+defaults.icon+'"></i>'+defaults.content+'</button>';
				},
				card:function(dataset,options = {}){
					var csv = '';
					for(var [key, value] of Object.entries(dataset)){
						if(value == null){ value = '';dataset[key] = value; };
						if(jQuery.inArray(key,['first_name','middle_name','last_name','name','email','phone','mobile','office_num','other_num','about','job_title']) != -1){
							if(csv != ''){ csv += '|'; }
							if(typeof value == 'string'){ csv += value.replace(',','').toLowerCase(); }
							else { csv += value; }
						}
					}
					var html = '';
					html += '<div class="col-sm-12 col-md-6 contactCard" data-csv="'+csv+'" data-id="'+dataset.id+'">';
					  html += '<div class="card">';
							if(!dataset.isActive){ html += '<div class="ribbon-wrapper ribbon-xl"><div class="ribbon bg-danger text-xl">'+API.Contents.Language['Inactive']+'</div></div>'; }
					    html += '<div class="card-header border-bottom-0">';
					      html += '<b class="mr-1">Title:</b>'+dataset.job_title;
					    html += '</div>';
					    html += '<div class="card-body pt-0">';
					      html += '<div class="row">';
					        html += '<div class="col-7">';
					          html += '<h2 class="lead"><b>'+dataset.name+'</b></h2>';
					          html += '<p class="text-sm"><b>About: </b> '+dataset.about+' </p>';
					          html += '<ul class="ml-4 mb-0 fa-ul">';
					            html += '<li class="small"><span class="fa-li"><i class="fas fa-lg fa-at"></i></span><b class="mr-1">Email:</b><a href="mailto:'+dataset.email+'">'+dataset.email+'</a></li>';
					            html += '<li class="small"><span class="fa-li"><i class="fas fa-lg fa-phone"></i></span><b class="mr-1">Phone #:</b><a href="tel:'+dataset.phone+'">'+dataset.phone+'</a></li>';
					            html += '<li class="small"><span class="fa-li"><i class="fas fa-lg fa-phone"></i></span><b class="mr-1">Office #:</b><a href="tel:'+dataset.office_num+'">'+dataset.office_num+'</a></li>';
					            html += '<li class="small"><span class="fa-li"><i class="fas fa-lg fa-mobile"></i></span><b class="mr-1">Mobile #:</b><a href="tel:'+dataset.mobile+'">'+dataset.mobile+'</a></li>';
					            html += '<li class="small"><span class="fa-li"><i class="fas fa-lg fa-phone"></i></span><b class="mr-1">Other #:</b><a href="tel:'+dataset.other_num+'">'+dataset.other_num+'</a></li>';
					          html += '</ul>';
					        html += '</div>';
					        html += '<div class="col-5 text-center">';
					          html += '<img src="/dist/img/default.png" alt="user-avatar" class="img-circle img-fluid">';
					        html += '</div>';
					      html += '</div>';
					    html += '</div>';
					    html += '<div class="card-footer">';
					      html += '<div class="text-right">';
					        html += '<div class="btn-group"></div>';
					      html += '</div>';
					    html += '</div>';
					  html += '</div>';
					html += '</div>';
					return html;
				},
			},
			Events:function(dataset,layout,options = {},callback = null){
				var url = new URL(window.location.href);
				if(options instanceof Function){ callback = options; options = {}; }
				var defaults = {field: "name"};
				if(API.Helper.isSet(options,['field'])){ defaults.field = options.field; }
				var skeleton = {};
				for(var [field, settings] of Object.entries(API.Contents.Settings.Structure.contacts)){ skeleton[field] = ''; }
				var contacts = layout.content.contacts.find('div.row').eq(1);
				var search = layout.content.contacts.find('div.row').eq(0);
				search.find('div[data-action="clear"]').off().click(function(){
					$(this).parent().find('input').val('');
					contacts.find('[data-csv]').show();
				});
				search.find('input').off().on('input',function(){
					if($(this).val() != ''){
						contacts.find('[data-csv]').hide();
						contacts.find('[data-csv*="'+$(this).val().toLowerCase()+'"]').each(function(){ $(this).show(); });
					} else { contacts.find('[data-csv]').show(); }
				});
				if(API.Auth.validate('plugins', 'contacts', 2)){
					contacts.find('.addContact').off().click(function(){
						API.CRUD.create.show({ plugin:'contacts', keys:skeleton, set:{isActive:'true',relationship:url.searchParams.get("p"),link_to:dataset.this.raw.id} },function(created,user){
							if(created){
								user.dom.name = '';
								if((user.dom.first_name != '')&&(user.dom.first_name != null)){ if(user.dom.name != ''){user.dom.name += ' ';} user.dom.name += user.dom.first_name; }
								if((user.dom.middle_name != '')&&(user.dom.middle_name != null)){ if(user.dom.name != ''){user.dom.name += ' ';} user.dom.name += user.dom.middle_name; }
								if((user.dom.last_name != '')&&(user.dom.last_name != null)){ if(user.dom.name != ''){user.dom.name += ' ';} user.dom.name += user.dom.last_name; }
								API.Helper.set(dataset,['details','contacts','dom',user.dom.id],user.dom);
								API.Helper.set(dataset,['details','contacts','raw',user.raw.id],user.raw);
								API.Helper.set(dataset,['relations','contacts',user.dom.id],user.dom);
								API.Plugins.contacts.Layouts.details.GUI.contact(user.dom,layout);
								API.Plugins.contacts.Layouts.details.Events(dataset,layout);
								API.Plugins.contacts.Timeline.object(dataset,layout);
							}
						});
					});
				}
				contacts.find('button').off().click(function(){
					var contact = dataset.relations.contacts[$(this).attr('data-id')];
					switch($(this).attr('data-action')){
						case"details":
							API.CRUD.read.show({ key:'username',keys:contact.users[Object.keys(contact.users)[0]], href:"?p=users&v=details&id="+contact.users[Object.keys(contact.users)[0]].username, modal:true });
							break;
						case"link":
							API.Builder.modal($('body'), {
								title:'Create or link a user',
								icon:'event',
								zindex:'top',
								css:{ dialog: "modal-lg", header: "bg-success", body: "p-3"},
							}, function(modal){
								modal.on('hide.bs.modal',function(){ modal.remove(); });
								var dialog = modal.find('.modal-dialog');
								var header = modal.find('.modal-header');
								var body = modal.find('.modal-body');
								var footer = modal.find('.modal-footer');
								header.find('button[data-control="hide"]').remove();
								header.find('button[data-control="update"]').remove();
								body.html('<div class="row"></div>');
								footer.append('<button class="btn btn-success" data-action="create"><i class="fas fa-calendar-day mr-1"></i>'+API.Contents.Language['Create']+'</button>');
								footer.find('button[data-action="create"]').off().click(function(){ modal.modal('hide'); });
								modal.modal('show');
							});
							break;
						case"attendance":
							API.Builder.modal($('body'), {
								title:'View the attendance',
								icon:'event',
								zindex:'top',
								css:{ dialog: "modal-lg", header: "bg-success", body: "p-3"},
							}, function(modal){
								modal.on('hide.bs.modal',function(){ modal.remove(); });
								var dialog = modal.find('.modal-dialog');
								var header = modal.find('.modal-header');
								var body = modal.find('.modal-body');
								var footer = modal.find('.modal-footer');
								header.find('button[data-control="hide"]').remove();
								header.find('button[data-control="update"]').remove();
								body.html('<div class="row"></div>');
								footer.append('<button class="btn btn-success" data-action="create"><i class="fas fa-calendar-day mr-1"></i>'+API.Contents.Language['Create']+'</button>');
								footer.find('button[data-action="create"]').off().click(function(){ modal.modal('hide'); });
								modal.modal('show');
							});
							break;
						case"add":
							API.Builder.modal($('body'), {
								title:'Add attendance to event',
								icon:'event',
								zindex:'top',
								css:{ dialog: "modal-lg", header: "bg-success", body: "p-3"},
							}, function(modal){
								modal.on('hide.bs.modal',function(){ modal.remove(); });
								var dialog = modal.find('.modal-dialog');
								var header = modal.find('.modal-header');
								var body = modal.find('.modal-body');
								var footer = modal.find('.modal-footer');
								header.find('button[data-control="hide"]').remove();
								header.find('button[data-control="update"]').remove();
								body.html('<div class="row"></div>');
								API.Builder.input(body.find('div.row'), 'setVows', dataset.setVows,{plugin:'contacts',type:'switch'}, function(input){
									input.wrap('<div class="col-md-6 py-3"></div>');
									modal.on('shown.bs.modal',function(e){
									  input.find('input').last().bootstrapSwitch('state', dataset.setVows);
									});
								});
								footer.append('<button class="btn btn-success" data-action="create"><i class="fas fa-calendar-day mr-1"></i>'+API.Contents.Language['Create']+'</button>');
								footer.find('button[data-action="create"]').off().click(function(){ modal.modal('hide'); });
								modal.modal('show');
							});
							break;
						case"edit":
							if(API.Auth.validate('plugins', 'contacts', 3)){
								API.CRUD.update.show({ keys:contact, modal:true, plugin:'contacts' },function(user){
									user.dom.name = '';
									if((user.dom.first_name != '')&&(user.dom.first_name != null)){ if(user.dom.name != ''){user.dom.name += ' ';} user.dom.name += user.dom.first_name; }
									if((user.dom.middle_name != '')&&(user.dom.middle_name != null)){ if(user.dom.name != ''){user.dom.name += ' ';} user.dom.name += user.dom.middle_name; }
									if((user.dom.last_name != '')&&(user.dom.last_name != null)){ if(user.dom.name != ''){user.dom.name += ' ';} user.dom.name += user.dom.last_name; }
									API.Helper.set(dataset,['relations','contacts',user.dom.id],user.dom);
									contacts.find('[data-id="'+user.raw.id+'"]').remove();
									API.Plugins.contacts.Layouts.details.GUI.contact(user.dom,layout);
									API.Plugins.contacts.Layouts.details.Events(dataset,layout);
								});
							}
							break;
						case"delete":
							contact.link_to = dataset.this.raw.id;
							API.CRUD.delete.show({ keys:contact,key:'name', modal:true, plugin:'contacts' },function(user){
								if(contacts.find('[data-id="'+contact.id+'"]').find('.ribbon-wrapper').length > 0 || !API.Auth.validate('custom', 'contacts_isActive', 1)){
									contacts.find('[data-id="'+contact.id+'"]').remove();
									layout.timeline.find('[data-type="address-card"][data-id="'+contact.id+'"]').remove();
								}
								if(contact.isActive && API.Auth.validate('custom', 'contacts_isActive', 1)){
									contact.isActive = user.isActive;
									API.Helper.set(dataset,['relations','contacts',contact.id,'isActive'],contact.isActive);
									contacts.find('[data-id="'+contact.id+'"] .card').prepend('<div class="ribbon-wrapper ribbon-xl"><div class="ribbon bg-danger text-xl">'+API.Contents.Language['Inactive']+'</div></div>');
								}
							});
							break;
					}
				});
				if(callback != null){ callback(dataset,layout); }
			},
		},
	},
}

API.Plugins.contacts.init();
