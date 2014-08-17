lavaca-observe-perf
===================

This is a quick benchmark investigating alternatives to lavaca/mvc/Model's
`Model#get` and `Model#set` methods for change notification. Basically we'd
like to change this:

`model.set('aProperty', 1024);`

to this:

`model.aProperty = 1024;`

and still receive change events. `Object.observe` is an [ES7
proposal](http://wiki.ecmascript.org/doku.php?id=harmony:observe) designed to
address this. ES5's `Object.defineProperty` can also be used to achieve this.


Install
-------

`bower install`


Run
---

`python -m SimpleHTTPServer`

Then open "http://localhost:8000" in your browser and observe the console
output (F12/cmd+shift+i).


The Tests
---------

### Plain Object (no observing)

A baseline. Simply updates properties of a plain JavaScript Object with no
change monitoring.

### Object properties

Uses [ES5
properties](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty)
to monitor changes. This shifts the burden of change monitoring to property-set
time (as opposed to Object.observe which waits until the end of the current
event loop turn to look for changes). Will be slower with a large number of
properties; this test only uses two properties so it's biased.

### ObjectObserver

[Polymer's library](https://github.com/Polymer/observe-js) on top of
`Object.observe`. Provides a dirty-checking fallback for browsers without
`Object.observe`. Only reports the last add, last change, and last removal
within one turn of the event loop.

### ObjectObserver (excessive dirty checking)

Same as above, but runs a dirty-check every time a property is changed. This is
to demonstrate the difference between browsers with `Object.observe` (currently
Chrome) which run only once per event loop turn and those using Polymer's
fallback (can run as many times as `Platform.performMicrotaskCheckpoint()` is
called). That is, the fallback is only slow if you run it in a tight loop (such
as Benchmark.js here).

### lavaca/mvc/Model

A plain lavaca/mvc/Model using the 'change' event to record changes.


Some Results
------------

```
Output Format:
<Test name> <test runs per second> <avg. microseconds elapsed per run>
...
<number of changes reported by each of the change-watching (last four) tests>
<same as above, after one turn of the event loop>


====================


Chrome 36.0.1985.143
--------------------

Plain Object (no observing) 47,254,387hz 0µs app.js:121
Object properties 3,022,961hz 0µs app.js:121
ObjectObserver 422,983hz 2µs app.js:121
ObjectObserver (excessive dirty checking) 406,909hz 2µs app.js:121
lavaca/mvc/Model 74,737hz 13µs app.js:121
Changes reported 4407585 0 0 94204 app.js:123
Changes reported (async) 4407585 1 1 94204 


Firefox 30.0
------------

"Plain Object (no observing)" "6,488,467hz" "0µs" app.js:121
"Object properties" "516,087hz" "2µs" app.js:121
"ObjectObserver" "6,439,703hz" "0µs" app.js:121
"ObjectObserver (excessive dirty checking)" "38,169hz" "26µs" app.js:121
"lavaca/mvc/Model" "24,034hz" "42µs" app.js:121
"Changes reported" 664264 1 48835 33079 app.js:123
"Changes reported (async)" 664264 1 48835 33079


Safari 7.0.3 (9537.75.14)
-------------------------

[Log] Plain Object (no observing) 20,951,849hz 0µs (app.js, line 121)
[Log] Object properties 2,231,178hz 0µs (app.js, line 121)
[Log] ObjectObserver 21,183,991hz 0µs (app.js, line 121)
[Log] ObjectObserver (excessive dirty checking) 215,512hz 5µs (app.js, line 121)
[Log] lavaca/mvc/Model 88,299hz 11µs (app.js, line 121)
[Log] Changes reported 3672392 1 383435 187179 (app.js, line 123)
[Log] Changes reported (async) 3672392 1 383435 187179 (app.js, line 125)


Chrome 36.0.1985.135 (Android/Nexus 5)
--------------------------------------

Plain Object (no observing) 12,628,376hz 0µs
Object properties 1,530,985hz 1µs
ObjectObserver 55,873hz 18µs
ObjectObserver (excessive dirty checking) 63,084hz 16µs
lavaca/mvc/Model 11,547hz 87µs
Changes reported 2932353 0 0 16667
Changes reported (async) 2932353 1 1 16667
```

In the worst case (dirty-checking every time a change is made), Polymer's
ObjectObserver performs at least within the same order of magnitude as Lavaca's
current mvc/Model. The realistic case (dirty checking once per turn of the
event loop) ranges between 1 to 3 orders of magnitude faster than mvc/Model.
