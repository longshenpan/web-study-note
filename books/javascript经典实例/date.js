// 命名空间
ZPCS = {};
ZPCS.util = {};
ZPCS.util.Date = {
  /**
   * [getProcessedDate 获取处理后的日期]
   * @Author   ZP
   * @DateTime 2017-06-02T21:26:24+0800
   * @param    {[Date]}                 date [待处理的日期]
   * @param    {[type]}                 days [天数，可为正可为负]
   * @return   {[type]}                      [description]
   */
  getProcessedDate: function (date, days) {
    var date = new Date(date);
    date.setDate(date.getDate() + days);
    return date.getFullYear() + "/" + date.getMonth() + "/" + date.getDate();
  }
}