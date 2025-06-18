(function() {
  const settings = {
    noticeDays: parseInt(JFCustomWidget.getWidgetSetting('noticeDays')) || 5,
    cutoffHour: parseInt(JFCustomWidget.getWidgetSetting('cutoffHour')) || 8,
    holidayDates: (JFCustomWidget.getWidgetSetting('holidayDates') || "").split(',').map(s => new Date(s.trim())).filter(d => !isNaN(d)),
    targetFieldClass: JFCustomWidget.getWidgetSetting('targetFieldClass') || "#calendar",
    defaultDateOffset: parseInt(JFCustomWidget.getWidgetSetting('defaultDateOffset')) || 0
  };

  Date.prototype.addDays = function(days) {
    const date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
  };

  function isWeekend(date) {
    return date.getDay() === 0 || date.getDay() === 6;
  }

  function isHoliday(date) {
    return settings.holidayDates.some(h => h.toDateString() === date.toDateString());
  }

  function isTooEarly(date) {
    return date.setHours(0, 0, 0, 0) < earliestPickableDate.setHours(0, 0, 0, 0);
  }

  // Determine the earliest valid pickable date
  let earliestPickableDate = new Date();
  const nowHour = new Date().getHours();
  let daysNeeded = nowHour < settings.cutoffHour ? settings.noticeDays : settings.noticeDays + 1;
  let workingDaysAdded = 0;

  while (workingDaysAdded < daysNeeded) {
    const next = earliestPickableDate.addDays(1);
    if (!isWeekend(next) && !isHoliday(next)) {
      workingDaysAdded++;
    }
    earliestPickableDate = next;
  }

  if (settings.defaultDateOffset > 0) {
    earliestPickableDate = earliestPickableDate.addDays(settings.defaultDateOffset);
  }

  window.addEventListener('load', function () {
    const field = document.querySe
