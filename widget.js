(function () {
  // Wait until Jotform passes widget settings
  window.JFCustomWidget && window.JFCustomWidget.subscribe("ready", function () {
    const settings = {
      noticeDays: parseInt(JFCustomWidget.getWidgetSetting("noticeDays")) || 5,
      cutoffHour: parseInt(JFCustomWidget.getWidgetSetting("cutoffHour")) || 8,
      holidayDates: (JFCustomWidget.getWidgetSetting("holidayDates") || "").split(',').map(d => new Date(d.trim())),
      targetFieldClass: JFCustomWidget.getWidgetSetting("targetFieldClass") || "#calendar",
      defaultDateOffset: parseInt(JFCustomWidget.getWidgetSetting("defaultDateOffset")) || 0
    };

    // Utility: Add working days
    Date.prototype.addDays = function (days) {
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

    // Step 1: Determine earliest allowed date
    let now = new Date();
    let earliestPickableDate = new Date(now);
    let workingDaysAdded = 0;
    let requiredDays = now.getHours() < settings.cutoffHour
      ? settings.noticeDays
      : settings.noticeDays + 1;

    while (workingDaysAdded < requiredDays) {
      earliestPickableDate = earliestPickableDate.addDays(1);
      if (!isWeekend(earliestPickableDate) && !isHoliday(earliestPickableDate)) {
        workingDaysAdded++;
      }
    }

    // Step 2: Apply default offset if needed
    if (settings.defaultDateOffset > 0) {
      let offsetAdded = 0;
      let offsetDate = new Date(earliestPickableDate);
      while (offsetAdded < settings.defaultDateOffset) {
        offsetDate = offsetDate.addDays(1);
        if (!isWeekend(offsetDate) && !isHoliday(offsetDate)) {
          offsetAdded++;
        }
      }
      earliestPickableDate = offsetDate;
    }

    // Step 3: Initialize flatpickr
    flatpickr(settings.targetFieldClass, {
      altInput: true,
      altFormat: "d/m/Y",
      defaultDate: earliestPickableDate,
      disable: [isWeekend, isHoliday, isTooEarly],
      locale: { firstDayOfWeek: 1 }
    });
  });
})();
