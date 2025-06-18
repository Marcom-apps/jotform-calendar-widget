(function () {
  function addDaysSkippingWeekendsAndHolidays(startDate, daysToAdd, holidays) {
    let result = new Date(startDate);
    let added = 0;
    while (added < daysToAdd) {
      result.setDate(result.getDate() + 1);
      if (![0, 6].includes(result.getDay()) && !isHoliday(result, holidays)) {
        added++;
      }
    }
    return result;
  }

  function isHoliday(date, holidays) {
    return holidays.some(d => d.toDateString() === date.toDateString());
  }

  function isWeekend(date) {
    return date.getDay() === 0 || date.getDay() === 6;
  }

  function isTooEarly(date, minDate) {
    return date.setHours(0, 0, 0, 0) < minDate.setHours(0, 0, 0, 0);
  }

  function parseHolidayString(holidayStr) {
    return (holidayStr || "").split(",").map(s => new Date(s.trim())).filter(d => !isNaN(d));
  }

  JFCustomWidget.subscribe("ready", function () {
    const noticeDays = parseInt(JFCustomWidget.getWidgetSetting("noticeDays")) || 5;
    const cutoffHour = parseInt(JFCustomWidget.getWidgetSetting("cutoffHour")) || 8;
    const holidayDates = parseHolidayString(JFCustomWidget.getWidgetSetting("holidayDates"));
    const targetFieldClass = JFCustomWidget.getWidgetSetting("targetFieldClass") || "#calendar";
    const defaultDateOffset = parseInt(JFCustomWidget.getWidgetSetting("defaultDateOffset")) || 0;

    // Calculate earliest pickable date
    const now = new Date();
    const afterCutoff = now.getHours() >= cutoffHour;
    const workingDaysToAdd = noticeDays + (afterCutoff ? 1 : 0);
    const earliestPickableDate = addDaysSkippingWeekendsAndHolidays(now, workingDaysToAdd, holidayDates);
    const finalPickableDate = defaultDateOffset > 0
      ? addDaysSkippingWeekendsAndHolidays(earliestPickableDate, defaultDateOffset, holidayDates)
      : earliestPickableDate;

    // Target input
    const inputField = document.querySelector(targetFieldClass);
    if (!inputField) {
      console.warn(`No field found for selector "${targetFieldClass}"`);
      return;
    }

    flatpickr(inputField, {
      altInput: true,
      altFormat: "d/m/Y",
      defaultDate: finalPickableDate,
      disable: [
        date => isWeekend(date),
        date => isHoliday(date, holidayDates),
        date => isTooEarly(date, finalPickableDate)
      ],
      locale: {
        firstDayOfWeek: 1
      }
    });

    // Return selected value to Jotform
    JFCustomWidget.subscribe("submit", function () {
      JFCustomWidget.sendSubmit({
        valid: true,
        value: inputField.value
      });
    });
  });
})();
