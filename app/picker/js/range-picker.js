(function(){

'use strict';

function RangePickerInput($document,$mdMedia,$mdUtil,picker){
    return {
      restrict : 'EA',
      replace: true,
      scope :{
        form : '=',
        label : "@",
        fname : "@",
        value: '=',
        isRequired : '@',
        closeOnSelect: '@',
        disable : '=',
        format : '@',
        mode : '@',
        divider: '@',
        showCustom:'@',
        weekStartDay :"@",
        customToHome: "@",
        onRangeSelect : '&'  
      },
      template: ' <md-input-container>'
                +'    <label for="{{fname}}">{{label}}</label>'
                +'      <input name="{{fname}}" ng-model="value" ng-readonly="true"'
                +'             type="text" placeholde="{{label}}"'
                +'             aria-label="{{fname}}" ng-required="{{isRequired}}" class="sm-input-container"'
                +'             ng-focus="show()">'
                +'   <div id="picker" class="sm-calender-pane md-whiteframe-15dp" ng-model="value">'                
                +'    <sm-range-picker custom-to-home="{{customToHome}}" mode="{{mode}}" range-select-call="rangeSelected(range)" close-on-select="{{closeOnSelect}}" show-custom="{{showCustom}}" week-start-day="{{weekStartDay}}"  divider="{{divider}}" format="{{format}}" ></sm-range-picker>'
                +'   </div> '  
                +'  </md-input-container>',
      link :  function(scope,$element,attr){

        var inputPane = $element[0].querySelector('.sm-input-container');
        var calenderPane = $element[0].querySelector('.sm-calender-pane');
        var cElement = angular.element(calenderPane);
        
        scope.format = angular.isUndefined(scope.format) ? 'MM-DD-YYYY': scope.format;
        
        cElement.addClass('hide hide-animate');

        scope.startDate  = angular.isUndefined(scope.value)? scope.startDate : scope.value;

        $document.on('click', function (e) {
            if ((calenderPane !== e.target && inputPane !==e.target) && (!calenderPane.contains(e.target) && !inputPane.contains(e.target))) {
              hideElement();
            }
        });

        angular.element(inputPane).on('keydown', function (e) {
            if(e.which===9){
              hideElement();
            }
        });

        scope.rangeSelected = function(range){
          scope.onRangeSelect({range:range});
        }


        scope.show= function(){
          var elementRect = inputPane.getBoundingClientRect();
          var bodyRect = document.body.getBoundingClientRect();
           cElement.removeClass('hide');
          if($mdMedia('sm') ||  $mdMedia('xs')){
            calenderPane.style.left = (bodyRect.width-296)/2+'px';
            calenderPane.style.top =  (bodyRect.height-450)/2+ 'px';
          }else{
            var rect = getVisibleViewPort(elementRect,bodyRect);
            calenderPane.style.left = (rect.left) + 'px';
            calenderPane.style.top = (rect.top) + 'px';
          }

          document.body.appendChild(calenderPane);
          $mdUtil.disableScrollAround(calenderPane);
          cElement.addClass('show');

        }

        // calculate visible port to display calender
        function getVisibleViewPort(elementRect,bodyRect){
          var calenderHeight = 460;
          var calenderWidth = 296;

          var top =elementRect.top;
          if(elementRect.top +calenderHeight > bodyRect.bottom){
            top = elementRect.top - ((elementRect.top +calenderHeight) - (bodyRect.bottom -20));
          }
          var left = elementRect.left;
          if(elementRect.left +calenderWidth > bodyRect.right){
             left = elementRect.left - ((elementRect.left +calenderWidth) - (bodyRect.right -10));
          }
          return {top : top, left : left };
        }




        scope.$on('range-picker:close',function(){
          hideElement();
        });

        scope.$on('$destroy',function(){
          calenderPane.parentNode.removeChild(calenderPane);
        });

        function hideElement(){
            cElement.addClass('hide-animate');
            cElement.removeClass('show');          
            $mdUtil.enableScrolling();                                    
        }

        function destroyCalender(){
          calenderPane.parentNode.removeChild(calenderPane);
        }
    }
  }
} 




function smRangePicker (picker){
  return{
    restrict : 'E',
    require : ['^?ngModel','smRangePicker'],
    scope:{
      format:'@',
      divider: '@',
      weekStartDay :"@",
      customToHome: "@",
      closeOnSelect: "@",
      mode: "@",      
      showCustom:'@',
      rangeSelectCall : '&'      
    },
    controller: ['$scope','picker',RangePickerCtrl],
    controllerAs : 'vm',
    templateUrl : 'picker/range-picker.html',
    link : function(scope,element,att,ctrls){
      var ngModelCtrl = ctrls[0];
      var calCtrl = ctrls[1];
      calCtrl.configureNgModel(ngModelCtrl);

    }    
  }
}

var RangePickerCtrl = function($scope,picker){
  var self = this;
  self.scope = $scope;
  self.rangeSelectCall = $scope.rangeSelectCall;
  self.mode = $scope.mode;
  self.closeOnSelect = $scope.closeOnSelect;
  self.clickedButton = 0;
  
  self.format = angular.isUndefined($scope.format) ? 'MM-DD-YYYY': $scope.format;

  self.showCustom=angular.isUndefined($scope.showCustom)? false:$scope.showCustom;
  self.startShowCustomSettting =self.showCustom;

  self.customToHome =  angular.isUndefined(self.scope.customToHome) ? false:self.scope.customToHome; 

  self.startDate = moment();
  self.endDate = moment();

  self.divider = angular.isUndefined(self.scope.divider) || self.scope.divider ===''? picker.rangeDivider : $scope.divider;

  self.okLabel = picker.okLabel;
  self.cancelLabel = picker.cancelLabel;
  self.view = 'DATE';

  self.rangeDefaultList = picker.rangeDefaultList;
  self.rangeCustomStartEnd = picker.rangeCustomStartEnd;

  if(self.showCustom){
    self.selectedTabIndex=0;    
  }else{
    self.selectedTabIndex = $scope.selectedTabIndex;
  }

}

RangePickerCtrl.prototype.configureNgModel = function(ngModelCtrl) {
    this.ngModelCtrl = ngModelCtrl;
    var self = this;
    ngModelCtrl.$render = function() {
      self.ngModelCtrl.$viewValue= self.startDate+' '+ self.divider +' '+self.endDate;
    };
};

RangePickerCtrl.prototype.setNextView = function(){
  switch (this.mode){
    case  'date':
        this.view = 'DATE';             
        if(this.selectedTabIndex ===0 ){
          this.selectedTabIndex =1 
        }
      break;
    case  'date-time':
      if(this.view === 'DATE'){
        this.view = 'TIME';
      }else{
        this.view = 'DATE';
        if(this.selectedTabIndex ===0 ){
          this.selectedTabIndex =1 
        }
      }
      break;
    default:
        this.view = 'DATE';
        if(this.selectedTabIndex ===0 ){
          this.selectedTabIndex =1 
        }        
  }    
} 

RangePickerCtrl.prototype.showCustomView = function(){
  this.showCustom=true;
  this.selectedTabIndex=0

}

RangePickerCtrl.prototype.dateRangeSelected = function(){
    var self = this;
    self.selectedTabIndex =0;
    self.view= 'DATE';
    if(self.startShowCustomSettting){
      self.showCustom=true;
    }else{
      self.showCustom=false;
    }
    self.setNgModelValue(self.startDate,self.divider,self.endDate);
}

/*RangePickerCtrl.prototype.preDefineDate = function(p){
    var self = this;  
    self.clickedButton=p;
    var instance = moment();
    switch (p){
      case 1:
        self.startDate = instance.clone().startOf('day');
        self.endDate = instance.clone().endOf('day');
        break;
      case 2:
        self.startDate = instance.clone().subtract(7,'d');
        self.endDate = instance.clone();
        break;
      case 3:
        self.startDate = instance.clone().startOf('month');
        self.endDate = instance.endOf('month');
        break;
      case 4:
        self.startDate = instance.clone().subtract(1,'month').startOf('month');
        self.endDate = instance.clone().endOf('month');
        break;
      case 5:
        self.startDate = instance.clone().startOf('quarter');
        self.endDate = instance.clone().endOf('quarter');
        break;
      case 6:
        self.startDate = instance.clone().startOf('year');
        self.endDate = instance.clone().endOf('year');
        break;
      case 7:
        self.showCustom=true;
        self.selectedTabIndex=0
        break;
      case 8:
        self.startDate = instance.clone().startOf('year');
        self.endDate = instance.clone();
        break;
      default:
        break;
    }
    if(p!=7){

      self.setNgModelValue(self.startDate,self.divider,self.endDate);
    }

}*/ 

RangePickerCtrl.prototype.startDateSelected = function(date){
  this.startDate = date;
  this.scope.$emit('range-picker:startDateSelected');
  this.setNextView();
}

RangePickerCtrl.prototype.startTimeSelected = function(time){

  this.startDate.hour(time.hour()).minute(time.minute());
  this.scope.$emit('range-picker:startTimeSelected');
  this.setNextView();
}


RangePickerCtrl.prototype.endDateSelected = function(date){
  this.endDate = date;
  this.scope.$emit('range-picker:endDateSelected');
  if(this.closeOnSelect && this.mode==='date'){
    this.setNgModelValue(this.startDate,this.divider,this.endDate);
  }else{
    this.setNextView();
  }
}

RangePickerCtrl.prototype.endTimeSelected = function(time){
  this.endDate.hour(time.hour()).minute(time.minute());
  this.scope.$emit('range-picker:endTimeSelected');  
  if(this.closeOnSelect && this.mode==='date-time'){
    this.setNgModelValue(this.startDate,this.divider,this.endDate);    
  }
}


RangePickerCtrl.prototype.setNgModelValue = function(startDate,divider,endDate) {
    var self = this;
    var range = {startDate: startDate.format(self.scope.format) , endDate: endDate.format(self.scope.format)};
    self.rangeSelectCall({range: range});
    self.ngModelCtrl.$setViewValue(startDate.format(self.scope.format)+' '+ divider +' '+endDate.format(self.scope.format));
    self.ngModelCtrl.$render();    
    self.selectedTabIndex =0 
    self.view ="DATE";
    self.scope.$emit('range-picker:close');    
};

RangePickerCtrl.prototype.cancel = function(){
  var self = this;
  if(self.customToHome && self.showCustom){
    self.showCustom=false; 
  }else{
    self.selectedTabIndex =0;
    self.showCustom=false; 
    self.scope.$emit('range-picker:close');        
  }
}

var app = angular.module('smDateTimeRangePicker');

app.directive('smRangePicker',['picker',smRangePicker]);
app.directive('smRangePickerInput',['$document','$mdMedia','$mdUtil','picker',RangePickerInput]);

})();