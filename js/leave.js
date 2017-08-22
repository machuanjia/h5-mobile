/**
 * Created by yanshi0429 on 17/5/25.
 */
function setScroll(className) {
    $('.' + className).on("scroll", function () {
        //滚动条距离顶部的高度
        var scrollTop = $(this).scrollTop();
        //当前页面的总高度
        var scrollHeight = $(this).find('.leave-list-body-content').height();
        //当前可视的页面高度
        var windowHeight = $(this).height();
        //距离顶部+当前高度 >=文档总高度 即代表滑动到底部
        var _top = $(this).find('.leave-list-loading-top');
        var _bottom = $(this).find('.leave-list-loading-bottom');

        if (scrollTop + windowHeight >= scrollHeight) {
            _bottom.show();
            _top.hide();
        } else if (scrollTop <= 0) {
            _top.show();
            _bottom.hide();
        }
    });
}

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
    currentType:'',
    day:{
        dayScroll:null,
        pageInto:null,
        param:{
            start:moment().startOf('week'),
            end:moment().endOf('week'),
            searchPersonId:''
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
            // $.ajax({
            //     type: 'GET',
            //     url: '/business/recordList',
            //     data: {start:FUN.day.param.start.format('YYYY-MM-DD'),end:FUN.day.param.end.format('YYYY-MM-DD'),searchPersonId:FUN.day.param.searchPersonId},
            //     dataType: 'json',
            //     timeout: 300,
            //     context: $('body'),
            //     success: function (data) {
            //         if(FUN.day.dayScroll){
            //             FUN.day.dayScroll.refresh();
            //         }
            //     },
            //     error: function (xhr, type) {
            //         console.log('Ajax day data error!')
            //     }
            // });


            var data = {
                personId: '-123123123',
                personName: '张三',
                deptName: '研发部',
                data: [{
                    id: -123123123,
                    date: '07-16',
                    dateName: '周一',
                    state: 2,//0：工作日；1：休息日；2：法定节假日3：单位自主放假
                    info: '年假',// 年假,调休,旷工,工作日加班
                    timeList: [
                        {
                            start: '09:00', startState: 1, end: '12:00', endState: 1
                        },
                        {
                            start: '13:00', startState: 1, end: '18:00', endState: 1
                        }
                    ]
                }]
            };

            if(data){
                FUN.day.param.searchPersonId = data.personId;
                var _p = $(FUN.day.pageInto);
                _p.find('.leave-header-name').text(data.personName);
                _p.find('.leave-header-date').text(FUN.day.param.start.format('MM-DD'));
                var html = "";
                for(var i = 0; i < data.data.length; i++){
                    var _temp = data.data[i];
                    html+='<a href="day_detail.html" class="leave-list-item flex-row">';
                        html+='<div class="leave-item-left">';
                            //state: 0,//0：工作日；1：休息日；2：法定节假日3：单位自主放假
                            // 迟到：字体红色
                            // 早退：字体红色
                            // 补签卡：字体绿色
                            // 矿工：背景黄色
                            // 休息日：蓝色
                            // 节假日：粉色
                            var _status = '';
                            if(_temp.state == 1){
                                _status='leave-item-left-bg leave-item-left-business';
                            }else if(_temp.state == 2){
                                _status='leave-item-left-bg leave-item-left-vacation';
                            }else if(_temp.state == 3){
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
                if(FUN.day.param.start > moment()){
                    _p.find('.leave-list-body-content').prepend(html);
                }else {
                //上拽在最下面插入
                    _p.find('.leave-list-body-content').append(html);
                }
            }

        }
    },
    dayInit: function (pageInto, pageOut, response) {
        FUN.currentType = 'day';
        FUN.day.dayScroll = setScroll(pageInto,'day');

    },
    dayCallBack: function (pageInto, pageOut, response) {
        FUN.day.pageInto = pageInto;
        FUN.day.getData();

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
        $(pageInto).find('.leave-detail-body').append("<div>ssssss</div>");
    },
    searchInit:function(){
        console.log('search');
    },
    searchCallBack:function(){
        console.log('searchCallBack');
    }
};
Mobilebone.rootTransition = FUN;