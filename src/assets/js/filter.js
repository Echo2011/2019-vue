/*
 * vuejs 	过滤器
 */

import Vue from 'vue';

/**
  * 格式化运行时间(字符串格式)， 将其转换成 天 时 分 秒
  * @param value 		传进来的数字
  * @param return 
*/

Vue.filter('statustime', function(value){
  // console.log(value)
  value = Number(value);
  var time = parseInt(value); 
  // console.log(time);
  if(localStorage.getItem('locale') == 'zh-CN'){
    time = time + '秒';
  }else if(localStorage.getItem('locale') == 'en-US'){
    time = time + 's';
  }

  if( parseInt(value )> 60){  
    
      var second = parseInt(value) % 60;  
      var min = parseInt(value / 60);  
      if(localStorage.getItem('locale') == 'zh-CN'){
        time = min + "分" + second + "秒";  
      }else if(localStorage.getItem('locale') == 'en-US'){
        time = min + "m " + second + "s";  
      }     
        
      if( min > 60 ){  
          min = parseInt(value / 60) % 60;  
          var hour = parseInt( parseInt(value / 60) /60 ); 
          if(localStorage.getItem('locale') == 'zh-CN'){
            time = hour + "小时" + min + "分" + second + "秒";   
          }else if(localStorage.getItem('locale') == 'en-US'){
            time = hour + "h " + min + "m " + second + "s"; 
          }            
          if( hour > 24 ){  
            hour = parseInt( parseInt(value / 60) /60 ) % 24;  
            var day = parseInt( parseInt( parseInt(value / 60) /60 ) / 24 );  
            if(localStorage.getItem('locale') == 'zh-CN'){
              time = day + "天" + hour + "小时" + min + "分" + second + "秒";                 
            }else if(localStorage.getItem('locale') == 'en-US'){
              time = day + "day " + hour + "h " + min + "m " + second + "s";                 
            }               
          }  
      }   
  } 
  return time;   
});

/**
 * 将时间戳（Number类型）转换成日期（比如分区的创建时间）
 * 
 */
/**
 * @value 传过来的值
 * @demand, demand === 'date' 传此参数，说明，只需要　日期　部分，　不需要后部分的时间
 * demand === 'time', 传此参数，　说明只需要　时间　部分，　不需要前部分的日期
 */
Vue.filter('toDate', function(value,demand){
  if(value){
    var date = new Date(value)
    if(localStorage.getItem('locale') == 'zh-CN'){
      if(demand === 'date'){
        return date.toLocaleString('zh-CN').split(' ')[0];
      }else if(demand === 'time'){
        return date.toLocaleString('zh-CN').split(' ')[1];
      }else{
        return date.toLocaleString('zh-CN');
      }      
    }else if(localStorage.getItem('locale') == 'en-US'){
      if(demand === 'date'){
        return date.toLocaleString('en-US').split(', ')[0];
      }else if(demand === 'time'){
        return date.toLocaleString('en-US').split(', ')[1];
      }else{
        return date.toLocaleString('en-US');
      }      
    }
  }else{
    return '';
  }
  
})


/*
  过滤获取到的 item.disksize 的值
  item.disksize 的值是字符串，形式：“ada:3456GB,sda:58265GB”
  将其转换成 
*/
Vue.filter('getString0', function(value){
  if(value){
    return value.split(',')[0];
  }else{
    return ''
  }  
});

Vue.filter('getString1', function(value){
  if(value){
    return value.split(',')[1];
  }else{
    return ''
  }  
});

/**
 * 处理 内存数据 ： 获取到内存数值 和 单位
 */
// 获取数值
Vue.filter('memoryNumber', function(value){
  if(value){
    return value.trim().slice(0,-2)
  }else{
    return ''
  }  
});

// 获取单位
Vue.filter('memoryUnit', function(value){
  if(value && value!= '0'){
    return value.trim().substr(-2)
  }else{
    return ''
  }  
});

Vue.filter('getPercentage', function(value){
  if(value['memory used'] === '0' || value['memory used']===0 || value['memory']==0){
    return 0;
  };
  if(value.memory && value['memory used']){
    if(value.memory.slice(-2).toUpperCase() == value['memory used'].slice(-2).toUpperCase()){
      return Math.round((parseInt(value['memory used'])/parseInt(value.memory))*100);

    }else if((value.memory.slice(-2).toUpperCase() == 'GB') && (value['memory used'].slice(-2).toUpperCase() == 'MB')){
      return Math.round((parseInt(value['memory used'])/(parseInt(value.memory)*1024))*100);
    }
  }else{
    return '';
  }
})