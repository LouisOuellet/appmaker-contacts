API.Plugins.contacts = {
	element:{
		table:{
			index:{},
		},
	},
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
		if(API.Helper.isSet(API.Contents,['Settings','plugins','organizations','status']) && API.Contents.Settings.plugins.organizations.status){
			var isInitialized = setInterval(function() {
				clearInterval(isInitialized);
				if(API.Helper.isSet(API.Plugins,['organizations'])){
					API.Plugins.organizations.form.create.contact = {
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
						},function(response){
							API.Plugins.contacts.element.table.index = response.table;
						});
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
}

API.Plugins.contacts.init();
