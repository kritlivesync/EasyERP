﻿define([
    'models/OpportunitiesModel',
    'common'
],
    function (OpportunityModel, common) {
        var OpportunitiesCollection = Backbone.Collection.extend({
            model: OpportunityModel,
            url: "/Opportunities/",
            page: 1,
            namberToShow: null,
            contentType: null,

            initialize: function (options) {
                var that = this;
				this.startTime = new Date();
                this.contentType = options.contentType;
                this.wfStatus = [];
                this.wfStatus = options.status;
                this.namberToShow = options.count;

                if (options && options.viewType) {
                    this.url += options.viewType;
                   // delete options.viewType;
                }

                this.fetch({
                    data: options,
                    reset: true,
                    success: function(models,response) {
                        that.page ++;
                    },
                    error: function (models, xhr) {
                        if (xhr.status == 401) Backbone.history.navigate('#login', { trigger: true });
                    }
                });
            },

            showMore: function (options) {
                var that = this;

                var filterObject = options || {};

                filterObject['page'] = (options && options.page) ? options.page: this.page;
                filterObject['count'] = (options && options.count) ? options.count: this.namberToShow;
                filterObject['contentType'] = (options && options.contentType) ? options.contentType: this.contentType;
                this.fetch({
                    data: filterObject,
                    waite: true,
                    success: function (models) {
                        that.page ++;
                        that.trigger('showmore', models);
                    },
                    error: function() {
                        alert('Some Error');
                    }
                });
            },

            parse: true,
            parse: function (response) {
            	 if (response.data) {
                     _.map(response.data, function (opportunity) {
                         if (opportunity.creationDate)
                             opportunity.creationDate = common.utcDateToLocaleDate(opportunity.creationDate);
                         if (opportunity.expectedClosing)
                            opportunity.expectedClosing = common.utcDateToLocaleDate(opportunity.expectedClosing);
						 if (opportunity.nextAction)
							 opportunity.nextAction.date = ( opportunity.nextAction) ? common.utcDateToLocaleDate(opportunity.nextAction.date):'';
						 if (opportunity.createdBy)
                            opportunity.createdBy.date = common.utcDateToLocaleDateTime(opportunity.createdBy.date);
						 if (opportunity.editedBy)
                            opportunity.editedBy.date = common.utcDateToLocaleDateTime(opportunity.editedBy.date);
                         return opportunity;
                     });
                 }
                return response.data;
            }
        });

        return OpportunitiesCollection;
    });
