﻿define([
    'common',
    'Validation'
],
function (common, Validation){
    var WorkflowsModel = Backbone.Model.extend({
        idAttribute: "_id",
        initialize: function(){
        	this.on('invalid', function(model, errors){
                if(errors.length > 0){
                    var msg = errors.join('\n');
                    alert(msg);
                }
            });
        },
            parse: true,
            parse: function (response) {
				return response;
			},
        validate: function(attrs,options){
            var errors = [];

          //  Validation.checkLoginField(errors, true, attrs.value[0].name);
            if (attrs.name){
                Validation.checkWorkflowNameField(errors, true, attrs.name,"Name");
            }
            if (attrs.value&&attrs.value[0].name){
                Validation.checkWorkflowNameField(errors, true, attrs.value[0].name,"Name");
            }

            if(errors.length > 0)
                return errors;

        },

        urlRoot: function () {
            return "/Workflows";
        }
    });

    return WorkflowsModel;
});
