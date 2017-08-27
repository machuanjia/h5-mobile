/**
 * Created by yanshi0429 on 17/5/25.
 */
// function setScroll(pageInto,type) {
//     var myScroll;
//     var upIcon = $(pageInto).find('.leave-list-loading-top');
//     var downIcon = $(pageInto).find('.leave-list-loading-bottom');
//
//     myScroll = new IScroll($(pageInto).find('#wrapper')[0], {probeType: 3, mouseWheel: true});
//     myScroll.on("scroll", function () {
//         var y = this.y,
//             maxY = this.maxScrollY - y;
//         if (y >= 40) {
//             upIcon.show();
//             downIcon.hide();
//             return "";
//         } else if (y < 40 && y > 0) {
//             upIcon.hide();
//             return "";
//         }
//
//         if (maxY >= 40) {
//             downIcon.show();
//             upIcon.hide();
//             return "";
//         } else if (maxY < 40 && maxY >= 0) {
//             downIcon.hide();
//             return "";
//         }
//     });
//     myScroll.on("slideDown", function () {
//         // if (this.y > 40) {
//             FUN[type].slideDown();
//             console.log("slideDown");
//         // }
//     });
//     myScroll.on("slideUp", function () {
//         // if (this.maxScrollY - this.y > 40) {
//             FUN[type].slideUp();
//             console.log("slideUp");
//         // }
//     });
//     return myScroll;
// }
function setScroll(pageInto,type) {
    var myScroll;
    var upIcon = $(pageInto).find('.leave-list-loading-top');
    var downIcon = $(pageInto).find('.leave-list-loading-bottom');

    myScroll = new iScroll($(pageInto).find('#wrapper')[0], {
        onScrollMove: function () {
            var y = this.y,
                maxY = this.maxScrollY - y;
            if (y >= 40) {
                upIcon.show();
                upIcon.prop('show',true);
                downIcon.hide();
                downIcon.prop('show',false);
                return "";
            } else if (y < 40 && y > 0) {
                upIcon.hide();
                return "";
            }

            if (maxY >= 40) {
                downIcon.show();
                downIcon.prop('show',true);
                upIcon.hide();
                upIcon.prop('show',false);
                return "";
            } else if (maxY < 40 && maxY >= 0) {
                downIcon.hide();
                downIcon.prop('show',false);
                return "";
            }
        },
        onScrollEnd: function () {
            if(upIcon.prop('show')){
                FUN[type].slideDown();
                console.log("slideDown");
                upIcon.hide();
                upIcon.prop('show',false);
            }else if(downIcon.prop('show')){
                FUN[type].slideUp();
                console.log("slideUp");
                downIcon.hide();
                downIcon.prop('show',false);
            }
        }
    });
    return myScroll;
}


