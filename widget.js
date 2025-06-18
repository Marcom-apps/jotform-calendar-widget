(function() {Add commentMore actions
  const settings = {
    minWorkingDays: parseInt(JFCustomWidget.getWidgetSetting('minWorkingDays')) || 5,
    disableWeekends: JFCustomWidget.getWidgetSetting('disableWeekends') === 'true',
    publicHolidays: (JFCustomWidget.getWidgetSetting('publicHolidays') || "").split(','),
    defaultToEarliest: JFCustomWidget.getWidgetSetting('defaultToEarliest') === 'true'
  };

  function isWeekend(date) {
    return date.getDay() === 0 || date.getDay() === 6;
  }

  function isHoliday(date) {
    return settings.publicHolidays.some(d => new Date(d).toDateString() === date.toDateString());
  }

  function isTooEarly(date, minDate) {
    return date.setHours(0,0,0,0) < minDate.setHours(0,0,0,0);
  }

  Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
  };

  let minDate = new Date();
  let daysAdded = 0;
  while (daysAdded < settings.minWorkingDays) {
    let next = minDate.addDays(1);
    if ((!settings.disableWeekends || !isWeekend(next)) && !isHoliday(next)) {
      daysAdded++;
    }
    minDate = next;
  }

  window.addEventListener('load', function () {
    flatpickr("#calendar", {
      altFormat: "d/m/Y",
      altInput: true,
      defaultDate: settings.defaultToEarliest ? minDate : null,
      disable: [
        settings.disableWeekends ? isWeekend : null,
        isHoliday,
        function(date) { return isTooEarly(date, minDate); }
      ].filter(Boolean),
      locale: { firstDayOfWeek: 1 }
    });
  });
})();