FUN = {
    personCode:personCode || '',
    currentType:'',
    currentStep:'',
    day:{
        dayScroll:null,
        pageInto:null,
        param:{
            start:moment().startOf('week'),
            end:moment().endOf('week'),
            searchPersonId:'',
            current:''
        },
        slideDown:function(){
            FUN.day.param.start.add(1,'weeks');
            FUN.day.param.end.add(1,'weeks');
            FUN.day.getData();
            console.log('slideDown fn');
        },
        slideUp:function(){
            FUN.day.param.start.subtract(1,'weeks');
            FUN.day.param.end.subtract(1,'weeks');
            FUN.day.getData();
            console.log('slideUp fn');
        },
        getData:function(){
            /**
             ---- 考勤日报 ----
             URL: /business/recordList?start=2017-07-16&end=2017-07-23&searchPersonId=-12312312389384;
             startState/endState: 0：正常， 1：迟到， 2：早退， 3： 补签卡
             {
                 personId:-123123123,
                     personName:张三,
                 deptName:研发部,
                 data:[
                 {
                     id:-123123123,
                     date:07-16,
                     dateName:周一,
                     state:0：工作日；1：休息日；2：法定节假日3：单位自主放假
                     kgState:0不旷工， 不等于0：旷工
                 info: 年假,调休,旷工,工作日加班
                 timeList:[
                     {
                         start:09:00, startState:1, end:12:00, endState:1
             },
                 {
                     start:13:00, startState:1, end:18:00, endState:1
                 }
             ]
             }
             ]
             }
             **/
            $.ajax({
                type: 'GET',
                url: '/central/mobile/recordList',
                data: {start:FUN.day.param.start.format('YYYY-MM-DD'),end:FUN.day.param.end.format('YYYY-MM-DD'),searchPersonId:FUN.day.param.searchPersonId,personCode:FUN.personCode},
                dataType: 'json',
                timeout: 300,
                context: $('body'),
                success: function (data) {
                    //通过personId判断是否是成功数据
                    if(data && data.personId){
                        FUN.day.param.searchPersonId = data.personId;
                        var _p = $(FUN.day.pageInto);
                        _p.find('.leave-header-name').text(data.personName);
                        _p.find('.leave-header-date').text(FUN.day.param.start.format('MM-DD'));
                        var html = "";
                        for(var i = 0; i < data.data.length; i++){
                            var _temp = data.data[i];
                            html+='<a href="day_detail.html" _id="'+_temp.id+'" data-preventdefault="setCurrentDetailId" data-reload class="leave-list-item flex-row">';
                            html+='<div class="leave-item-left">';
                            //state: 0,//0：工作日；1：休息日；2：法定节假日3：单位自主放假
                            // 迟到：字体红色
                            // 早退：字体红色
                            // 补签卡：字体绿色
                            // 矿工：背景黄色
                            // 休息日：蓝色
                            // 节假日：粉色
                            var _status = '';
                            if(_temp.kgState == 0){
                                if(_temp.state == 1){
                                    _status='leave-item-left-bg leave-item-left-business';
                                }else if(_temp.state == 2){
                                    _status='leave-item-left-bg leave-item-left-vacation';
                                }
                            }else{
                                _status='leave-item-left-bg leave-item-left-absenteeism';
                            }

                            html+='<div class="leave-item-left-week-date '+ _status +'">';
                            html+='<span class="leave-item-left-week">'+_temp.dateName+'</span>';
                            html+='<span class="leave-item-left-date">'+_temp.date+'</span>';
                            html+='</div>';
                            html+='</div>';
                            html+='<div class="leave-item-center flex-se1">';

                            for(var t = 0; t < _temp.timeList.length; t++){
                                var _tt = _temp.timeList[t];
                                html+='<div class="leave-item-center-title">';
                                var _ss='',es='';
                                //0：正常， 1：迟到， 2：早退， 3： 补签卡
                                if(_tt.startState == 1){
                                    _ss = 'text-red';
                                }else if(_tt.startState == 3){
                                    _ss = 'text-green';
                                }
                                if(_tt.endState == 2){
                                    _ss = 'text-red';
                                }else if(_tt.endState == 3){
                                    _ss = 'text-green';
                                }

                                html+='<span class="start '+_ss+'">'+_tt.start+'</span>';
                                html+='<span class="to">-</span>';
                                html+='<span class="end '+es+'">'+_tt.end+'</span>';
                                html+='</div>';
                            }


                            if(_temp.info){
                                html+='<div class="leave-item-center-desc">';
                                html+=_temp.info;
                                html+='</div>';
                            }
                            html+='</div>';
                            html+='</a>';
                        }

                        //下拽在最上面插入
                        if(FUN.day.param.start > moment().startOf('week')){
                            _p.find('.leave-list-body-content').prepend(html);
                        }else {
                            //上拽在最下面插入
                            _p.find('.leave-list-body-content').append(html);
                        }
                        if(FUN.day.dayScroll){
                            FUN.day.dayScroll.refresh();
                        }
                    }else{
                        $(FUN.schedule.pageInto).find('.leave-list-body-content').append('<div class="empty">数据获取错误，请检查网络或刷新重试!</div>');
                    }

                },
                error: function (xhr, type) {
                    console.log('Ajax day data error!')
                }
            });


        },
        getDetail:function(pageInto){
            /**
            ---- 考勤日报明细 ----
            URL: /mobile/dayResultDetail?id=-12312312389384;
            {
                date:2017-08-25,
                    flightName:工作日,
                start:签到时间,
                end:签退时间,
                chuqing:出勤,
                state: 状态,
                chidao: 迟早,
                zaotui: 早退,
                kg:旷工,
                bqk:补签卡,
                sj:事假,
                jb:加班,
                gc:公出
            }
             **/

            $.ajax({
                type: 'GET',
                url: '/central/mobile/dayResultDetail',
                data: {id:FUN.day.param.current},
                dataType: 'json',
                timeout: 300,
                context: $('body'),
                success: function (data) {
                    //通过personId判断是否是成功数据
                    if(data && data.date){
                            $(pageInto).find('.date').text(_data.date);
                            $(pageInto).find('.flightName').text(_data.flightName);
                            $(pageInto).find('.start').text(_data.start);
                            $(pageInto).find('.end').text(_data.end);
                            $(pageInto).find('.chuqing').text(_data.chuqing);
                            $(pageInto).find('.state').text(_data.state);
                            $(pageInto).find('.chidao').text(_data.chidao);
                            $(pageInto).find('.zaotui').text(_data.zaotui);
                            $(pageInto).find('.kg').text(_data.kg);
                            $(pageInto).find('.bqk').text(_data.bqk);
                            $(pageInto).find('.sj').text(_data.sj);
                            $(pageInto).find('.jb').text(_data.jb);
                            $(pageInto).find('.gc').text(_data.gc);
                    }else{
                        $(pageInto).find('.leave-detail-body').append('<div class="empty">数据获取错误，请检查网络或刷新重试!</div>');
                    }
                },
                error: function (xhr, type) {
                    console.log('Ajax approval detail error!')
                }
            });

        }
    },
    dayInit: function (pageInto, pageOut, response) {
        FUN.currentType = 'day';
        FUN.day.dayScroll = setScroll(pageInto,'day');
    },
    dayCallBack: function (pageInto, pageOut, response) {
        FUN.day.pageInto = pageInto;
        if(FUN.currentStep === 'search'){
            FUN.currentStep = '';
        }else{
            FUN.day.getData();
        }
    },
    dayFallback:function(pageInto, pageOut, response){
        FUN.day.param = {
            start:moment().startOf('week'),
            end:moment().endOf('week'),
            searchPersonId:''
        };
    },
    dayDetailCallBack:function(pageInto, pageOut, response){
        console.log('add day detail');
        if(FUN.day.param.current){
            FUN.day.getDetail(pageInto);
        }
    },


    month:{
        monthScroll:null,
        pageInto:null,
        param:{
            start:moment().startOf('month'),
            end:moment().endOf('month'),
            searchPersonId:''
        },
        slideDown:function(){
            FUN.month.param.start.add(1,'months');
            FUN.month.param.end.add(1,'months');
            FUN.month.getData();
            console.log('slideDown fn');
        },
        slideUp:function(){
            FUN.month.param.start.subtract(1,'months');
            FUN.month.param.end.subtract(1,'months');
            FUN.month.getData();
            console.log('slideUp fn');
        },
        getData:function(){
            /**
             ---- 考勤月报 ----
             ---- period  考勤期间 yyyy-MM  ，  searchPersonId 需要查询的人员OA ID， personCode 当前人员OA ID，

             URL: /business/listReports?period=2017-08&searchPersonId=-12312312389384&personCode=;

             {
                 personId:-123123123,
                 personName:张三,
                 deptName:研发部,
                 jobNumber:123,
                 data:[
                     {
                         fieldName:应出勤(天),
                         fieldValue:21
                     },{
                         fieldName:迟到(分钟),
                         fieldValue:1
                     }
                 ]
             }
             **/
            $.ajax({
                type: 'GET',
                url: '/central/mobile/listReports',
                data: {period:FUN.month.param.start.format('YYYY-MM'),searchPersonId:FUN.month.param.searchPersonId,personCode:FUN.personCode},
                dataType: 'json',
                timeout: 300,
                context: $('body'),
                success: function (data) {
                    //通过personId判断是否是成功数据
                    if(data && data.personId){
                        FUN.month.param.searchPersonId = data.personId;
                        var _p = $(FUN.month.pageInto);
                        _p.find('.leave-header-name').text(FUN.month.param.start.format('YYYY-MM'));
                        var html = "";
                        for(var i = 0; i < data.data.length; i++) {
                            var _temp = data.data[i];
                            html+='<div class="leave-detail-item flex flex-row">';
                                html+='<div class="leave-detail-item-left">';
                                    html+=_temp.fieldName+'：';
                                html+='</div>';
                                html+='<div class="leave-detail-item-right">';
                                    html+=_temp.fieldValue;
                                html+='</div>';
                            html+='</div>';


                        }
                        //下拽在最上面插入
                        if(FUN.month.param.start > moment().startOf('month')){
                            _p.find('.leave-list-body-content').prepend(html);
                        }else {
                            //上拽在最下面插入
                            _p.find('.leave-list-body-content').append(html);
                        }
                        if(FUN.month.monthScroll){
                            FUN.month.monthScroll.refresh();
                        }
                    }else{
                        $(FUN.month.pageInto).find('.leave-list-body-content').append('<div class="empty">数据获取错误，请检查网络或刷新重试!</div>');
                    }

                },
                error: function (xhr, type) {
                    console.log('Ajax month data error!')
                }
            });
        }
    },
    monthInit: function (pageInto, pageOut, response) {
        console.log('monthInit');
        FUN.currentType = 'month';
        FUN.month.monthScroll = setScroll(pageInto,'month');
    },
    monthCallBack: function (pageInto, pageOut, response) {
        console.log('monthCallBack');
        FUN.month.pageInto = pageInto;
        if(FUN.currentStep === 'search'){
            FUN.currentStep = '';
        }else{
            FUN.month.getData();
        }
    },
    monthFallback:function(pageInto, pageOut, response){
        console.log('monthFallback');
        FUN.month.param = {
            start:moment().startOf('month'),
            end:moment().endOf('month'),
            searchPersonId:''
        };
    },


    schedule:{
        scheduleScroll:null,
        pageInto:null,
        param:{
            start:moment().startOf('week'),
            end:moment().endOf('week'),
            searchPersonId:''
        },
        slideDown:function(){
            FUN.schedule.param.start.add(1,'weeks');
            FUN.schedule.param.end.add(1,'weeks');
            FUN.schedule.getData();
            console.log('slideDown fn');
        },
        slideUp:function(){
            FUN.schedule.param.start.subtract(1,'weeks');
            FUN.schedule.param.end.subtract(1,'weeks');
            FUN.schedule.getData();
            console.log('slideUp fn');
        },
        getData:function(){
            /**
             ----  考勤排班 ----

             URL: /business/listSchedulingPlan?start=2017-07-16&end=2017-07-23&searchPersonId=-12312312389384&personCode=;

             {
                 personId:-123123123,
                 personName:张三,
                 deptName:研发部,
                 data:[
                     {
                         date:07-16,
                         dateName:周一,
                         state:0：工作日；1：休息日；2：法定节假日3：单位自主放假
                         name:早班,
                         times:[
                             {
                                 start:09:00, end:12:00
                             }, {
                                 start:13:00, end:18:00
                             }
                         ]
                     }
                 ]
             }
             **/
            $.ajax({
                type: 'GET',
                url: '/central/mobile/listSchedulingPlan',
                data: {start:FUN.schedule.param.start.format('YYYY-MM-DD'),end:FUN.schedule.param.end.format('YYYY-MM-DD'),searchPersonId:FUN.schedule.param.searchPersonId,personCode:FUN.personCode},
                dataType: 'json',
                timeout: 300,
                context: $('body'),
                success: function (data) {
                    //通过personId判断是否是成功数据
                    if(data && data.personId){
                        FUN.schedule.param.searchPersonId = data.personId;
                        var _p = $(FUN.schedule.pageInto);
                        _p.find('.leave-header-name').text(data.personName);
                        _p.find('.leave-header-date').text(FUN.schedule.param.start.format('YYYY-MM'));

                        var html = "";
                        if(data.data.length > 0){
                            for(var i = 0; i < data.data.length; i++) {
                                var _temp = data.data[i];
                                html+='<div class="leave-list-item flex-row">';
                                html+='<div class="leave-item-left">';
                                if(_temp.state == 2){
                                    html+='<div class="leave-item-left-week-date leave-item-left-bg leave-item-left-vacation">';
                                }else if(_temp.state == 1){
                                    html+='<div class="leave-item-left-week-date leave-item-left-bg leave-item-left-business">';
                                }else{
                                    html+='<div class="leave-item-left-week-date">';
                                }
                                html+='<span class="leave-item-left-week">'+ _temp.dateName +'</span>';
                                html+='<span class="leave-item-left-date">'+ _temp.date +'</span>';
                                html+='</div>';
                                html+='</div>';
                                html+='<div class="leave-item-center flex-se1">';
                                html+='<div class="leave-item-center-title">';
                                html+='<span class="start">'+_temp.name+'</span>';
                                html+='</div>';
                                html+='<div class="leave-item-center-desc">';

                                html+='</div>';
                                html+='</div>';
                                html+='</div>';


                            }
                        }
                        //下拽在最上面插入
                        if(FUN.schedule.param.start > moment().startOf('week')){
                            _p.find('.leave-list-body-content').prepend(html);
                        }else {
                            //上拽在最下面插入
                            _p.find('.leave-list-body-content').append(html);
                        }
                        if(FUN.schedule.scheduleScroll){
                            FUN.schedule.scheduleScroll.refresh();
                        }
                    }else{
                        $(FUN.schedule.pageInto).find('.leave-list-body-content').append('<div class="empty">数据获取错误，请检查网络或刷新重试!</div>');
                    }
                },
                error: function (xhr, type) {
                    console.log('Ajax schedule data error!')
                }
            });
        }
    },
    scheduleInit: function (pageInto, pageOut, response) {
        console.log('scheduleInit');
        FUN.currentType = 'schedule';
        FUN.schedule.scheduleScroll = setScroll(pageInto,'schedule');
    },
    scheduleCallBack: function (pageInto, pageOut, response) {
        console.log('scheduleCallBack');
        FUN.schedule.pageInto = pageInto;
        if(FUN.currentStep === 'search'){
            FUN.currentStep = '';
        }else{
            FUN.schedule.getData();
        }
    },
    scheduleFallback:function(pageInto, pageOut, response){
        console.log('scheduleFallback');
        FUN.schedule.param = {
            start:moment().startOf('week'),
            end:moment().endOf('week'),
            searchPersonId:''
        };
    },
    scheduleDetailCallBack:function(pageInto, pageOut, response){
        console.log('add schedule detail');
        var _html = '';
        _html+='<div class="leave-detail-item flex flex-row">';
            _html+='<div class="leave-detail-item-left">';
            _html+='补签卡：';
            _html+='</div>';
            _html+='<div class="leave-detail-item-right">';
            _html+='-';
            _html+='</div>';
        _html+='</div>';
        $(pageInto).find('.leave-detail-body').append(_html);
    },



    vacation:{
        vacationScroll:null,
        pageInto:null,
        param:{
            start:moment().startOf('month'),
            searchPersonId:''
        },
        slideDown:function(){
            FUN.vacation.getData();
            console.log('slideDown fn');
        },
        slideUp:function(){
            FUN.vacation.getData();
            console.log('slideUp fn');
        },
        getData:function(){
            /**
             ----  假期额度 ----
             -- 查询人员所有有效的假期额度
             URL: /business/holidayQuota?searchPersonId=-12312312389384&personCode=;

             {
                 personId:-123123123,
                 personName:张三,
                 deptName:研发部,
                 data: [
                     {
                         year:2017,
                         name:年假,
                         total:10天,
                         balance:2天,
                         validateStart:2017-03-10,
                         validateEnd:2017-12-30
                     },
                     {
                         year:2017,
                         name:调休,
                         total:10天,
                         balance:2天,
                         validateStart:2017-03-10,
                         validateEnd:2017-12-30
                     }
                 ]
             }
             **/
            $.ajax({
                type: 'GET',
                url: '/central/mobile/holidayQuota',
                data: {searchPersonId:FUN.schedule.param.searchPersonId,personCode:FUN.personCode},
                dataType: 'json',
                timeout: 300,
                context: $('body'),
                success: function (data) {
                    //通过personId判断是否是成功数据
                    if(data && data.personId){
                        FUN.vacation.param.searchPersonId = data.personId;
                        var _p = $(FUN.vacation.pageInto);
                        _p.find('.leave-header-name').text(data.personName);
                        _p.find('.leave-header-date').text(FUN.vacation.param.start.format('YYYY-MM'));

                        var html = "";
                        if(data.data.length > 0){
                            for(var i = 0; i < data.data.length; i++) {
                                var _temp = data.data[i];
                                html+='<div class="leave-list-item flex-row">';
                                    html+='<div class="leave-item-left">';
                                        html+='<div class="leave-item-left-week-date">';
                                            html+='<span class="leave-item-left-week">'+_temp.name+'</span>';
                                            html+='<span class="leave-item-left-date">'+_temp.year+'</span>';
                                        html+='</div>';
                                    html+='</div>';
                                    html+='<div class="leave-item-center flex-se1">';
                                        html+='<div class="leave-item-center-title">';
                                            html+='<span class="start">总数:'+_temp.total+'  余额:'+_temp.balance+'</span>';
                                        html+='</div>';
                                        html+='<div class="leave-item-center-desc">';
                                            html+=_temp.validateStart+' - '+_temp.validateEnd;
                                        html+='</div>';
                                    html+='</div>';
                                html+='</div>';
                            }
                        }
                        _p.find('.leave-list-body-content').append(html);
                    }else{
                        $(FUN.vacation.pageInto).find('.leave-list-body-content').append('<div class="empty">数据获取错误，请检查网络或刷新重试!</div>');
                    }
                },
                error: function (xhr, type) {
                    console.log('Ajax vacation data error!')
                }
            });
        }
    },
    vacationInit: function (pageInto, pageOut, response) {
        console.log('vacationInit');
        FUN.currentType = 'vacation';
    },
    vacationCallBack: function (pageInto, pageOut, response) {
        console.log('vacationCallBack');
        FUN.vacation.pageInto = pageInto;
        if(FUN.currentStep === 'search'){
            FUN.currentStep = '';
        }else{
            FUN.vacation.getData();
        }
    },
    vacationFallback:function(pageInto, pageOut, response){
        console.log('vacationFallback');
        FUN.vacation.param = {
            start:moment().startOf('month'),
            searchPersonId:''
        };
    },

    sign:{
        signScroll:null,
        pageInto:null,
        param:{
            start:moment().startOf('week'),
            end:moment().endOf('week'),
            searchPersonId:''
        },
        slideDown:function(){
            FUN.sign.param.start.add(1,'weeks');
            FUN.sign.param.end.add(1,'weeks');
            FUN.sign.getData();
            console.log('slideDown fn');
        },
        slideUp:function(){
            FUN.sign.param.start.subtract(1,'weeks');
            FUN.sign.param.end.subtract(1,'weeks');
            FUN.sign.getData();
            console.log('slideUp fn');
        },
        getData:function(){
            /**
             ----  签卡记录 ----
             URL: /business/getListLBSInfo?start=2017-07-16&end=2017-07-23&searchPersonId=-12312312389384&personCode=;

             {
                 personId:-123123123,
                 personName:张三,
                 deptName:研发部,
                 data:[
                     {
                         dateName:周一,
                         times:[
                             {
                                 dateTime:2017-03-04 09:30,
                                 info:外勤/补签卡/移动打卡,
                                 text:'地点或者来源'
                             },{
                                 dateTime:2017-03-04 12:00,
                                 info:外勤/补签卡/移动打卡,
                                 text:'地点或者来源'
                             }
                         ]
                     },
                     {
                         dateName:周二,
                         times:[
                             {
                                 dateTime:2017-03-05 09:30,
                                 info:外勤/补签卡/移动打卡,
                                 text:'地点或者来源'
                             },{
                                 dateTime:2017-03-05 12:00,
                                 info:外勤/补签卡/移动打卡,
                                 text:'地点或者来源'
                             }
                         ]
                     }
                 ]
             }

             **/
            $.ajax({
                type: 'GET',
                url: '/central/mobile/getListLBSInfo',
                data: {start:FUN.sign.param.start.format('YYYY-MM-DD'),end:FUN.sign.param.end.format('YYYY-MM-DD'),searchPersonId:FUN.sign.param.searchPersonId,personCode:FUN.personCode},
                dataType: 'json',
                timeout: 300,
                context: $('body'),
                success: function (data) {
                    //通过personId判断是否是成功数据
                    if(data && data.personId){
                        FUN.sign.param.searchPersonId = data.personId;
                        var _p = $(FUN.sign.pageInto);
                        _p.find('.leave-header-name').text(data.personName);
                        // _p.find('.leave-header-date').text(FUN.sign.param.start.format('MM-DD'));
                        var html = "";
                        for(var i = 0; i < data.data.length; i++){
                            var _temp = data.data[i];

                            html+='<div class="leave-list-item flex-row">';
                                html+='<div class="leave-item-left">';
                                    html+='<div class="leave-item-left-week-date">';
                                        html+='<span class="leave-item-left-week">'+_temp.dateName+'</span>';
                                    html+='</div>';
                                html+='</div>';
                                html+='<div class="leave-item-center flex-se1">';
                                if(_temp.times){
                                    for(var t = 0; t < _temp.times.length; i++){
                                        var _tt = _temp.times[t];
                                        html+='<div class="leave-item-center-item">';
                                            html+='<div class="leave-item-center-title">';
                                                html+='<span class="start">'+_tt.dateTime+'</span>';
                                            html+='</div>';
                                            html+='<div class="leave-item-center-desc">';
                                                html+=_tt.info;
                                            html+='</div>';
                                            html+='<div class="leave-item-center-address">';
                                                html+=_tt.text;
                                            html+='</div>';
                                        html+='</div>';
                                    }
                                }
                                html+='</div>';
                            html+='</div>';
                        }

                        //下拽在最上面插入
                        if(FUN.sign.param.start > moment().startOf('week')){
                            _p.find('.leave-list-body-content').prepend(html);
                        }else {
                            //上拽在最下面插入
                            _p.find('.leave-list-body-content').append(html);
                        }
                        if(FUN.sign.signScroll){
                            FUN.sign.signScroll.refresh();
                        }
                    }else{
                        $(FUN.sign.pageInto).find('.leave-list-body-content').append('<div class="empty">数据获取错误，请检查网络或刷新重试!</div>');
                    }

                },
                error: function (xhr, type) {
                    console.log('Ajax sign data error!')
                }
            });
        }
    },
    signInit: function (pageInto, pageOut, response) {
        FUN.currentType = 'sign';
        FUN.sign.signScroll = setScroll(pageInto,'sign');
    },
    signCallBack: function (pageInto, pageOut, response) {
        FUN.sign.pageInto = pageInto;
        if(FUN.currentStep === 'search'){
            FUN.currentStep = '';
        }else{
            FUN.sign.getData();
        }
    },
    signFallback:function(pageInto, pageOut, response){
        FUN.sign.param = {
            start:moment().startOf('week'),
            end:moment().endOf('week'),
            searchPersonId:''
        };
    },


    form:{
        formScroll:null,
        pageInto:null,
        param:{
            start:moment().startOf('week'),
            end:moment().endOf('week'),
            searchPersonId:'',
            current:''
        },
        slideDown:function(){
            FUN.form.param.start.add(1,'weeks');
            FUN.form.param.end.add(1,'weeks');
            FUN.form.getData();
            console.log('slideDown fn');
        },
        slideUp:function(){
            FUN.form.param.start.subtract(1,'weeks');
            FUN.form.param.end.subtract(1,'weeks');
            FUN.form.getData();
            console.log('slideUp fn');
        },
        getData:function(){
            /**
             ----  表单记录 ----
             URL: /business/getListForm?start=2017-07-16&end=2017-07-23&searchPersonId=-12312312389384;

             {
                 personId:-123123123,
                 personName:张三,
                 deptName:研发部,
                 data:[
                     {
                         typeName:事假,
                         value:2天,
                         start:2017-07-16 09:00,
                         end:2017-07-16 18:00
                     }
                 ]
             }

             **/
            $.ajax({
                type: 'GET',
                url: '/central/mobile/getListForm',
                data: {start:FUN.form.param.start.format('YYYY-MM-DD'),end:FUN.form.param.end.format('YYYY-MM-DD'),searchPersonId:FUN.form.param.searchPersonId,personCode:FUN.personCode},
                dataType: 'json',
                timeout: 300,
                context: $('body'),
                success: function (data) {
                    //通过personId判断是否是成功数据
                    if(data && data.personId){
                        FUN.form.param.searchPersonId = data.personId;
                        var _p = $(FUN.form.pageInto);
                        _p.find('.leave-header-name').text(data.personName);
                        // _p.find('.leave-header-date').text(FUN.sign.param.start.format('MM-DD'));
                        var html = "";
                        for(var i = 0; i < data.data.length; i++){
                            var _temp = data.data[i];
                            html+'<a href="form_detail.html" _id="'+_temp.id+'" data-preventdefault="setCurrentDetailId" data-reload class="leave-list-item flex-row">';
                                html+'<div class="leave-item-center flex-se1">';
                                    html+'<div class="leave-item-center-title">';
                                        html+'<span class="start">'+_temp.typeName+':'+_temp.value+'</span>';
                                    html+'</div>';
                                    html+'<div class="leave-item-center-desc">';
                                        html+_temp.start+' - '+_temp.end;
                                    html+'</div>';
                                html+'</div>';
                            html+'</a>';
                        }

                        //下拽在最上面插入
                        if(FUN.form.param.start > moment().startOf('week')){
                            _p.find('.leave-list-body-content').prepend(html);
                        }else {
                            //上拽在最下面插入
                            _p.find('.leave-list-body-content').append(html);
                        }
                        if(FUN.form.formScroll){
                            FUN.form.formScroll.refresh();
                        }
                    }else{
                        $(FUN.form.pageInto).find('.leave-list-body-content').append('<div class="empty">数据获取错误，请检查网络或刷新重试!</div>');
                    }

                },
                error: function (xhr, type) {
                    console.log('Ajax form data error!')
                }
            });
        },
        getDetail:function(pageInto){
            /**
            ---- 表单记录 详情 ----
                URL: /mobile/getListFormDetail?id=123123232;
            {
                deptName:测试,
                    jobNumber:222,
                personName:行政,
                invoiceType: 表单类型 -- 请假：0加班：1出差：2延期: 3
	            formType: 类别 --  公出/请假/加班
                start:2017-01-01 09:00,
                end:2017-01-02 18:00,
                time:5.0天
                text:事由,
                    remark:备注,
                flowsState:已结束/流转中
            }
             **/

            $.ajax({
                type: 'GET',
                url: '/central/mobile/getListFormDetail',
                data: {id:FUN.approval.param.current},
                dataType: 'json',
                timeout: 300,
                context: $('body'),
                success: function (data) {
                    //通过personId判断是否是成功数据
                    if(data && data.deptName){
                            $(pageInto).find('.personName').text(_data.personName);
                            $(pageInto).find('.deptName').text(_data.deptName);
                            $(pageInto).find('.personCode').text(_data.personCode);
                            $(pageInto).find('.address').text(_data.address);
                            $(pageInto).find('.time').text(_data.time);
                            $(pageInto).find('.text').text(_data.text);
                            $(pageInto).find('.flowsState').text(_data.flowsState);

                    }else{
                        $(pageInto).find('.leave-detail-body').append('<div class="empty">数据获取错误，请检查网络或刷新重试!</div>');
                    }
                },
                error: function (xhr, type) {
                    console.log('Ajax approval detail error!')
                }
            });

        }
    },
    formInit: function (pageInto, pageOut, response) {
        FUN.currentType = 'form';
        FUN.form.formScroll = setScroll(pageInto,'form');
    },
    formCallBack: function (pageInto, pageOut, response) {
        FUN.form.pageInto = pageInto;
        if(FUN.currentStep === 'search'){
            FUN.currentStep = '';
        }else{
            FUN.form.getData();
        }
    },
    formFallback:function(pageInto, pageOut, response){
        FUN.form.param = {
            start:moment().startOf('week'),
            end:moment().endOf('week'),
            searchPersonId:''
        };
    },
    formDetailCallBack:function (pageInto, pageOut, response) {
        console.log('add form detail');
        // var _html = '';
        // _html+='<div class="leave-detail-item flex flex-row">';
        // _html+='<div class="leave-detail-item-left">';
        // _html+='部门：';
        // _html+='</div>';
        // _html+='<div class="leave-detail-item-right">';
        // _html+='财务部';
        // _html+='</div>';
        // _html+='</div>';
        // $(pageInto).find('.leave-detail-body').append(_html);
        if(FUN.form.param.current){
            FUN.form.getDetail(pageInto);
        }
    },

    approval:{
        approvalScroll:null,
        pageInto:null,
        param:{
            start:moment().startOf('week'),
            end:moment().endOf('week'),
            searchPersonId:'',
            type:1,
            banchType:1,
            ids:'',
            current:''
        },
        slideDown:function(){
            FUN.approval.param.start.add(1,'weeks');
            FUN.approval.param.end.add(1,'weeks');
            FUN.approval.getData();
            console.log('slideDown fn');
        },
        slideUp:function(){
            FUN.approval.param.start.subtract(1,'weeks');
            FUN.approval.param.end.subtract(1,'weeks');
            FUN.approval.getData();
            console.log('slideUp fn');
        },
        getData:function(){
            /**
             ----  外勤审核 ----
             type: 0：待审核， 1： 我的

             URL: /business/getListLBSWqInfo?start=2017-07-16&end=2017-07-23&searchPersonId=-12312312389384&type=1;

             {
                 data:[
                     {
                         personId:-123123123,
                         personName:张三,
                         deptName:研发部,
                         time:2017-09-09 09:00,
                         address:北京市海淀区知春路,
                         state: 0:待审核，1:已审核,
                         id:-123123123
                     }
                 ]
             }

             **/
            $.ajax({
                type: 'GET',
                url: '/central/mobile/getListLBSWqInfo',
                data: {start:FUN.approval.param.start.format('YYYY-MM-DD'),end:FUN.approval.param.end.format('YYYY-MM-DD'),searchPersonId:FUN.approval.param.searchPersonId,personCode:FUN.personCode,type:FUN.approval.param.type},
                dataType: 'json',
                timeout: 300,
                context: $('body'),
                success: function (data) {
                    //通过personId判断是否是成功数据
                    if(data && data.personId){
                        FUN.approval.param.searchPersonId = data.personId;
                        var _p = $(FUN.approval.pageInto);
                        var html = "";
                        for(var i = 0; i < data.data.length; i++){
                            var _temp = data.data[i];

                            html+='<div id="'+_temp.id+'" class="leave-list-item leave-list-item-relative flex-row">';
                                html+='<div class="leave-item-left">';
                                    html+='<div class="leave-item-left-week-date">';
                                        html+='<span class="leave-item-left-week">';
                                            html+='<input _id="'+_temp.id+'" class="leave-item-checkbox leave-item-checkbox-item" type="checkbox"/>';
                                        html+='</span>';
                                    html+='</div>';
                                html+='</div>';
                                html+='<div class="leave-list-item-relative-date">'+_temp.time+'</div>';
                                html+='<a href="approval_detail.html" data-reload _id="'+_temp.id+'" data-preventdefault="setCurrentDetailId" class="leave-item-center w100">';
                                    html+='<div class="leave-item-center-title">';
                                        html+='<span class="start">'+_temp.personName+'</span>';
                                    html+='</div>';
                                    html+='<div class="leave-item-center-desc">';
                                        html+='<div class="leave-item-center-desc-text">';
                                            html+=_temp.address;
                                        html+='</div>';
                                        html+='<div class="leave-item-center-desc-stat text-red">';
                                            html+=_temp.state?'已审核':'待审核';
                                        html+='</div>';
                                    html+='</div>';
                                html+='</a>';
                            html+='</div>';

                        }

                        //下拽在最上面插入
                        if(FUN.approval.param.start > moment().startOf('week')){
                            _p.find('.leave-list-body-content').prepend(html);
                        }else {
                            //上拽在最下面插入
                            _p.find('.leave-list-body-content').append(html);
                        }
                        if(FUN.approval.approvalScroll){
                            FUN.approval.approvalScroll.refresh();
                        }
                    }else{
                        $(FUN.approval.pageInto).find('.leave-list-body-content').append('<div class="empty">数据获取错误，请检查网络或刷新重试!</div>');
                    }

                },
                error: function (xhr, type) {
                    console.log('Ajax approval data error!')
                }
            });
        },
        banchAction:function (callbackType) {
            /**
            ----  外勤批量审核 ----
                type: 1: 审核， 2:拒绝

            URL: /business/checkLbs?type=1&ids=12313,656565
             **/
            $.ajax({
                type: 'GET',
                url: '/central/mobile/checkLbs',
                data: {type:FUN.approval.param.banchType,ids:FUN.approval.param.ids},
                dataType: 'json',
                timeout: 300,
                context: $('body'),
                success: function (data) {
                    //通过personId判断是否是成功数据
                    if(data && data.personId){
                        //删除已经审核通过的数据
                        if(callbackType === 'list'){
                            var _array = FUN.approval.param.ids.split(',');
                            for(var p = 0; p<_array.length; p++){
                                $('#'+_array[p]).remove();
                            }
                        }else if(callbackType === 'detail'){
                            window.history.back();
                        }


                    }
                },
                error: function (xhr, type) {
                    console.log('Ajax approval banchAction error!')
                }
            });


        },
        getDetail:function(pageInto){
            /**
             ----  外勤审核查看详情 ----

             URL: /business/getListLBSWqInfoDetail?id=-123123123;
             {
                 data: [
                         id:121212,
                         personId:-123123123,
                         personName:张三,
                         deptName:研发部,
                         personCode:00112,
                         address:北京市海淀区知春路,
                         time:2017-09-09 09:00,
                         text:备注
                 ]
             }
             **/
            $.ajax({
                type: 'GET',
                url: '/central/mobile/getListLBSWqInfoDetail',
                data: {id:FUN.approval.param.current},
                dataType: 'json',
                timeout: 300,
                context: $('body'),
                success: function (data) {
                    //通过personId判断是否是成功数据
                    if(data && data.data){
                        var _data = data.data[0];
                        if(_data){
                            $(pageInto).find('.personName').text(_data.personName);
                            $(pageInto).find('.deptName').text(_data.deptName);
                            $(pageInto).find('.personCode').text(_data.personCode);
                            $(pageInto).find('.address').text(_data.address);
                            $(pageInto).find('.time').text(_data.time);
                            $(pageInto).find('.text').text(_data.text);
                            $(pageInto).find('.leave-detail-item-action').removeClass('hide');

                            $(pageInto).find('#detail_agree').unbind('click').click(function(){
                                FUN.approval.param.ids = _data.id;
                                FUN.approval.param.banchType = 1;
                                FUN.approval.banchAction('detail');

                            });
                            $(pageInto).find('#detail_reject').unbind('click').click(function(){
                                FUN.approval.param.ids = _data.id;
                                FUN.approval.param.banchType = 2;
                                FUN.approval.banchAction('detail');
                            });


                        }
                    }else{
                        $(pageInto).find('.leave-detail-body').append('<div class="empty">数据获取错误，请检查网络或刷新重试!</div>');
                    }
                },
                error: function (xhr, type) {
                    console.log('Ajax approval detail error!')
                }
            });
        }
    },
    approvalInit: function (pageInto, pageOut, response) {
        FUN.currentType = 'approval';
        FUN.approval.approvalScroll = setScroll(pageInto,'approval');

        $(pageInto).find('.leave-item-checkbox-all').unbind('click').click(function(event){
            event.stopPropagation();
            var _pp = $(this).is(':checked');
            $(pageInto).find('.leave-item-checkbox-item').each(function () {
                $(this).prop('checked',_pp);
            });
        });


        $(pageInto).find('#agree').unbind('click').click(function(event){
            event.stopPropagation();
            FUN.approval.param.banchType = 1;
            var array = [];
            $(pageInto).find('.leave-item-checkbox-item').each(function () {
                if($(this).prop('checked')){
                    array.push($(this).attr('_id'));
                }
            });
            if(array.length > 0){
                FUN.approval.param.ids = array.join(',');
                FUN.approval.banchAction('list');
            }
        });

        $(pageInto).find('#reject').unbind('click').click(function(event){
            event.stopPropagation();
            FUN.approval.param.banchType = 2;
            var array = [];
            $(pageInto).find('.leave-item-checkbox-item').each(function () {
                if($(this).prop('checked')){
                    array.push($(this).attr('_id'));
                }
            });
            if(array.length > 0){
                FUN.approval.param.ids = array.join(',');
                FUN.approval.banchAction('list');
            }

        });

    },
    approvalCallBack: function (pageInto, pageOut, response) {
        FUN.approval.pageInto = pageInto;
        if(FUN.currentStep === 'search'){
            FUN.currentStep = '';
        }else{
            FUN.approval.getData();
        }
    },
    approvalFallback:function(pageInto, pageOut, response){
        FUN.approval.param = {
            start:moment().startOf('week'),
            end:moment().endOf('week'),
            searchPersonId:'',
            type:1,
            banchType:1,
            ids:''
        };
    },
    approvalDetailCallBack:function(pageInto, pageOut, response){
        if(FUN.approval.param.current){
            FUN.approval.getDetail(pageInto);
        }
    },


    searchInit:function(pageInto, pageOut, response){
        console.log('search');
        $(pageInto).find("#leave-search-input").on('keypress',function(e) {
            var keycode = e.keyCode;
            var searchName = $(this).val();
            if(keycode=='13') {
                e.preventDefault();
                /**
                ---- 人员查询 ----
                    ---- condtion 查询条件支持人员姓名和编码

                URL: /business/searchPerson?condtion=张;
                {
                    data:[
                        {
                            id: -123123123,
                            name: 张三,
                            jobNumber:123
                        },
                        {
                            id: -123123123,
                            name: 李四,
                            jobNumber:123
                        }
                    ]
                }
                 **/


                $.ajax({
                    type: 'GET',
                    url: '/central/mobile/searchPerson',
                    data: {condtion:searchName},
                    dataType: 'json',
                    contentType: "application/x-www-form-urlencoded; charset=utf-8",
                    timeout: 300,
                    context: $('body'),
                    success: function (data) {
                        if(data && data.data){
                            var _data = data.data;
                            var _html = '';
                            for(var i = 0; i < _data.length; i++){
                                var _dd = _data[i];
                                _html += "<div pid='"+_dd.id+"' class='leave-search-item'> "+_dd.name+" </div>";
                            }
                            $(pageInto).find('.leave-search-body').append(_html);
                            $(pageInto).find(".leave-search-item").unbind('click').click(function(e){
                                var _pid  = $(this).attr('pid');
                                if(FUN.currentType){
                                    FUN[FUN.currentType].param.searchPersonId = _pid;
                                    FUN.currentStep = '';
                                    window.history.back();
                                }
                            });
                        }
                    },
                    error: function (xhr, type) {
                        console.log('Ajax day data error!')
                    }
                });



                // var _html = '';
                // var _data = [{
                //         id: 22,
                //         name: '张三',
                //         jobNumber:123
                //     },
                //     {
                //         id: 11,
                //         name: '李四',
                //         jobNumber:123
                //     }
                // ];
                //
                // for(var i = 0; i < _data.length; i++){
                //     var _dd = _data[i];
                //     _html += "<div pid='"+_dd.id+"' class='leave-search-item'> "+_dd.name+" </div>";
                // }
                // $(pageInto).find('.leave-search-body').append(_html);
                // $(pageInto).find(".leave-search-item").unbind('click').click(function(e){
                //     var _pid  = $(this).attr('pid');
                //     if(FUN.currentType){
                //         FUN[FUN.currentType].param.searchPersonId = _pid;
                //         FUN.currentStep = '';
                //         window.history.back();
                //     }
                // });
            }
        });

    },
    searchCallBack:function(pageInto, pageOut, response){
        console.log(FUN.currentType);
        console.log('searchCallBack');
        FUN.currentStep = 'search';
    },
    searchFallback:function(pageInto, pageOut, response){
        console.log('searchFallback');
        // if(FUN.currentType){
        //     FUN[FUN.currentType].param.searchPersonId = '';
        // }
    },


};
var setCurrentDetailId = function(elein){
    if(elein){
        var _id = $(elein).attr('_id');
        if(FUN.currentType){
            FUN[FUN.currentType].param.current = _id;
            return false;
        }
    }
    return true;
};
Mobilebone.rootTransition = FUN;