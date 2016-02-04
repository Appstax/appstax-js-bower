!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.appstax=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
var hasOwn = Object.prototype.hasOwnProperty;
var toString = Object.prototype.toString;
var undefined;

var isPlainObject = function isPlainObject(obj) {
    "use strict";
    if (!obj || toString.call(obj) !== '[object Object]' || obj.nodeType || obj.setInterval) {
        return false;
    }

    var has_own_constructor = hasOwn.call(obj, 'constructor');
    var has_is_property_of_method = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, 'isPrototypeOf');
    // Not own constructor property must be Object
    if (obj.constructor && !has_own_constructor && !has_is_property_of_method) {
        return false;
    }

    // Own properties are enumerated firstly, so to speed up,
    // if last one is own, then all properties are own.
    var key;
    for (key in obj) {}

    return key === undefined || hasOwn.call(obj, key);
};

module.exports = function extend() {
    "use strict";
    var options, name, src, copy, copyIsArray, clone,
        target = arguments[0],
        i = 1,
        length = arguments.length,
        deep = false;

    // Handle a deep copy situation
    if (typeof target === "boolean") {
        deep = target;
        target = arguments[1] || {};
        // skip the boolean and the target
        i = 2;
    } else if (typeof target !== "object" && typeof target !== "function" || target == undefined) {
            target = {};
    }

    for (; i < length; ++i) {
        // Only deal with non-null/undefined values
        if ((options = arguments[i]) != null) {
            // Extend the base object
            for (name in options) {
                src = target[name];
                copy = options[name];

                // Prevent never-ending loop
                if (target === copy) {
                    continue;
                }

                // Recurse if we're merging plain objects or arrays
                if (deep && copy && (isPlainObject(copy) || (copyIsArray = Array.isArray(copy)))) {
                    if (copyIsArray) {
                        copyIsArray = false;
                        clone = src && Array.isArray(src) ? src : [];
                    } else {
                        clone = src && isPlainObject(src) ? src : {};
                    }

                    // Never move original objects, clone them
                    target[name] = extend(deep, clone, copy);

                // Don't bring in undefined values
                } else if (copy !== undefined) {
                    target[name] = copy;
                }
            }
        }
    }

    // Return the modified object
    return target;
};


},{}],2:[function(_dereq_,module,exports){

},{}],3:[function(_dereq_,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],4:[function(_dereq_,module,exports){
(function (process){
// vim:ts=4:sts=4:sw=4:
/*!
 *
 * Copyright 2009-2012 Kris Kowal under the terms of the MIT
 * license found at http://github.com/kriskowal/q/raw/master/LICENSE
 *
 * With parts by Tyler Close
 * Copyright 2007-2009 Tyler Close under the terms of the MIT X license found
 * at http://www.opensource.org/licenses/mit-license.html
 * Forked at ref_send.js version: 2009-05-11
 *
 * With parts by Mark Miller
 * Copyright (C) 2011 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

(function (definition) {
    "use strict";

    // This file will function properly as a <script> tag, or a module
    // using CommonJS and NodeJS or RequireJS module formats.  In
    // Common/Node/RequireJS, the module exports the Q API and when
    // executed as a simple <script>, it creates a Q global instead.

    // Montage Require
    if (typeof bootstrap === "function") {
        bootstrap("promise", definition);

    // CommonJS
    } else if (typeof exports === "object" && typeof module === "object") {
        module.exports = definition();

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
        define(definition);

    // SES (Secure EcmaScript)
    } else if (typeof ses !== "undefined") {
        if (!ses.ok()) {
            return;
        } else {
            ses.makeQ = definition;
        }

    // <script>
    } else if (typeof window !== "undefined" || typeof self !== "undefined") {
        // Prefer window over self for add-on scripts. Use self for
        // non-windowed contexts.
        var global = typeof window !== "undefined" ? window : self;

        // Get the `window` object, save the previous Q global
        // and initialize Q as a global.
        var previousQ = global.Q;
        global.Q = definition();

        // Add a noConflict function so Q can be removed from the
        // global namespace.
        global.Q.noConflict = function () {
            global.Q = previousQ;
            return this;
        };

    } else {
        throw new Error("This environment was not anticipated by Q. Please file a bug.");
    }

})(function () {
"use strict";

var hasStacks = false;
try {
    throw new Error();
} catch (e) {
    hasStacks = !!e.stack;
}

// All code after this point will be filtered from stack traces reported
// by Q.
var qStartingLine = captureLine();
var qFileName;

// shims

// used for fallback in "allResolved"
var noop = function () {};

// Use the fastest possible means to execute a task in a future turn
// of the event loop.
var nextTick =(function () {
    // linked list of tasks (single, with head node)
    var head = {task: void 0, next: null};
    var tail = head;
    var flushing = false;
    var requestTick = void 0;
    var isNodeJS = false;
    // queue for late tasks, used by unhandled rejection tracking
    var laterQueue = [];

    function flush() {
        /* jshint loopfunc: true */
        var task, domain;

        while (head.next) {
            head = head.next;
            task = head.task;
            head.task = void 0;
            domain = head.domain;

            if (domain) {
                head.domain = void 0;
                domain.enter();
            }
            runSingle(task, domain);

        }
        while (laterQueue.length) {
            task = laterQueue.pop();
            runSingle(task);
        }
        flushing = false;
    }
    // runs a single function in the async queue
    function runSingle(task, domain) {
        try {
            task();

        } catch (e) {
            if (isNodeJS) {
                // In node, uncaught exceptions are considered fatal errors.
                // Re-throw them synchronously to interrupt flushing!

                // Ensure continuation if the uncaught exception is suppressed
                // listening "uncaughtException" events (as domains does).
                // Continue in next event to avoid tick recursion.
                if (domain) {
                    domain.exit();
                }
                setTimeout(flush, 0);
                if (domain) {
                    domain.enter();
                }

                throw e;

            } else {
                // In browsers, uncaught exceptions are not fatal.
                // Re-throw them asynchronously to avoid slow-downs.
                setTimeout(function () {
                    throw e;
                }, 0);
            }
        }

        if (domain) {
            domain.exit();
        }
    }

    nextTick = function (task) {
        tail = tail.next = {
            task: task,
            domain: isNodeJS && process.domain,
            next: null
        };

        if (!flushing) {
            flushing = true;
            requestTick();
        }
    };

    if (typeof process === "object" &&
        process.toString() === "[object process]" && process.nextTick) {
        // Ensure Q is in a real Node environment, with a `process.nextTick`.
        // To see through fake Node environments:
        // * Mocha test runner - exposes a `process` global without a `nextTick`
        // * Browserify - exposes a `process.nexTick` function that uses
        //   `setTimeout`. In this case `setImmediate` is preferred because
        //    it is faster. Browserify's `process.toString()` yields
        //   "[object Object]", while in a real Node environment
        //   `process.nextTick()` yields "[object process]".
        isNodeJS = true;

        requestTick = function () {
            process.nextTick(flush);
        };

    } else if (typeof setImmediate === "function") {
        // In IE10, Node.js 0.9+, or https://github.com/NobleJS/setImmediate
        if (typeof window !== "undefined") {
            requestTick = setImmediate.bind(window, flush);
        } else {
            requestTick = function () {
                setImmediate(flush);
            };
        }

    } else if (typeof MessageChannel !== "undefined") {
        // modern browsers
        // http://www.nonblocking.io/2011/06/windownexttick.html
        var channel = new MessageChannel();
        // At least Safari Version 6.0.5 (8536.30.1) intermittently cannot create
        // working message ports the first time a page loads.
        channel.port1.onmessage = function () {
            requestTick = requestPortTick;
            channel.port1.onmessage = flush;
            flush();
        };
        var requestPortTick = function () {
            // Opera requires us to provide a message payload, regardless of
            // whether we use it.
            channel.port2.postMessage(0);
        };
        requestTick = function () {
            setTimeout(flush, 0);
            requestPortTick();
        };

    } else {
        // old browsers
        requestTick = function () {
            setTimeout(flush, 0);
        };
    }
    // runs a task after all other tasks have been run
    // this is useful for unhandled rejection tracking that needs to happen
    // after all `then`d tasks have been run.
    nextTick.runAfter = function (task) {
        laterQueue.push(task);
        if (!flushing) {
            flushing = true;
            requestTick();
        }
    };
    return nextTick;
})();

// Attempt to make generics safe in the face of downstream
// modifications.
// There is no situation where this is necessary.
// If you need a security guarantee, these primordials need to be
// deeply frozen anyway, and if you don’t need a security guarantee,
// this is just plain paranoid.
// However, this **might** have the nice side-effect of reducing the size of
// the minified code by reducing x.call() to merely x()
// See Mark Miller’s explanation of what this does.
// http://wiki.ecmascript.org/doku.php?id=conventions:safe_meta_programming
var call = Function.call;
function uncurryThis(f) {
    return function () {
        return call.apply(f, arguments);
    };
}
// This is equivalent, but slower:
// uncurryThis = Function_bind.bind(Function_bind.call);
// http://jsperf.com/uncurrythis

var array_slice = uncurryThis(Array.prototype.slice);

var array_reduce = uncurryThis(
    Array.prototype.reduce || function (callback, basis) {
        var index = 0,
            length = this.length;
        // concerning the initial value, if one is not provided
        if (arguments.length === 1) {
            // seek to the first value in the array, accounting
            // for the possibility that is is a sparse array
            do {
                if (index in this) {
                    basis = this[index++];
                    break;
                }
                if (++index >= length) {
                    throw new TypeError();
                }
            } while (1);
        }
        // reduce
        for (; index < length; index++) {
            // account for the possibility that the array is sparse
            if (index in this) {
                basis = callback(basis, this[index], index);
            }
        }
        return basis;
    }
);

var array_indexOf = uncurryThis(
    Array.prototype.indexOf || function (value) {
        // not a very good shim, but good enough for our one use of it
        for (var i = 0; i < this.length; i++) {
            if (this[i] === value) {
                return i;
            }
        }
        return -1;
    }
);

var array_map = uncurryThis(
    Array.prototype.map || function (callback, thisp) {
        var self = this;
        var collect = [];
        array_reduce(self, function (undefined, value, index) {
            collect.push(callback.call(thisp, value, index, self));
        }, void 0);
        return collect;
    }
);

var object_create = Object.create || function (prototype) {
    function Type() { }
    Type.prototype = prototype;
    return new Type();
};

var object_hasOwnProperty = uncurryThis(Object.prototype.hasOwnProperty);

var object_keys = Object.keys || function (object) {
    var keys = [];
    for (var key in object) {
        if (object_hasOwnProperty(object, key)) {
            keys.push(key);
        }
    }
    return keys;
};

var object_toString = uncurryThis(Object.prototype.toString);

function isObject(value) {
    return value === Object(value);
}

// generator related shims

// FIXME: Remove this function once ES6 generators are in SpiderMonkey.
function isStopIteration(exception) {
    return (
        object_toString(exception) === "[object StopIteration]" ||
        exception instanceof QReturnValue
    );
}

// FIXME: Remove this helper and Q.return once ES6 generators are in
// SpiderMonkey.
var QReturnValue;
if (typeof ReturnValue !== "undefined") {
    QReturnValue = ReturnValue;
} else {
    QReturnValue = function (value) {
        this.value = value;
    };
}

// long stack traces

var STACK_JUMP_SEPARATOR = "From previous event:";

function makeStackTraceLong(error, promise) {
    // If possible, transform the error stack trace by removing Node and Q
    // cruft, then concatenating with the stack trace of `promise`. See #57.
    if (hasStacks &&
        promise.stack &&
        typeof error === "object" &&
        error !== null &&
        error.stack &&
        error.stack.indexOf(STACK_JUMP_SEPARATOR) === -1
    ) {
        var stacks = [];
        for (var p = promise; !!p; p = p.source) {
            if (p.stack) {
                stacks.unshift(p.stack);
            }
        }
        stacks.unshift(error.stack);

        var concatedStacks = stacks.join("\n" + STACK_JUMP_SEPARATOR + "\n");
        error.stack = filterStackString(concatedStacks);
    }
}

function filterStackString(stackString) {
    var lines = stackString.split("\n");
    var desiredLines = [];
    for (var i = 0; i < lines.length; ++i) {
        var line = lines[i];

        if (!isInternalFrame(line) && !isNodeFrame(line) && line) {
            desiredLines.push(line);
        }
    }
    return desiredLines.join("\n");
}

function isNodeFrame(stackLine) {
    return stackLine.indexOf("(module.js:") !== -1 ||
           stackLine.indexOf("(node.js:") !== -1;
}

function getFileNameAndLineNumber(stackLine) {
    // Named functions: "at functionName (filename:lineNumber:columnNumber)"
    // In IE10 function name can have spaces ("Anonymous function") O_o
    var attempt1 = /at .+ \((.+):(\d+):(?:\d+)\)$/.exec(stackLine);
    if (attempt1) {
        return [attempt1[1], Number(attempt1[2])];
    }

    // Anonymous functions: "at filename:lineNumber:columnNumber"
    var attempt2 = /at ([^ ]+):(\d+):(?:\d+)$/.exec(stackLine);
    if (attempt2) {
        return [attempt2[1], Number(attempt2[2])];
    }

    // Firefox style: "function@filename:lineNumber or @filename:lineNumber"
    var attempt3 = /.*@(.+):(\d+)$/.exec(stackLine);
    if (attempt3) {
        return [attempt3[1], Number(attempt3[2])];
    }
}

function isInternalFrame(stackLine) {
    var fileNameAndLineNumber = getFileNameAndLineNumber(stackLine);

    if (!fileNameAndLineNumber) {
        return false;
    }

    var fileName = fileNameAndLineNumber[0];
    var lineNumber = fileNameAndLineNumber[1];

    return fileName === qFileName &&
        lineNumber >= qStartingLine &&
        lineNumber <= qEndingLine;
}

// discover own file name and line number range for filtering stack
// traces
function captureLine() {
    if (!hasStacks) {
        return;
    }

    try {
        throw new Error();
    } catch (e) {
        var lines = e.stack.split("\n");
        var firstLine = lines[0].indexOf("@") > 0 ? lines[1] : lines[2];
        var fileNameAndLineNumber = getFileNameAndLineNumber(firstLine);
        if (!fileNameAndLineNumber) {
            return;
        }

        qFileName = fileNameAndLineNumber[0];
        return fileNameAndLineNumber[1];
    }
}

function deprecate(callback, name, alternative) {
    return function () {
        if (typeof console !== "undefined" &&
            typeof console.warn === "function") {
            console.warn(name + " is deprecated, use " + alternative +
                         " instead.", new Error("").stack);
        }
        return callback.apply(callback, arguments);
    };
}

// end of shims
// beginning of real work

/**
 * Constructs a promise for an immediate reference, passes promises through, or
 * coerces promises from different systems.
 * @param value immediate reference or promise
 */
function Q(value) {
    // If the object is already a Promise, return it directly.  This enables
    // the resolve function to both be used to created references from objects,
    // but to tolerably coerce non-promises to promises.
    if (value instanceof Promise) {
        return value;
    }

    // assimilate thenables
    if (isPromiseAlike(value)) {
        return coerce(value);
    } else {
        return fulfill(value);
    }
}
Q.resolve = Q;

/**
 * Performs a task in a future turn of the event loop.
 * @param {Function} task
 */
Q.nextTick = nextTick;

/**
 * Controls whether or not long stack traces will be on
 */
Q.longStackSupport = false;

// enable long stacks if Q_DEBUG is set
if (typeof process === "object" && process && process.env && process.env.Q_DEBUG) {
    Q.longStackSupport = true;
}

/**
 * Constructs a {promise, resolve, reject} object.
 *
 * `resolve` is a callback to invoke with a more resolved value for the
 * promise. To fulfill the promise, invoke `resolve` with any value that is
 * not a thenable. To reject the promise, invoke `resolve` with a rejected
 * thenable, or invoke `reject` with the reason directly. To resolve the
 * promise to another thenable, thus putting it in the same state, invoke
 * `resolve` with that other thenable.
 */
Q.defer = defer;
function defer() {
    // if "messages" is an "Array", that indicates that the promise has not yet
    // been resolved.  If it is "undefined", it has been resolved.  Each
    // element of the messages array is itself an array of complete arguments to
    // forward to the resolved promise.  We coerce the resolution value to a
    // promise using the `resolve` function because it handles both fully
    // non-thenable values and other thenables gracefully.
    var messages = [], progressListeners = [], resolvedPromise;

    var deferred = object_create(defer.prototype);
    var promise = object_create(Promise.prototype);

    promise.promiseDispatch = function (resolve, op, operands) {
        var args = array_slice(arguments);
        if (messages) {
            messages.push(args);
            if (op === "when" && operands[1]) { // progress operand
                progressListeners.push(operands[1]);
            }
        } else {
            Q.nextTick(function () {
                resolvedPromise.promiseDispatch.apply(resolvedPromise, args);
            });
        }
    };

    // XXX deprecated
    promise.valueOf = function () {
        if (messages) {
            return promise;
        }
        var nearerValue = nearer(resolvedPromise);
        if (isPromise(nearerValue)) {
            resolvedPromise = nearerValue; // shorten chain
        }
        return nearerValue;
    };

    promise.inspect = function () {
        if (!resolvedPromise) {
            return { state: "pending" };
        }
        return resolvedPromise.inspect();
    };

    if (Q.longStackSupport && hasStacks) {
        try {
            throw new Error();
        } catch (e) {
            // NOTE: don't try to use `Error.captureStackTrace` or transfer the
            // accessor around; that causes memory leaks as per GH-111. Just
            // reify the stack trace as a string ASAP.
            //
            // At the same time, cut off the first line; it's always just
            // "[object Promise]\n", as per the `toString`.
            promise.stack = e.stack.substring(e.stack.indexOf("\n") + 1);
        }
    }

    // NOTE: we do the checks for `resolvedPromise` in each method, instead of
    // consolidating them into `become`, since otherwise we'd create new
    // promises with the lines `become(whatever(value))`. See e.g. GH-252.

    function become(newPromise) {
        resolvedPromise = newPromise;
        promise.source = newPromise;

        array_reduce(messages, function (undefined, message) {
            Q.nextTick(function () {
                newPromise.promiseDispatch.apply(newPromise, message);
            });
        }, void 0);

        messages = void 0;
        progressListeners = void 0;
    }

    deferred.promise = promise;
    deferred.resolve = function (value) {
        if (resolvedPromise) {
            return;
        }

        become(Q(value));
    };

    deferred.fulfill = function (value) {
        if (resolvedPromise) {
            return;
        }

        become(fulfill(value));
    };
    deferred.reject = function (reason) {
        if (resolvedPromise) {
            return;
        }

        become(reject(reason));
    };
    deferred.notify = function (progress) {
        if (resolvedPromise) {
            return;
        }

        array_reduce(progressListeners, function (undefined, progressListener) {
            Q.nextTick(function () {
                progressListener(progress);
            });
        }, void 0);
    };

    return deferred;
}

/**
 * Creates a Node-style callback that will resolve or reject the deferred
 * promise.
 * @returns a nodeback
 */
defer.prototype.makeNodeResolver = function () {
    var self = this;
    return function (error, value) {
        if (error) {
            self.reject(error);
        } else if (arguments.length > 2) {
            self.resolve(array_slice(arguments, 1));
        } else {
            self.resolve(value);
        }
    };
};

/**
 * @param resolver {Function} a function that returns nothing and accepts
 * the resolve, reject, and notify functions for a deferred.
 * @returns a promise that may be resolved with the given resolve and reject
 * functions, or rejected by a thrown exception in resolver
 */
Q.Promise = promise; // ES6
Q.promise = promise;
function promise(resolver) {
    if (typeof resolver !== "function") {
        throw new TypeError("resolver must be a function.");
    }
    var deferred = defer();
    try {
        resolver(deferred.resolve, deferred.reject, deferred.notify);
    } catch (reason) {
        deferred.reject(reason);
    }
    return deferred.promise;
}

promise.race = race; // ES6
promise.all = all; // ES6
promise.reject = reject; // ES6
promise.resolve = Q; // ES6

// XXX experimental.  This method is a way to denote that a local value is
// serializable and should be immediately dispatched to a remote upon request,
// instead of passing a reference.
Q.passByCopy = function (object) {
    //freeze(object);
    //passByCopies.set(object, true);
    return object;
};

Promise.prototype.passByCopy = function () {
    //freeze(object);
    //passByCopies.set(object, true);
    return this;
};

/**
 * If two promises eventually fulfill to the same value, promises that value,
 * but otherwise rejects.
 * @param x {Any*}
 * @param y {Any*}
 * @returns {Any*} a promise for x and y if they are the same, but a rejection
 * otherwise.
 *
 */
Q.join = function (x, y) {
    return Q(x).join(y);
};

Promise.prototype.join = function (that) {
    return Q([this, that]).spread(function (x, y) {
        if (x === y) {
            // TODO: "===" should be Object.is or equiv
            return x;
        } else {
            throw new Error("Can't join: not the same: " + x + " " + y);
        }
    });
};

/**
 * Returns a promise for the first of an array of promises to become settled.
 * @param answers {Array[Any*]} promises to race
 * @returns {Any*} the first promise to be settled
 */
Q.race = race;
function race(answerPs) {
    return promise(function (resolve, reject) {
        // Switch to this once we can assume at least ES5
        // answerPs.forEach(function (answerP) {
        //     Q(answerP).then(resolve, reject);
        // });
        // Use this in the meantime
        for (var i = 0, len = answerPs.length; i < len; i++) {
            Q(answerPs[i]).then(resolve, reject);
        }
    });
}

Promise.prototype.race = function () {
    return this.then(Q.race);
};

/**
 * Constructs a Promise with a promise descriptor object and optional fallback
 * function.  The descriptor contains methods like when(rejected), get(name),
 * set(name, value), post(name, args), and delete(name), which all
 * return either a value, a promise for a value, or a rejection.  The fallback
 * accepts the operation name, a resolver, and any further arguments that would
 * have been forwarded to the appropriate method above had a method been
 * provided with the proper name.  The API makes no guarantees about the nature
 * of the returned object, apart from that it is usable whereever promises are
 * bought and sold.
 */
Q.makePromise = Promise;
function Promise(descriptor, fallback, inspect) {
    if (fallback === void 0) {
        fallback = function (op) {
            return reject(new Error(
                "Promise does not support operation: " + op
            ));
        };
    }
    if (inspect === void 0) {
        inspect = function () {
            return {state: "unknown"};
        };
    }

    var promise = object_create(Promise.prototype);

    promise.promiseDispatch = function (resolve, op, args) {
        var result;
        try {
            if (descriptor[op]) {
                result = descriptor[op].apply(promise, args);
            } else {
                result = fallback.call(promise, op, args);
            }
        } catch (exception) {
            result = reject(exception);
        }
        if (resolve) {
            resolve(result);
        }
    };

    promise.inspect = inspect;

    // XXX deprecated `valueOf` and `exception` support
    if (inspect) {
        var inspected = inspect();
        if (inspected.state === "rejected") {
            promise.exception = inspected.reason;
        }

        promise.valueOf = function () {
            var inspected = inspect();
            if (inspected.state === "pending" ||
                inspected.state === "rejected") {
                return promise;
            }
            return inspected.value;
        };
    }

    return promise;
}

Promise.prototype.toString = function () {
    return "[object Promise]";
};

Promise.prototype.then = function (fulfilled, rejected, progressed) {
    var self = this;
    var deferred = defer();
    var done = false;   // ensure the untrusted promise makes at most a
                        // single call to one of the callbacks

    function _fulfilled(value) {
        try {
            return typeof fulfilled === "function" ? fulfilled(value) : value;
        } catch (exception) {
            return reject(exception);
        }
    }

    function _rejected(exception) {
        if (typeof rejected === "function") {
            makeStackTraceLong(exception, self);
            try {
                return rejected(exception);
            } catch (newException) {
                return reject(newException);
            }
        }
        return reject(exception);
    }

    function _progressed(value) {
        return typeof progressed === "function" ? progressed(value) : value;
    }

    Q.nextTick(function () {
        self.promiseDispatch(function (value) {
            if (done) {
                return;
            }
            done = true;

            deferred.resolve(_fulfilled(value));
        }, "when", [function (exception) {
            if (done) {
                return;
            }
            done = true;

            deferred.resolve(_rejected(exception));
        }]);
    });

    // Progress propagator need to be attached in the current tick.
    self.promiseDispatch(void 0, "when", [void 0, function (value) {
        var newValue;
        var threw = false;
        try {
            newValue = _progressed(value);
        } catch (e) {
            threw = true;
            if (Q.onerror) {
                Q.onerror(e);
            } else {
                throw e;
            }
        }

        if (!threw) {
            deferred.notify(newValue);
        }
    }]);

    return deferred.promise;
};

Q.tap = function (promise, callback) {
    return Q(promise).tap(callback);
};

/**
 * Works almost like "finally", but not called for rejections.
 * Original resolution value is passed through callback unaffected.
 * Callback may return a promise that will be awaited for.
 * @param {Function} callback
 * @returns {Q.Promise}
 * @example
 * doSomething()
 *   .then(...)
 *   .tap(console.log)
 *   .then(...);
 */
Promise.prototype.tap = function (callback) {
    callback = Q(callback);

    return this.then(function (value) {
        return callback.fcall(value).thenResolve(value);
    });
};

/**
 * Registers an observer on a promise.
 *
 * Guarantees:
 *
 * 1. that fulfilled and rejected will be called only once.
 * 2. that either the fulfilled callback or the rejected callback will be
 *    called, but not both.
 * 3. that fulfilled and rejected will not be called in this turn.
 *
 * @param value      promise or immediate reference to observe
 * @param fulfilled  function to be called with the fulfilled value
 * @param rejected   function to be called with the rejection exception
 * @param progressed function to be called on any progress notifications
 * @return promise for the return value from the invoked callback
 */
Q.when = when;
function when(value, fulfilled, rejected, progressed) {
    return Q(value).then(fulfilled, rejected, progressed);
}

Promise.prototype.thenResolve = function (value) {
    return this.then(function () { return value; });
};

Q.thenResolve = function (promise, value) {
    return Q(promise).thenResolve(value);
};

Promise.prototype.thenReject = function (reason) {
    return this.then(function () { throw reason; });
};

Q.thenReject = function (promise, reason) {
    return Q(promise).thenReject(reason);
};

/**
 * If an object is not a promise, it is as "near" as possible.
 * If a promise is rejected, it is as "near" as possible too.
 * If it’s a fulfilled promise, the fulfillment value is nearer.
 * If it’s a deferred promise and the deferred has been resolved, the
 * resolution is "nearer".
 * @param object
 * @returns most resolved (nearest) form of the object
 */

// XXX should we re-do this?
Q.nearer = nearer;
function nearer(value) {
    if (isPromise(value)) {
        var inspected = value.inspect();
        if (inspected.state === "fulfilled") {
            return inspected.value;
        }
    }
    return value;
}

/**
 * @returns whether the given object is a promise.
 * Otherwise it is a fulfilled value.
 */
Q.isPromise = isPromise;
function isPromise(object) {
    return object instanceof Promise;
}

Q.isPromiseAlike = isPromiseAlike;
function isPromiseAlike(object) {
    return isObject(object) && typeof object.then === "function";
}

/**
 * @returns whether the given object is a pending promise, meaning not
 * fulfilled or rejected.
 */
Q.isPending = isPending;
function isPending(object) {
    return isPromise(object) && object.inspect().state === "pending";
}

Promise.prototype.isPending = function () {
    return this.inspect().state === "pending";
};

/**
 * @returns whether the given object is a value or fulfilled
 * promise.
 */
Q.isFulfilled = isFulfilled;
function isFulfilled(object) {
    return !isPromise(object) || object.inspect().state === "fulfilled";
}

Promise.prototype.isFulfilled = function () {
    return this.inspect().state === "fulfilled";
};

/**
 * @returns whether the given object is a rejected promise.
 */
Q.isRejected = isRejected;
function isRejected(object) {
    return isPromise(object) && object.inspect().state === "rejected";
}

Promise.prototype.isRejected = function () {
    return this.inspect().state === "rejected";
};

//// BEGIN UNHANDLED REJECTION TRACKING

// This promise library consumes exceptions thrown in handlers so they can be
// handled by a subsequent promise.  The exceptions get added to this array when
// they are created, and removed when they are handled.  Note that in ES6 or
// shimmed environments, this would naturally be a `Set`.
var unhandledReasons = [];
var unhandledRejections = [];
var reportedUnhandledRejections = [];
var trackUnhandledRejections = true;

function resetUnhandledRejections() {
    unhandledReasons.length = 0;
    unhandledRejections.length = 0;

    if (!trackUnhandledRejections) {
        trackUnhandledRejections = true;
    }
}

function trackRejection(promise, reason) {
    if (!trackUnhandledRejections) {
        return;
    }
    if (typeof process === "object" && typeof process.emit === "function") {
        Q.nextTick.runAfter(function () {
            if (array_indexOf(unhandledRejections, promise) !== -1) {
                process.emit("unhandledRejection", reason, promise);
                reportedUnhandledRejections.push(promise);
            }
        });
    }

    unhandledRejections.push(promise);
    if (reason && typeof reason.stack !== "undefined") {
        unhandledReasons.push(reason.stack);
    } else {
        unhandledReasons.push("(no stack) " + reason);
    }
}

function untrackRejection(promise) {
    if (!trackUnhandledRejections) {
        return;
    }

    var at = array_indexOf(unhandledRejections, promise);
    if (at !== -1) {
        if (typeof process === "object" && typeof process.emit === "function") {
            Q.nextTick.runAfter(function () {
                var atReport = array_indexOf(reportedUnhandledRejections, promise);
                if (atReport !== -1) {
                    process.emit("rejectionHandled", unhandledReasons[at], promise);
                    reportedUnhandledRejections.splice(atReport, 1);
                }
            });
        }
        unhandledRejections.splice(at, 1);
        unhandledReasons.splice(at, 1);
    }
}

Q.resetUnhandledRejections = resetUnhandledRejections;

Q.getUnhandledReasons = function () {
    // Make a copy so that consumers can't interfere with our internal state.
    return unhandledReasons.slice();
};

Q.stopUnhandledRejectionTracking = function () {
    resetUnhandledRejections();
    trackUnhandledRejections = false;
};

resetUnhandledRejections();

//// END UNHANDLED REJECTION TRACKING

/**
 * Constructs a rejected promise.
 * @param reason value describing the failure
 */
Q.reject = reject;
function reject(reason) {
    var rejection = Promise({
        "when": function (rejected) {
            // note that the error has been handled
            if (rejected) {
                untrackRejection(this);
            }
            return rejected ? rejected(reason) : this;
        }
    }, function fallback() {
        return this;
    }, function inspect() {
        return { state: "rejected", reason: reason };
    });

    // Note that the reason has not been handled.
    trackRejection(rejection, reason);

    return rejection;
}

/**
 * Constructs a fulfilled promise for an immediate reference.
 * @param value immediate reference
 */
Q.fulfill = fulfill;
function fulfill(value) {
    return Promise({
        "when": function () {
            return value;
        },
        "get": function (name) {
            return value[name];
        },
        "set": function (name, rhs) {
            value[name] = rhs;
        },
        "delete": function (name) {
            delete value[name];
        },
        "post": function (name, args) {
            // Mark Miller proposes that post with no name should apply a
            // promised function.
            if (name === null || name === void 0) {
                return value.apply(void 0, args);
            } else {
                return value[name].apply(value, args);
            }
        },
        "apply": function (thisp, args) {
            return value.apply(thisp, args);
        },
        "keys": function () {
            return object_keys(value);
        }
    }, void 0, function inspect() {
        return { state: "fulfilled", value: value };
    });
}

/**
 * Converts thenables to Q promises.
 * @param promise thenable promise
 * @returns a Q promise
 */
function coerce(promise) {
    var deferred = defer();
    Q.nextTick(function () {
        try {
            promise.then(deferred.resolve, deferred.reject, deferred.notify);
        } catch (exception) {
            deferred.reject(exception);
        }
    });
    return deferred.promise;
}

/**
 * Annotates an object such that it will never be
 * transferred away from this process over any promise
 * communication channel.
 * @param object
 * @returns promise a wrapping of that object that
 * additionally responds to the "isDef" message
 * without a rejection.
 */
Q.master = master;
function master(object) {
    return Promise({
        "isDef": function () {}
    }, function fallback(op, args) {
        return dispatch(object, op, args);
    }, function () {
        return Q(object).inspect();
    });
}

/**
 * Spreads the values of a promised array of arguments into the
 * fulfillment callback.
 * @param fulfilled callback that receives variadic arguments from the
 * promised array
 * @param rejected callback that receives the exception if the promise
 * is rejected.
 * @returns a promise for the return value or thrown exception of
 * either callback.
 */
Q.spread = spread;
function spread(value, fulfilled, rejected) {
    return Q(value).spread(fulfilled, rejected);
}

Promise.prototype.spread = function (fulfilled, rejected) {
    return this.all().then(function (array) {
        return fulfilled.apply(void 0, array);
    }, rejected);
};

/**
 * The async function is a decorator for generator functions, turning
 * them into asynchronous generators.  Although generators are only part
 * of the newest ECMAScript 6 drafts, this code does not cause syntax
 * errors in older engines.  This code should continue to work and will
 * in fact improve over time as the language improves.
 *
 * ES6 generators are currently part of V8 version 3.19 with the
 * --harmony-generators runtime flag enabled.  SpiderMonkey has had them
 * for longer, but under an older Python-inspired form.  This function
 * works on both kinds of generators.
 *
 * Decorates a generator function such that:
 *  - it may yield promises
 *  - execution will continue when that promise is fulfilled
 *  - the value of the yield expression will be the fulfilled value
 *  - it returns a promise for the return value (when the generator
 *    stops iterating)
 *  - the decorated function returns a promise for the return value
 *    of the generator or the first rejected promise among those
 *    yielded.
 *  - if an error is thrown in the generator, it propagates through
 *    every following yield until it is caught, or until it escapes
 *    the generator function altogether, and is translated into a
 *    rejection for the promise returned by the decorated generator.
 */
Q.async = async;
function async(makeGenerator) {
    return function () {
        // when verb is "send", arg is a value
        // when verb is "throw", arg is an exception
        function continuer(verb, arg) {
            var result;

            // Until V8 3.19 / Chromium 29 is released, SpiderMonkey is the only
            // engine that has a deployed base of browsers that support generators.
            // However, SM's generators use the Python-inspired semantics of
            // outdated ES6 drafts.  We would like to support ES6, but we'd also
            // like to make it possible to use generators in deployed browsers, so
            // we also support Python-style generators.  At some point we can remove
            // this block.

            if (typeof StopIteration === "undefined") {
                // ES6 Generators
                try {
                    result = generator[verb](arg);
                } catch (exception) {
                    return reject(exception);
                }
                if (result.done) {
                    return Q(result.value);
                } else {
                    return when(result.value, callback, errback);
                }
            } else {
                // SpiderMonkey Generators
                // FIXME: Remove this case when SM does ES6 generators.
                try {
                    result = generator[verb](arg);
                } catch (exception) {
                    if (isStopIteration(exception)) {
                        return Q(exception.value);
                    } else {
                        return reject(exception);
                    }
                }
                return when(result, callback, errback);
            }
        }
        var generator = makeGenerator.apply(this, arguments);
        var callback = continuer.bind(continuer, "next");
        var errback = continuer.bind(continuer, "throw");
        return callback();
    };
}

/**
 * The spawn function is a small wrapper around async that immediately
 * calls the generator and also ends the promise chain, so that any
 * unhandled errors are thrown instead of forwarded to the error
 * handler. This is useful because it's extremely common to run
 * generators at the top-level to work with libraries.
 */
Q.spawn = spawn;
function spawn(makeGenerator) {
    Q.done(Q.async(makeGenerator)());
}

// FIXME: Remove this interface once ES6 generators are in SpiderMonkey.
/**
 * Throws a ReturnValue exception to stop an asynchronous generator.
 *
 * This interface is a stop-gap measure to support generator return
 * values in older Firefox/SpiderMonkey.  In browsers that support ES6
 * generators like Chromium 29, just use "return" in your generator
 * functions.
 *
 * @param value the return value for the surrounding generator
 * @throws ReturnValue exception with the value.
 * @example
 * // ES6 style
 * Q.async(function* () {
 *      var foo = yield getFooPromise();
 *      var bar = yield getBarPromise();
 *      return foo + bar;
 * })
 * // Older SpiderMonkey style
 * Q.async(function () {
 *      var foo = yield getFooPromise();
 *      var bar = yield getBarPromise();
 *      Q.return(foo + bar);
 * })
 */
Q["return"] = _return;
function _return(value) {
    throw new QReturnValue(value);
}

/**
 * The promised function decorator ensures that any promise arguments
 * are settled and passed as values (`this` is also settled and passed
 * as a value).  It will also ensure that the result of a function is
 * always a promise.
 *
 * @example
 * var add = Q.promised(function (a, b) {
 *     return a + b;
 * });
 * add(Q(a), Q(B));
 *
 * @param {function} callback The function to decorate
 * @returns {function} a function that has been decorated.
 */
Q.promised = promised;
function promised(callback) {
    return function () {
        return spread([this, all(arguments)], function (self, args) {
            return callback.apply(self, args);
        });
    };
}

/**
 * sends a message to a value in a future turn
 * @param object* the recipient
 * @param op the name of the message operation, e.g., "when",
 * @param args further arguments to be forwarded to the operation
 * @returns result {Promise} a promise for the result of the operation
 */
Q.dispatch = dispatch;
function dispatch(object, op, args) {
    return Q(object).dispatch(op, args);
}

Promise.prototype.dispatch = function (op, args) {
    var self = this;
    var deferred = defer();
    Q.nextTick(function () {
        self.promiseDispatch(deferred.resolve, op, args);
    });
    return deferred.promise;
};

/**
 * Gets the value of a property in a future turn.
 * @param object    promise or immediate reference for target object
 * @param name      name of property to get
 * @return promise for the property value
 */
Q.get = function (object, key) {
    return Q(object).dispatch("get", [key]);
};

Promise.prototype.get = function (key) {
    return this.dispatch("get", [key]);
};

/**
 * Sets the value of a property in a future turn.
 * @param object    promise or immediate reference for object object
 * @param name      name of property to set
 * @param value     new value of property
 * @return promise for the return value
 */
Q.set = function (object, key, value) {
    return Q(object).dispatch("set", [key, value]);
};

Promise.prototype.set = function (key, value) {
    return this.dispatch("set", [key, value]);
};

/**
 * Deletes a property in a future turn.
 * @param object    promise or immediate reference for target object
 * @param name      name of property to delete
 * @return promise for the return value
 */
Q.del = // XXX legacy
Q["delete"] = function (object, key) {
    return Q(object).dispatch("delete", [key]);
};

Promise.prototype.del = // XXX legacy
Promise.prototype["delete"] = function (key) {
    return this.dispatch("delete", [key]);
};

/**
 * Invokes a method in a future turn.
 * @param object    promise or immediate reference for target object
 * @param name      name of method to invoke
 * @param value     a value to post, typically an array of
 *                  invocation arguments for promises that
 *                  are ultimately backed with `resolve` values,
 *                  as opposed to those backed with URLs
 *                  wherein the posted value can be any
 *                  JSON serializable object.
 * @return promise for the return value
 */
// bound locally because it is used by other methods
Q.mapply = // XXX As proposed by "Redsandro"
Q.post = function (object, name, args) {
    return Q(object).dispatch("post", [name, args]);
};

Promise.prototype.mapply = // XXX As proposed by "Redsandro"
Promise.prototype.post = function (name, args) {
    return this.dispatch("post", [name, args]);
};

/**
 * Invokes a method in a future turn.
 * @param object    promise or immediate reference for target object
 * @param name      name of method to invoke
 * @param ...args   array of invocation arguments
 * @return promise for the return value
 */
Q.send = // XXX Mark Miller's proposed parlance
Q.mcall = // XXX As proposed by "Redsandro"
Q.invoke = function (object, name /*...args*/) {
    return Q(object).dispatch("post", [name, array_slice(arguments, 2)]);
};

Promise.prototype.send = // XXX Mark Miller's proposed parlance
Promise.prototype.mcall = // XXX As proposed by "Redsandro"
Promise.prototype.invoke = function (name /*...args*/) {
    return this.dispatch("post", [name, array_slice(arguments, 1)]);
};

/**
 * Applies the promised function in a future turn.
 * @param object    promise or immediate reference for target function
 * @param args      array of application arguments
 */
Q.fapply = function (object, args) {
    return Q(object).dispatch("apply", [void 0, args]);
};

Promise.prototype.fapply = function (args) {
    return this.dispatch("apply", [void 0, args]);
};

/**
 * Calls the promised function in a future turn.
 * @param object    promise or immediate reference for target function
 * @param ...args   array of application arguments
 */
Q["try"] =
Q.fcall = function (object /* ...args*/) {
    return Q(object).dispatch("apply", [void 0, array_slice(arguments, 1)]);
};

Promise.prototype.fcall = function (/*...args*/) {
    return this.dispatch("apply", [void 0, array_slice(arguments)]);
};

/**
 * Binds the promised function, transforming return values into a fulfilled
 * promise and thrown errors into a rejected one.
 * @param object    promise or immediate reference for target function
 * @param ...args   array of application arguments
 */
Q.fbind = function (object /*...args*/) {
    var promise = Q(object);
    var args = array_slice(arguments, 1);
    return function fbound() {
        return promise.dispatch("apply", [
            this,
            args.concat(array_slice(arguments))
        ]);
    };
};
Promise.prototype.fbind = function (/*...args*/) {
    var promise = this;
    var args = array_slice(arguments);
    return function fbound() {
        return promise.dispatch("apply", [
            this,
            args.concat(array_slice(arguments))
        ]);
    };
};

/**
 * Requests the names of the owned properties of a promised
 * object in a future turn.
 * @param object    promise or immediate reference for target object
 * @return promise for the keys of the eventually settled object
 */
Q.keys = function (object) {
    return Q(object).dispatch("keys", []);
};

Promise.prototype.keys = function () {
    return this.dispatch("keys", []);
};

/**
 * Turns an array of promises into a promise for an array.  If any of
 * the promises gets rejected, the whole array is rejected immediately.
 * @param {Array*} an array (or promise for an array) of values (or
 * promises for values)
 * @returns a promise for an array of the corresponding values
 */
// By Mark Miller
// http://wiki.ecmascript.org/doku.php?id=strawman:concurrency&rev=1308776521#allfulfilled
Q.all = all;
function all(promises) {
    return when(promises, function (promises) {
        var pendingCount = 0;
        var deferred = defer();
        array_reduce(promises, function (undefined, promise, index) {
            var snapshot;
            if (
                isPromise(promise) &&
                (snapshot = promise.inspect()).state === "fulfilled"
            ) {
                promises[index] = snapshot.value;
            } else {
                ++pendingCount;
                when(
                    promise,
                    function (value) {
                        promises[index] = value;
                        if (--pendingCount === 0) {
                            deferred.resolve(promises);
                        }
                    },
                    deferred.reject,
                    function (progress) {
                        deferred.notify({ index: index, value: progress });
                    }
                );
            }
        }, void 0);
        if (pendingCount === 0) {
            deferred.resolve(promises);
        }
        return deferred.promise;
    });
}

Promise.prototype.all = function () {
    return all(this);
};

/**
 * Returns the first resolved promise of an array. Prior rejected promises are
 * ignored.  Rejects only if all promises are rejected.
 * @param {Array*} an array containing values or promises for values
 * @returns a promise fulfilled with the value of the first resolved promise,
 * or a rejected promise if all promises are rejected.
 */
Q.any = any;

function any(promises) {
    if (promises.length === 0) {
        return Q.resolve();
    }

    var deferred = Q.defer();
    var pendingCount = 0;
    array_reduce(promises, function (prev, current, index) {
        var promise = promises[index];

        pendingCount++;

        when(promise, onFulfilled, onRejected, onProgress);
        function onFulfilled(result) {
            deferred.resolve(result);
        }
        function onRejected() {
            pendingCount--;
            if (pendingCount === 0) {
                deferred.reject(new Error(
                    "Can't get fulfillment value from any promise, all " +
                    "promises were rejected."
                ));
            }
        }
        function onProgress(progress) {
            deferred.notify({
                index: index,
                value: progress
            });
        }
    }, undefined);

    return deferred.promise;
}

Promise.prototype.any = function () {
    return any(this);
};

/**
 * Waits for all promises to be settled, either fulfilled or
 * rejected.  This is distinct from `all` since that would stop
 * waiting at the first rejection.  The promise returned by
 * `allResolved` will never be rejected.
 * @param promises a promise for an array (or an array) of promises
 * (or values)
 * @return a promise for an array of promises
 */
Q.allResolved = deprecate(allResolved, "allResolved", "allSettled");
function allResolved(promises) {
    return when(promises, function (promises) {
        promises = array_map(promises, Q);
        return when(all(array_map(promises, function (promise) {
            return when(promise, noop, noop);
        })), function () {
            return promises;
        });
    });
}

Promise.prototype.allResolved = function () {
    return allResolved(this);
};

/**
 * @see Promise#allSettled
 */
Q.allSettled = allSettled;
function allSettled(promises) {
    return Q(promises).allSettled();
}

/**
 * Turns an array of promises into a promise for an array of their states (as
 * returned by `inspect`) when they have all settled.
 * @param {Array[Any*]} values an array (or promise for an array) of values (or
 * promises for values)
 * @returns {Array[State]} an array of states for the respective values.
 */
Promise.prototype.allSettled = function () {
    return this.then(function (promises) {
        return all(array_map(promises, function (promise) {
            promise = Q(promise);
            function regardless() {
                return promise.inspect();
            }
            return promise.then(regardless, regardless);
        }));
    });
};

/**
 * Captures the failure of a promise, giving an oportunity to recover
 * with a callback.  If the given promise is fulfilled, the returned
 * promise is fulfilled.
 * @param {Any*} promise for something
 * @param {Function} callback to fulfill the returned promise if the
 * given promise is rejected
 * @returns a promise for the return value of the callback
 */
Q.fail = // XXX legacy
Q["catch"] = function (object, rejected) {
    return Q(object).then(void 0, rejected);
};

Promise.prototype.fail = // XXX legacy
Promise.prototype["catch"] = function (rejected) {
    return this.then(void 0, rejected);
};

/**
 * Attaches a listener that can respond to progress notifications from a
 * promise's originating deferred. This listener receives the exact arguments
 * passed to ``deferred.notify``.
 * @param {Any*} promise for something
 * @param {Function} callback to receive any progress notifications
 * @returns the given promise, unchanged
 */
Q.progress = progress;
function progress(object, progressed) {
    return Q(object).then(void 0, void 0, progressed);
}

Promise.prototype.progress = function (progressed) {
    return this.then(void 0, void 0, progressed);
};

/**
 * Provides an opportunity to observe the settling of a promise,
 * regardless of whether the promise is fulfilled or rejected.  Forwards
 * the resolution to the returned promise when the callback is done.
 * The callback can return a promise to defer completion.
 * @param {Any*} promise
 * @param {Function} callback to observe the resolution of the given
 * promise, takes no arguments.
 * @returns a promise for the resolution of the given promise when
 * ``fin`` is done.
 */
Q.fin = // XXX legacy
Q["finally"] = function (object, callback) {
    return Q(object)["finally"](callback);
};

Promise.prototype.fin = // XXX legacy
Promise.prototype["finally"] = function (callback) {
    callback = Q(callback);
    return this.then(function (value) {
        return callback.fcall().then(function () {
            return value;
        });
    }, function (reason) {
        // TODO attempt to recycle the rejection with "this".
        return callback.fcall().then(function () {
            throw reason;
        });
    });
};

/**
 * Terminates a chain of promises, forcing rejections to be
 * thrown as exceptions.
 * @param {Any*} promise at the end of a chain of promises
 * @returns nothing
 */
Q.done = function (object, fulfilled, rejected, progress) {
    return Q(object).done(fulfilled, rejected, progress);
};

Promise.prototype.done = function (fulfilled, rejected, progress) {
    var onUnhandledError = function (error) {
        // forward to a future turn so that ``when``
        // does not catch it and turn it into a rejection.
        Q.nextTick(function () {
            makeStackTraceLong(error, promise);
            if (Q.onerror) {
                Q.onerror(error);
            } else {
                throw error;
            }
        });
    };

    // Avoid unnecessary `nextTick`ing via an unnecessary `when`.
    var promise = fulfilled || rejected || progress ?
        this.then(fulfilled, rejected, progress) :
        this;

    if (typeof process === "object" && process && process.domain) {
        onUnhandledError = process.domain.bind(onUnhandledError);
    }

    promise.then(void 0, onUnhandledError);
};

/**
 * Causes a promise to be rejected if it does not get fulfilled before
 * some milliseconds time out.
 * @param {Any*} promise
 * @param {Number} milliseconds timeout
 * @param {Any*} custom error message or Error object (optional)
 * @returns a promise for the resolution of the given promise if it is
 * fulfilled before the timeout, otherwise rejected.
 */
Q.timeout = function (object, ms, error) {
    return Q(object).timeout(ms, error);
};

Promise.prototype.timeout = function (ms, error) {
    var deferred = defer();
    var timeoutId = setTimeout(function () {
        if (!error || "string" === typeof error) {
            error = new Error(error || "Timed out after " + ms + " ms");
            error.code = "ETIMEDOUT";
        }
        deferred.reject(error);
    }, ms);

    this.then(function (value) {
        clearTimeout(timeoutId);
        deferred.resolve(value);
    }, function (exception) {
        clearTimeout(timeoutId);
        deferred.reject(exception);
    }, deferred.notify);

    return deferred.promise;
};

/**
 * Returns a promise for the given value (or promised value), some
 * milliseconds after it resolved. Passes rejections immediately.
 * @param {Any*} promise
 * @param {Number} milliseconds
 * @returns a promise for the resolution of the given promise after milliseconds
 * time has elapsed since the resolution of the given promise.
 * If the given promise rejects, that is passed immediately.
 */
Q.delay = function (object, timeout) {
    if (timeout === void 0) {
        timeout = object;
        object = void 0;
    }
    return Q(object).delay(timeout);
};

Promise.prototype.delay = function (timeout) {
    return this.then(function (value) {
        var deferred = defer();
        setTimeout(function () {
            deferred.resolve(value);
        }, timeout);
        return deferred.promise;
    });
};

/**
 * Passes a continuation to a Node function, which is called with the given
 * arguments provided as an array, and returns a promise.
 *
 *      Q.nfapply(FS.readFile, [__filename])
 *      .then(function (content) {
 *      })
 *
 */
Q.nfapply = function (callback, args) {
    return Q(callback).nfapply(args);
};

Promise.prototype.nfapply = function (args) {
    var deferred = defer();
    var nodeArgs = array_slice(args);
    nodeArgs.push(deferred.makeNodeResolver());
    this.fapply(nodeArgs).fail(deferred.reject);
    return deferred.promise;
};

/**
 * Passes a continuation to a Node function, which is called with the given
 * arguments provided individually, and returns a promise.
 * @example
 * Q.nfcall(FS.readFile, __filename)
 * .then(function (content) {
 * })
 *
 */
Q.nfcall = function (callback /*...args*/) {
    var args = array_slice(arguments, 1);
    return Q(callback).nfapply(args);
};

Promise.prototype.nfcall = function (/*...args*/) {
    var nodeArgs = array_slice(arguments);
    var deferred = defer();
    nodeArgs.push(deferred.makeNodeResolver());
    this.fapply(nodeArgs).fail(deferred.reject);
    return deferred.promise;
};

/**
 * Wraps a NodeJS continuation passing function and returns an equivalent
 * version that returns a promise.
 * @example
 * Q.nfbind(FS.readFile, __filename)("utf-8")
 * .then(console.log)
 * .done()
 */
Q.nfbind =
Q.denodeify = function (callback /*...args*/) {
    var baseArgs = array_slice(arguments, 1);
    return function () {
        var nodeArgs = baseArgs.concat(array_slice(arguments));
        var deferred = defer();
        nodeArgs.push(deferred.makeNodeResolver());
        Q(callback).fapply(nodeArgs).fail(deferred.reject);
        return deferred.promise;
    };
};

Promise.prototype.nfbind =
Promise.prototype.denodeify = function (/*...args*/) {
    var args = array_slice(arguments);
    args.unshift(this);
    return Q.denodeify.apply(void 0, args);
};

Q.nbind = function (callback, thisp /*...args*/) {
    var baseArgs = array_slice(arguments, 2);
    return function () {
        var nodeArgs = baseArgs.concat(array_slice(arguments));
        var deferred = defer();
        nodeArgs.push(deferred.makeNodeResolver());
        function bound() {
            return callback.apply(thisp, arguments);
        }
        Q(bound).fapply(nodeArgs).fail(deferred.reject);
        return deferred.promise;
    };
};

Promise.prototype.nbind = function (/*thisp, ...args*/) {
    var args = array_slice(arguments, 0);
    args.unshift(this);
    return Q.nbind.apply(void 0, args);
};

/**
 * Calls a method of a Node-style object that accepts a Node-style
 * callback with a given array of arguments, plus a provided callback.
 * @param object an object that has the named method
 * @param {String} name name of the method of object
 * @param {Array} args arguments to pass to the method; the callback
 * will be provided by Q and appended to these arguments.
 * @returns a promise for the value or error
 */
Q.nmapply = // XXX As proposed by "Redsandro"
Q.npost = function (object, name, args) {
    return Q(object).npost(name, args);
};

Promise.prototype.nmapply = // XXX As proposed by "Redsandro"
Promise.prototype.npost = function (name, args) {
    var nodeArgs = array_slice(args || []);
    var deferred = defer();
    nodeArgs.push(deferred.makeNodeResolver());
    this.dispatch("post", [name, nodeArgs]).fail(deferred.reject);
    return deferred.promise;
};

/**
 * Calls a method of a Node-style object that accepts a Node-style
 * callback, forwarding the given variadic arguments, plus a provided
 * callback argument.
 * @param object an object that has the named method
 * @param {String} name name of the method of object
 * @param ...args arguments to pass to the method; the callback will
 * be provided by Q and appended to these arguments.
 * @returns a promise for the value or error
 */
Q.nsend = // XXX Based on Mark Miller's proposed "send"
Q.nmcall = // XXX Based on "Redsandro's" proposal
Q.ninvoke = function (object, name /*...args*/) {
    var nodeArgs = array_slice(arguments, 2);
    var deferred = defer();
    nodeArgs.push(deferred.makeNodeResolver());
    Q(object).dispatch("post", [name, nodeArgs]).fail(deferred.reject);
    return deferred.promise;
};

Promise.prototype.nsend = // XXX Based on Mark Miller's proposed "send"
Promise.prototype.nmcall = // XXX Based on "Redsandro's" proposal
Promise.prototype.ninvoke = function (name /*...args*/) {
    var nodeArgs = array_slice(arguments, 1);
    var deferred = defer();
    nodeArgs.push(deferred.makeNodeResolver());
    this.dispatch("post", [name, nodeArgs]).fail(deferred.reject);
    return deferred.promise;
};

/**
 * If a function would like to support both Node continuation-passing-style and
 * promise-returning-style, it can end its internal promise chain with
 * `nodeify(nodeback)`, forwarding the optional nodeback argument.  If the user
 * elects to use a nodeback, the result will be sent there.  If they do not
 * pass a nodeback, they will receive the result promise.
 * @param object a result (or a promise for a result)
 * @param {Function} nodeback a Node.js-style callback
 * @returns either the promise or nothing
 */
Q.nodeify = nodeify;
function nodeify(object, nodeback) {
    return Q(object).nodeify(nodeback);
}

Promise.prototype.nodeify = function (nodeback) {
    if (nodeback) {
        this.then(function (value) {
            Q.nextTick(function () {
                nodeback(null, value);
            });
        }, function (error) {
            Q.nextTick(function () {
                nodeback(error);
            });
        });
    } else {
        return this;
    }
};

Q.noConflict = function() {
    throw new Error("Q.noConflict only works when Q is used as a global");
};

// All code before this point will be filtered from stack traces.
var qEndingLine = captureLine();

return Q;

});

}).call(this,_dereq_("1YiZ5S"))
},{"1YiZ5S":3}],5:[function(_dereq_,module,exports){
/*!
  * Reqwest! A general purpose XHR connection manager
  * license MIT (c) Dustin Diaz 2015
  * https://github.com/ded/reqwest
  */

!function (name, context, definition) {
  if (typeof module != 'undefined' && module.exports) module.exports = definition()
  else if (typeof define == 'function' && define.amd) define(definition)
  else context[name] = definition()
}('reqwest', this, function () {

  var context = this

  if ('document' in context) {
    var doc = document
      , byTag = 'getElementsByTagName'
      , head = doc[byTag]('head')[0]
  } else {
    var XHR2
    try {
      XHR2 = _dereq_('xhr2')
    } catch (ex) {
      throw new Error('Peer dependency `xhr2` required! Please npm install xhr2')
    }
  }


  var httpsRe = /^http/
    , protocolRe = /(^\w+):\/\//
    , twoHundo = /^(20\d|1223)$/ //http://stackoverflow.com/questions/10046972/msie-returns-status-code-of-1223-for-ajax-request
    , readyState = 'readyState'
    , contentType = 'Content-Type'
    , requestedWith = 'X-Requested-With'
    , uniqid = 0
    , callbackPrefix = 'reqwest_' + (+new Date())
    , lastValue // data stored by the most recent JSONP callback
    , xmlHttpRequest = 'XMLHttpRequest'
    , xDomainRequest = 'XDomainRequest'
    , noop = function () {}

    , isArray = typeof Array.isArray == 'function'
        ? Array.isArray
        : function (a) {
            return a instanceof Array
          }

    , defaultHeaders = {
          'contentType': 'application/x-www-form-urlencoded'
        , 'requestedWith': xmlHttpRequest
        , 'accept': {
              '*':  'text/javascript, text/html, application/xml, text/xml, */*'
            , 'xml':  'application/xml, text/xml'
            , 'html': 'text/html'
            , 'text': 'text/plain'
            , 'json': 'application/json, text/javascript'
            , 'js':   'application/javascript, text/javascript'
          }
      }

    , xhr = function(o) {
        // is it x-domain
        if (o['crossOrigin'] === true) {
          var xhr = context[xmlHttpRequest] ? new XMLHttpRequest() : null
          if (xhr && 'withCredentials' in xhr) {
            return xhr
          } else if (context[xDomainRequest]) {
            return new XDomainRequest()
          } else {
            throw new Error('Browser does not support cross-origin requests')
          }
        } else if (context[xmlHttpRequest]) {
          return new XMLHttpRequest()
        } else if (XHR2) {
          return new XHR2()
        } else {
          return new ActiveXObject('Microsoft.XMLHTTP')
        }
      }
    , globalSetupOptions = {
        dataFilter: function (data) {
          return data
        }
      }

  function succeed(r) {
    var protocol = protocolRe.exec(r.url)
    protocol = (protocol && protocol[1]) || context.location.protocol
    return httpsRe.test(protocol) ? twoHundo.test(r.request.status) : !!r.request.response
  }

  function handleReadyState(r, success, error) {
    return function () {
      // use _aborted to mitigate against IE err c00c023f
      // (can't read props on aborted request objects)
      if (r._aborted) return error(r.request)
      if (r._timedOut) return error(r.request, 'Request is aborted: timeout')
      if (r.request && r.request[readyState] == 4) {
        r.request.onreadystatechange = noop
        if (succeed(r)) success(r.request)
        else
          error(r.request)
      }
    }
  }

  function setHeaders(http, o) {
    var headers = o['headers'] || {}
      , h

    headers['Accept'] = headers['Accept']
      || defaultHeaders['accept'][o['type']]
      || defaultHeaders['accept']['*']

    var isAFormData = typeof FormData !== 'undefined' && (o['data'] instanceof FormData);
    // breaks cross-origin requests with legacy browsers
    if (!o['crossOrigin'] && !headers[requestedWith]) headers[requestedWith] = defaultHeaders['requestedWith']
    if (!headers[contentType] && !isAFormData) headers[contentType] = o['contentType'] || defaultHeaders['contentType']
    for (h in headers)
      headers.hasOwnProperty(h) && 'setRequestHeader' in http && http.setRequestHeader(h, headers[h])
  }

  function setCredentials(http, o) {
    if (typeof o['withCredentials'] !== 'undefined' && typeof http.withCredentials !== 'undefined') {
      http.withCredentials = !!o['withCredentials']
    }
  }

  function generalCallback(data) {
    lastValue = data
  }

  function urlappend (url, s) {
    return url + (/\?/.test(url) ? '&' : '?') + s
  }

  function handleJsonp(o, fn, err, url) {
    var reqId = uniqid++
      , cbkey = o['jsonpCallback'] || 'callback' // the 'callback' key
      , cbval = o['jsonpCallbackName'] || reqwest.getcallbackPrefix(reqId)
      , cbreg = new RegExp('((^|\\?|&)' + cbkey + ')=([^&]+)')
      , match = url.match(cbreg)
      , script = doc.createElement('script')
      , loaded = 0
      , isIE10 = navigator.userAgent.indexOf('MSIE 10.0') !== -1

    if (match) {
      if (match[3] === '?') {
        url = url.replace(cbreg, '$1=' + cbval) // wildcard callback func name
      } else {
        cbval = match[3] // provided callback func name
      }
    } else {
      url = urlappend(url, cbkey + '=' + cbval) // no callback details, add 'em
    }

    context[cbval] = generalCallback

    script.type = 'text/javascript'
    script.src = url
    script.async = true
    if (typeof script.onreadystatechange !== 'undefined' && !isIE10) {
      // need this for IE due to out-of-order onreadystatechange(), binding script
      // execution to an event listener gives us control over when the script
      // is executed. See http://jaubourg.net/2010/07/loading-script-as-onclick-handler-of.html
      script.htmlFor = script.id = '_reqwest_' + reqId
    }

    script.onload = script.onreadystatechange = function () {
      if ((script[readyState] && script[readyState] !== 'complete' && script[readyState] !== 'loaded') || loaded) {
        return false
      }
      script.onload = script.onreadystatechange = null
      script.onclick && script.onclick()
      // Call the user callback with the last value stored and clean up values and scripts.
      fn(lastValue)
      lastValue = undefined
      head.removeChild(script)
      loaded = 1
    }

    // Add the script to the DOM head
    head.appendChild(script)

    // Enable JSONP timeout
    return {
      abort: function () {
        script.onload = script.onreadystatechange = null
        err({}, 'Request is aborted: timeout', {})
        lastValue = undefined
        head.removeChild(script)
        loaded = 1
      }
    }
  }

  function getRequest(fn, err) {
    var o = this.o
      , method = (o['method'] || 'GET').toUpperCase()
      , url = typeof o === 'string' ? o : o['url']
      // convert non-string objects to query-string form unless o['processData'] is false
      , data = (o['processData'] !== false && o['data'] && typeof o['data'] !== 'string')
        ? reqwest.toQueryString(o['data'])
        : (o['data'] || null)
      , http
      , sendWait = false

    // if we're working on a GET request and we have data then we should append
    // query string to end of URL and not post data
    if ((o['type'] == 'jsonp' || method == 'GET') && data) {
      url = urlappend(url, data)
      data = null
    }

    if (o['type'] == 'jsonp') return handleJsonp(o, fn, err, url)

    // get the xhr from the factory if passed
    // if the factory returns null, fall-back to ours
    http = (o.xhr && o.xhr(o)) || xhr(o)

    http.open(method, url, o['async'] === false ? false : true)
    setHeaders(http, o)
    setCredentials(http, o)
    if (context[xDomainRequest] && http instanceof context[xDomainRequest]) {
        http.onload = fn
        http.onerror = err
        // NOTE: see
        // http://social.msdn.microsoft.com/Forums/en-US/iewebdevelopment/thread/30ef3add-767c-4436-b8a9-f1ca19b4812e
        http.onprogress = function() {}
        sendWait = true
    } else {
      http.onreadystatechange = handleReadyState(this, fn, err)
    }
    o['before'] && o['before'](http)
    if (sendWait) {
      setTimeout(function () {
        http.send(data)
      }, 200)
    } else {
      http.send(data)
    }
    return http
  }

  function Reqwest(o, fn) {
    this.o = o
    this.fn = fn

    init.apply(this, arguments)
  }

  function setType(header) {
    // json, javascript, text/plain, text/html, xml
    if (header === null) return undefined; //In case of no content-type.
    if (header.match('json')) return 'json'
    if (header.match('javascript')) return 'js'
    if (header.match('text')) return 'html'
    if (header.match('xml')) return 'xml'
  }

  function init(o, fn) {

    this.url = typeof o == 'string' ? o : o['url']
    this.timeout = null

    // whether request has been fulfilled for purpose
    // of tracking the Promises
    this._fulfilled = false
    // success handlers
    this._successHandler = function(){}
    this._fulfillmentHandlers = []
    // error handlers
    this._errorHandlers = []
    // complete (both success and fail) handlers
    this._completeHandlers = []
    this._erred = false
    this._responseArgs = {}

    var self = this

    fn = fn || function () {}

    if (o['timeout']) {
      this.timeout = setTimeout(function () {
        timedOut()
      }, o['timeout'])
    }

    if (o['success']) {
      this._successHandler = function () {
        o['success'].apply(o, arguments)
      }
    }

    if (o['error']) {
      this._errorHandlers.push(function () {
        o['error'].apply(o, arguments)
      })
    }

    if (o['complete']) {
      this._completeHandlers.push(function () {
        o['complete'].apply(o, arguments)
      })
    }

    function complete (resp) {
      o['timeout'] && clearTimeout(self.timeout)
      self.timeout = null
      while (self._completeHandlers.length > 0) {
        self._completeHandlers.shift()(resp)
      }
    }

    function success (resp) {
      var type = o['type'] || resp && setType(resp.getResponseHeader('Content-Type')) // resp can be undefined in IE
      resp = (type !== 'jsonp') ? self.request : resp
      // use global data filter on response text
      var filteredResponse = globalSetupOptions.dataFilter(resp.responseText, type)
        , r = filteredResponse
      try {
        resp.responseText = r
      } catch (e) {
        // can't assign this in IE<=8, just ignore
      }
      if (r) {
        switch (type) {
        case 'json':
          try {
            resp = context.JSON ? context.JSON.parse(r) : eval('(' + r + ')')
          } catch (err) {
            return error(resp, 'Could not parse JSON in response', err)
          }
          break
        case 'js':
          resp = eval(r)
          break
        case 'html':
          resp = r
          break
        case 'xml':
          resp = resp.responseXML
              && resp.responseXML.parseError // IE trololo
              && resp.responseXML.parseError.errorCode
              && resp.responseXML.parseError.reason
            ? null
            : resp.responseXML
          break
        }
      }

      self._responseArgs.resp = resp
      self._fulfilled = true
      fn(resp)
      self._successHandler(resp)
      while (self._fulfillmentHandlers.length > 0) {
        resp = self._fulfillmentHandlers.shift()(resp)
      }

      complete(resp)
    }

    function timedOut() {
      self._timedOut = true
      self.request.abort()
    }

    function error(resp, msg, t) {
      resp = self.request
      self._responseArgs.resp = resp
      self._responseArgs.msg = msg
      self._responseArgs.t = t
      self._erred = true
      while (self._errorHandlers.length > 0) {
        self._errorHandlers.shift()(resp, msg, t)
      }
      complete(resp)
    }

    this.request = getRequest.call(this, success, error)
  }

  Reqwest.prototype = {
    abort: function () {
      this._aborted = true
      this.request.abort()
    }

  , retry: function () {
      init.call(this, this.o, this.fn)
    }

    /**
     * Small deviation from the Promises A CommonJs specification
     * http://wiki.commonjs.org/wiki/Promises/A
     */

    /**
     * `then` will execute upon successful requests
     */
  , then: function (success, fail) {
      success = success || function () {}
      fail = fail || function () {}
      if (this._fulfilled) {
        this._responseArgs.resp = success(this._responseArgs.resp)
      } else if (this._erred) {
        fail(this._responseArgs.resp, this._responseArgs.msg, this._responseArgs.t)
      } else {
        this._fulfillmentHandlers.push(success)
        this._errorHandlers.push(fail)
      }
      return this
    }

    /**
     * `always` will execute whether the request succeeds or fails
     */
  , always: function (fn) {
      if (this._fulfilled || this._erred) {
        fn(this._responseArgs.resp)
      } else {
        this._completeHandlers.push(fn)
      }
      return this
    }

    /**
     * `fail` will execute when the request fails
     */
  , fail: function (fn) {
      if (this._erred) {
        fn(this._responseArgs.resp, this._responseArgs.msg, this._responseArgs.t)
      } else {
        this._errorHandlers.push(fn)
      }
      return this
    }
  , 'catch': function (fn) {
      return this.fail(fn)
    }
  }

  function reqwest(o, fn) {
    return new Reqwest(o, fn)
  }

  // normalize newline variants according to spec -> CRLF
  function normalize(s) {
    return s ? s.replace(/\r?\n/g, '\r\n') : ''
  }

  function serial(el, cb) {
    var n = el.name
      , t = el.tagName.toLowerCase()
      , optCb = function (o) {
          // IE gives value="" even where there is no value attribute
          // 'specified' ref: http://www.w3.org/TR/DOM-Level-3-Core/core.html#ID-862529273
          if (o && !o['disabled'])
            cb(n, normalize(o['attributes']['value'] && o['attributes']['value']['specified'] ? o['value'] : o['text']))
        }
      , ch, ra, val, i

    // don't serialize elements that are disabled or without a name
    if (el.disabled || !n) return

    switch (t) {
    case 'input':
      if (!/reset|button|image|file/i.test(el.type)) {
        ch = /checkbox/i.test(el.type)
        ra = /radio/i.test(el.type)
        val = el.value
        // WebKit gives us "" instead of "on" if a checkbox has no value, so correct it here
        ;(!(ch || ra) || el.checked) && cb(n, normalize(ch && val === '' ? 'on' : val))
      }
      break
    case 'textarea':
      cb(n, normalize(el.value))
      break
    case 'select':
      if (el.type.toLowerCase() === 'select-one') {
        optCb(el.selectedIndex >= 0 ? el.options[el.selectedIndex] : null)
      } else {
        for (i = 0; el.length && i < el.length; i++) {
          el.options[i].selected && optCb(el.options[i])
        }
      }
      break
    }
  }

  // collect up all form elements found from the passed argument elements all
  // the way down to child elements; pass a '<form>' or form fields.
  // called with 'this'=callback to use for serial() on each element
  function eachFormElement() {
    var cb = this
      , e, i
      , serializeSubtags = function (e, tags) {
          var i, j, fa
          for (i = 0; i < tags.length; i++) {
            fa = e[byTag](tags[i])
            for (j = 0; j < fa.length; j++) serial(fa[j], cb)
          }
        }

    for (i = 0; i < arguments.length; i++) {
      e = arguments[i]
      if (/input|select|textarea/i.test(e.tagName)) serial(e, cb)
      serializeSubtags(e, [ 'input', 'select', 'textarea' ])
    }
  }

  // standard query string style serialization
  function serializeQueryString() {
    return reqwest.toQueryString(reqwest.serializeArray.apply(null, arguments))
  }

  // { 'name': 'value', ... } style serialization
  function serializeHash() {
    var hash = {}
    eachFormElement.apply(function (name, value) {
      if (name in hash) {
        hash[name] && !isArray(hash[name]) && (hash[name] = [hash[name]])
        hash[name].push(value)
      } else hash[name] = value
    }, arguments)
    return hash
  }

  // [ { name: 'name', value: 'value' }, ... ] style serialization
  reqwest.serializeArray = function () {
    var arr = []
    eachFormElement.apply(function (name, value) {
      arr.push({name: name, value: value})
    }, arguments)
    return arr
  }

  reqwest.serialize = function () {
    if (arguments.length === 0) return ''
    var opt, fn
      , args = Array.prototype.slice.call(arguments, 0)

    opt = args.pop()
    opt && opt.nodeType && args.push(opt) && (opt = null)
    opt && (opt = opt.type)

    if (opt == 'map') fn = serializeHash
    else if (opt == 'array') fn = reqwest.serializeArray
    else fn = serializeQueryString

    return fn.apply(null, args)
  }

  reqwest.toQueryString = function (o, trad) {
    var prefix, i
      , traditional = trad || false
      , s = []
      , enc = encodeURIComponent
      , add = function (key, value) {
          // If value is a function, invoke it and return its value
          value = ('function' === typeof value) ? value() : (value == null ? '' : value)
          s[s.length] = enc(key) + '=' + enc(value)
        }
    // If an array was passed in, assume that it is an array of form elements.
    if (isArray(o)) {
      for (i = 0; o && i < o.length; i++) add(o[i]['name'], o[i]['value'])
    } else {
      // If traditional, encode the "old" way (the way 1.3.2 or older
      // did it), otherwise encode params recursively.
      for (prefix in o) {
        if (o.hasOwnProperty(prefix)) buildParams(prefix, o[prefix], traditional, add)
      }
    }

    // spaces should be + according to spec
    return s.join('&').replace(/%20/g, '+')
  }

  function buildParams(prefix, obj, traditional, add) {
    var name, i, v
      , rbracket = /\[\]$/

    if (isArray(obj)) {
      // Serialize array item.
      for (i = 0; obj && i < obj.length; i++) {
        v = obj[i]
        if (traditional || rbracket.test(prefix)) {
          // Treat each array item as a scalar.
          add(prefix, v)
        } else {
          buildParams(prefix + '[' + (typeof v === 'object' ? i : '') + ']', v, traditional, add)
        }
      }
    } else if (obj && obj.toString() === '[object Object]') {
      // Serialize object item.
      for (name in obj) {
        buildParams(prefix + '[' + name + ']', obj[name], traditional, add)
      }

    } else {
      // Serialize scalar item.
      add(prefix, obj)
    }
  }

  reqwest.getcallbackPrefix = function () {
    return callbackPrefix
  }

  // jQuery and Zepto compatibility, differences can be remapped here so you can call
  // .ajax.compat(options, callback)
  reqwest.compat = function (o, fn) {
    if (o) {
      o['type'] && (o['method'] = o['type']) && delete o['type']
      o['dataType'] && (o['type'] = o['dataType'])
      o['jsonpCallback'] && (o['jsonpCallbackName'] = o['jsonpCallback']) && delete o['jsonpCallback']
      o['jsonp'] && (o['jsonpCallback'] = o['jsonp'])
    }
    return new Reqwest(o, fn)
  }

  reqwest.ajaxSetup = function (options) {
    options = options || {}
    for (var k in options) {
      globalSetupOptions[k] = options[k]
    }
  }

  return reqwest
});

},{"xhr2":2}],6:[function(_dereq_,module,exports){

/**
 * Module dependencies.
 */

var global = (function() { return this; })();

/**
 * WebSocket constructor.
 */

var WebSocket = global.WebSocket || global.MozWebSocket;

/**
 * Module exports.
 */

module.exports = WebSocket ? ws : null;

/**
 * WebSocket constructor.
 *
 * The third `opts` options object gets ignored in web browsers, since it's
 * non-standard, and throws a TypeError if passed to the constructor.
 * See: https://github.com/einaros/ws/issues/227
 *
 * @param {String} uri
 * @param {Array} protocols (optional)
 * @param {Object) opts (optional)
 * @api public
 */

function ws(uri, protocols, opts) {
  var instance;
  if (protocols) {
    instance = new WebSocket(uri, protocols);
  } else {
    instance = new WebSocket(uri);
  }
  return instance;
}

if (WebSocket) ws.prototype = WebSocket.prototype;

},{}],7:[function(_dereq_,module,exports){

var extend   = _dereq_("extend");
var Q        = _dereq_("q");
var encoding = _dereq_("./encoding");
var socket   = _dereq_("./socket");
var http     = _dereq_("./http");

module.exports = createApiClient;

function createApiClient(options) {
    var config = {};
    var sessionId = null;
    var sessionIdProvider = function() { return sessionId; }
    var urlToken = "";
    var socketInstance;

    init();
    var self = {
        request: request,
        url: urlFromTemplate,
        formData: formData,
        sessionId: function (id) { setSessionId(id); return getSessionId(); },
        urlToken: function(token) { urlToken = (arguments.length > 0 ? token : urlToken); return urlToken },
        appKey: function() { return config.appKey; },
        baseUrl: function() { return config.baseUrl; },
        socket: getSocket
    }
    return self;

    function init() {
        config = extend({}, config, options);
        fixBaseUrl();
        try { config.appKeyBase32 = encoding.base32.encode(config.appKey); } catch(e) {}
    }

    function fixBaseUrl() {
        var u = config.baseUrl;
        if(typeof u == "string" && u.lastIndexOf("/") != u.length - 1) {
            config.baseUrl = u + "/";
        }
    }

    function urlFromTemplate(template, parameters, query) {
        var url = template;
        var queryString = "";
        if(url.indexOf("/") == 0) {
            url = url.substr(1);
        }
        if(typeof parameters == "object") {
            Object.keys(parameters).forEach(function(key) {
                url = url.replace(":" + key, uriEncode(parameters[key]));
            });
        }
        if(typeof query == "object") {
            queryString = Object.keys(query).map(function(key) {
                return key + "=" + uriEncode(query[key]);
            }).join("&");
        }
        if(queryString != "") {
            url += ((url.indexOf("?") == -1) ? "?" : "&") + queryString;
        }
        return config.baseUrl + url;
    }

    function uriEncode(string) {
        return encodeURIComponent(string).replace(/'/g, "%27");
    }

    function request(method, url, data) {
        var options = {};
        options.url = url;
        options.method = method
        options.contentType = "application/json";
        options.headers = getRequestHeaders();
        options.processData = true;
        options.data = data;
        if(typeof FormData != "undefined" && data instanceof FormData) {
            options.contentType = false;
            options.processData = false;
        } else if(typeof data == "object") {
            options.data = JSON.stringify(data);
        }

        var defer = Q.defer();
        http.request(options)
            .progress(function(progress) {
                defer.notify(progress);
            })
            .fail(function(error) {
                if(config.log) {
                    config.log("error", "Appstax Error: " + error.message);
                }
                defer.reject(error);
            })
            .then(function(result) {
                if(typeof result.request != "undefined") {
                    var token = result.request.getResponseHeader("x-appstax-urltoken");
                    if(typeof token === "string") {
                        urlToken = token;
                    }
                }
                defer.resolve(result.response);
            });
        return defer.promise;
    }

    function getRequestHeaders() {
        var h = {};
        addAppKeyHeader(h);
        addSessionIdHeader(h);
        addPreflightHeader(h);
        addUrlTokenHeader(h);
        return h;

        function addAppKeyHeader(headers) {
            if(typeof config.appKey == "string") {
                headers["x-appstax-appkey"] = config.appKey;
            }
        }
        function addSessionIdHeader(headers) {
            if(hasSession()) {
                headers["x-appstax-sessionid"] = getSessionId();
            }
        }
        function addPreflightHeader(headers) {
            var header = [
                "x-appstax-x",
                hasSession() ? "u" : "n",
                config.appKeyBase32
            ].join("");
            headers[header] = header;
        }
        function addUrlTokenHeader(headers) {
            headers["x-appstax-urltoken"] = "_";
        }
    }

    function hasSession() {
        var s = getSessionId();
        return s !== null && s !== undefined;
    }

    function setSessionId(s) {
        switch(typeof s) {
            case "string":
            case "object":
                sessionId = s;
                break;
            case "function":
                sessionIdProvider = s;
                break;
        }
    }

    function getSessionId() {
        return sessionIdProvider();
    }

    function getSocket() {
        if(!socketInstance) {
            socketInstance = socket(self);
        }
        return socketInstance;
    }

    function formData() {
        if(typeof FormData != "undefined") {
            return new FormData();
        } else {
            return null;
        }
    }
}

},{"./encoding":10,"./http":14,"./socket":21,"extend":1,"q":4}],8:[function(_dereq_,module,exports){

module.exports = createChannelsContext;

function createChannelsContext(socket, objects) {
    var channels;
    var handlers;
    var idCounter = 0;

    init();
    return {
        getChannel: getChannel
    };

    function init() {
        socket.on("open", handleSocketOpen);
        socket.on("error", handleSocketError);
        socket.on("message", handleSocketMessage);
        channels = {};
        handlers = [];
    }

    function createChannel(channelName, options) {
        var nameParts = channelName.split("/");
        var key = getChannelKey(channelName, options);
        var channel = channels[key] = {
            type: nameParts[0],
            key: key,
            created: false,
            wildcard: channelName.indexOf("*") != -1,
            on: function(eventName, handler) {
                addHandler(channelName, eventName, handler)
            },
            send: function(message) {
                sendPacket({
                    channel:channelName,
                    command:"publish",
                    message: message
                });
            },
            grant: function(username, permissions) {
                sendPermission(channelName, "grant", [username], permissions);
            },
            revoke: function(username, permissions) {
                sendPermission(channelName, "revoke", [username], permissions);
            }
        };


        switch(channel.type) {

            case "private":
                sendPacket({channel:channelName, command:"subscribe"});
                if(options != undefined) {
                    var usernames = options;
                    sendPermission(channelName, "grant", usernames, ["read", "write"]);
                }
                break;

            case "objects":
                sendPacket({channel:channelName, command:"subscribe", filter: options || ""});
                break;

            default:
                sendPacket({channel:channelName, command:"subscribe"});
        }

        return channel;
    }

    function sendPermission(channelName, change, usernames, permissions) {
        sendCreate(channelName);
        permissions.forEach(function(permission) {
            sendPacket({
                channel: channelName,
                command: change + "." + permission,
                data: usernames
            })
        });
    }

    function sendCreate(channelName) {
        var channel = getChannel(channelName);
        if(!channel.created) {
            channel.created = true;
            sendPacket({channel:channelName, command:"channel.create"});
        }
    }

    function getChannel(name, options) {
        var key = getChannelKey(name, options)
        if(!channels[key]) {
            createChannel(name, options);
        }
        return channels[key];
    }

    function sendPacket(packet) {
        packet.id = String(idCounter++);
        socket.send(packet);
    }

    function notifyHandlers(channelName, eventName, event) {
        getHandlers(channelName, eventName).forEach(function(handler) {
            handler(event);
        });
    }

    function getHandlers(channelName, eventName) {
        var filtered = [];
        if(channelName == "*") {
            filtered = handlers.filter(function(handler) {
                return handler.eventName == "*" || handler.eventName == eventName;
            });
        } else {
            filtered = handlers.filter(function(handler) {
                return (handler.eventName == "*" || handler.eventName == eventName) &&
                       handler.regexp.test(channelName)
            });
        }
        return filtered.map(function(handler) {
            return handler.fn;
        });
    }

    function getChannelKey(channelName, options) {
        var nameParts = channelName.split("/");
        var type = nameParts[0];
        if(type == "objects") {
            return channelName + "$" + options;
        } else {
            return channelName;
        }
    }

    function addHandler(channelPattern, eventName, handler) {
        var regexp;
        if(channelPattern.lastIndexOf("*") == channelPattern.length - 1) {
            regexp = new RegExp("^" + channelPattern.replace("*", ""));
        } else {
            regexp = new RegExp("^" + channelPattern + "$");
        }
        handlers.push({
            regexp: regexp,
            eventName: eventName,
            fn: handler
        });
    }

    function handleSocketOpen(event) {
        notifyHandlers("*", "open", {type: "open"});
    }

    function handleSocketError(event) {
        notifyHandlers("*", "error", {
            type:"error",
            error: new Error("Error connecting to realtime service")
        });
    }

    function handleSocketMessage(socketEvent) {
        var event = {};
        try {
            event = JSON.parse(socketEvent.data);
        } catch(e) {}

        if(typeof event.channel === "string" &&
           typeof event.event   === "string") {
            event.type = event.event;
            if(event.type.indexOf("object.") == 0) {
                var collection = event.channel.split("/")[1];
                event.object = objects.createObject(collection, event.data);
            }
            notifyHandlers(event.channel, event.type, event);
        }
    }
}


},{}],9:[function(_dereq_,module,exports){

module.exports = createCollectionsContext;

function createCollectionsContext() {
    var collections = {};

    return {
        defaultValues: defaultValues,
        get: getCollection,
        collection: function(c, p) { defineCollection(c, p); return getCollection(c); }
    }

    function defineCollection(name, options) {
        collection = parseCollection(options);
        collections["$" + name] = collection;
    }

    function parseCollection(options) {
        var collection = {};
        Object.keys(options).forEach(function(key) {
            var option = options[key];
            var column = {};
            if(typeof option === "string") {
                column.type = option;
            } else if(typeof option === "object" && typeof option.type === "string") {
                column.type = option.type;
            }
            if(column.type === "relation") {
                column.relation = option.relation;
            }
            collection[key] = column;
        });
        return collection;
    }

    function getCollection(name) {
        return collections["$" + name];
    }

    function defaultValues(collectionName) {
        var collection = getCollection(collectionName);
        var values = {};
        if(collection) {
            Object.keys(collection).forEach(function(key) {
                values[key] = defaultValueForColumn(collection[key])
            });
        }
        return values;
    }

    function defaultValueForColumn(column) {
        switch(column.type) {
            case "string": return "";
            case "number": return 0;
            case "array": return [];
            case "file": return {sysDatatype:"file", filename:"", url:""};
            case "relation": return {sysDatatype:"relation", sysRelationType:column.relation, sysObjectIds:[]};
        }
        return undefined;
    }
}

},{}],10:[function(_dereq_,module,exports){

var nibbler = _dereq_("./nibbler");

var base64 = nibbler.create({
    dataBits: 8,
    codeBits: 6,
    keyString: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
    pad: "-"
})

var base32 = nibbler.create({
    dataBits: 8,
    codeBits: 5,
    keyString: "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567",
    pad: "-"
});

module.exports = {
    base64: base64,
    base32: base32,
    base64ToBase32: function(source) {
        return base32.encode(base64.decode(source));
    }
}

},{"./nibbler":17}],11:[function(_dereq_,module,exports){

module.exports = {
    log: function(error) {
        if(console && console.error) {
            if(error && error.message) {
                console.error("Appstax Error: " + error.message, error);
            } else {
                console.error("Appstax Error");
            }
            if(error && error.stack) {
                console.error(error.stack);
            }
        }
        throw error;
    }
}

},{}],12:[function(_dereq_,module,exports){

var extend      = _dereq_("extend");
var objects     = _dereq_("./objects");
var users       = _dereq_("./users");
var files       = _dereq_("./files");
var collections = _dereq_("./collections");
var apiClient   = _dereq_("./apiclient");
var request     = _dereq_("./request");
var channels    = _dereq_("./channels");
var models      = _dereq_("./models");
var createHub   = _dereq_("./hub");

var defaults = {
    baseUrl: "https://appstax.com/api/latest/",
    log: log
}

var mainContext = createContext(defaults);
module.exports = mainContext;
module.exports.app = createContext;

function createContext(options) {
    var context = { init: init };
    var config  = {};
    var hub = createHub();

    init(options);
    return context;

    function init(options) {
        if(options == null) {
            return;
        }

        if(typeof options === "string") {
            options = {appKey:options};
        }
        config = extend({}, defaults, config, options);
        if(config.log === false) { config.log = function() {} }

        // init modules
        context.apiClient   = apiClient({baseUrl: config.baseUrl, appKey: config.appKey, log: config.log});
        context.files       = files(context.apiClient);
        context.collections = collections();
        context.objects     = objects(context.apiClient, context.files, context.collections);
        context.users       = users(context.apiClient, context.objects, hub);
        context.request     = request(context.apiClient)
        context.channels    = channels(context.apiClient.socket(), context.objects);
        context.models      = models(context.objects, context.users, context.channels, context.apiClient.socket(), hub);

        // expose shortcuts
        context.object      = context.objects.createObject;
        context.status      = context.objects.getObjectStatus;
        context.findAll     = context.objects.findAll;
        context.find        = context.objects.find;
        context.search      = context.objects.search;
        context.signup      = context.users.signup;
        context.login       = context.users.login;
        context.logout      = context.users.logout;
        context.currentUser = context.users.currentUser;
        context.collection  = context.collections.collection;
        context.file        = context.files.createFile;
        context.sessionId   = context.apiClient.sessionId;
        context.channel     = context.channels.getChannel;
        context.model       = context.models.create;
    }
}

function log(level, message) {
    if(console && console[level]) {
        console[level].apply(console, Array.prototype.slice.call(arguments, 1));
    }
}


},{"./apiclient":7,"./channels":8,"./collections":9,"./files":13,"./hub":15,"./models":16,"./objects":18,"./request":20,"./users":22,"extend":1}],13:[function(_dereq_,module,exports){

var Q         = _dereq_("q");
var extend    = _dereq_("extend");

module.exports = createFilesContext;

function createFilesContext(apiClient) {

    return {
        create: createFile,
        isFile: isFile,
        saveFile: saveFile,
        status: fileStatus,
        setUrl: setUrl,
        urlForFile: urlForFile,
        nativeFile: getNativeFile,
        createFile: createFile
    }

    function createFile(options) {
        var file = Object.create({});
        var internal;

        if(options instanceof Blob) {
            var nativeFile = options;
            internal = createInternalFile(file, {
                filename: nativeFile.name,
                nativeFile: nativeFile
            });
        } else if(isFileInput(options)) {
            if(options.files.length == 0) {
                return undefined;
            }
            var nativeFile = options.files[0];
            internal = createInternalFile(file, {
                filename: nativeFile.name,
                nativeFile: nativeFile
            });
        } else {
            internal = createInternalFile(file, options);
            internal.status = "saved";
        }

        if(file && internal) {
            Object.defineProperty(file, "filename", { get: function() { return internal.filename; }, enumerable:true });
            Object.defineProperty(file, "url", { get: function() { return internal.url; }, enumerable:true });
            Object.defineProperty(file, "preview", { value: function() { return previewFile(internal); }});
            Object.defineProperty(file, "imageUrl", { value: function(operation, options) { return imageUrl(internal, operation, options); }});
            Object.defineProperty(file, "internalFile", { value: internal, enumerable: false, writable: false });
        } else {
            throw new Error("Invalid file options");
        }
        return file;
    }

    function createInternalFile(file, options) {
        var internal = {
            file: file,
            filename: options.filename,
            nativeFile: options.nativeFile,
            url: options.url || "",
            status: "new"
        }
        return internal;
    }

    function previewFile(internalFile) {
        if(!internalFile.previewPromise) {
            var defer = Q.defer();
            var reader = new FileReader();
            reader.onload = function(event) {
                internalFile.url = event.target.result;
                defer.resolve(internalFile.file);
            }
            reader.readAsDataURL(internalFile.nativeFile);
            internalFile.previewPromise = defer.promise;
        }
        return internalFile.previewPromise;
    }

    function imageUrl(internalFile, operation, options) {
        var o = extend({
            width: "-",
            height: "-"
        }, options);

        return internalFile.url.replace("/files/", "/images/" + operation + "/" + o.width + "/" + o.height + "/");
    }

    function saveFile(collectionName, objectId, propertyName, file) {
        var defer = Q.defer();
        var internal = file.internalFile;
        internal.status = "saving";
        var url = urlForFile(collectionName, objectId, propertyName, file.filename);
        var data = new FormData();
        data.append("file", internal.nativeFile);
        apiClient.request("put", url, data)
            .progress(function(progress) {
                defer.notify(progress);
            })
            .then(function(response) {
                internal.status = "saved";
                internal.url = url;
                defer.resolve(file);
            });
        return defer.promise;
    }

    function urlForFile(collectionName, objectId, propertyName, filename) {
        if(!filename) {
            return "";
        }
        var tokenKey = "token";
        var tokenValue = apiClient.urlToken();
        if(tokenValue.length < 2) {
            tokenKey = "appkey";
            tokenValue = apiClient.appKey();
        }
        return apiClient.url("/files/:collectionName/:objectId/:propertyName/:filename?:tokenKey=:tokenValue", {
            collectionName: collectionName,
            objectId: objectId,
            propertyName: propertyName,
            filename: filename,
            tokenKey: tokenKey,
            tokenValue: tokenValue
        })
    }

    function getNativeFile(file) {
        var nativeFile = null;
        var internal = file.internalFile;
        if(internal != null) {
            nativeFile = internal.nativeFile;
        }
        return nativeFile;
    }

    function isFile(file) {
        return file != null && file != undefined && file.internalFile != null;
    }

    function isFileInput(input) {
        return typeof input != "undefined" &&
               input.nodeName == "INPUT" &&
               input.type == "file";
    }

    function fileStatus(file, status) {
        if(typeof status === "string") {
            file.internalFile.status = status;
        }
        return file.internalFile.status;
    }

    function setUrl(file, url) {
        var internal = file.internalFile;
        if(internal) {
            internal.url = url;
        }
    }
}

},{"extend":1,"q":4}],14:[function(_dereq_,module,exports){

var extend  = _dereq_("extend");
var Q       = _dereq_("q");
var reqwest = _dereq_("reqwest");

module.exports = {
    request: function(options) {
        var defer = Q.defer();

        var r = reqwest(extend({
                contentType: "application/json",
                crossOrigin: (typeof document == "object"),
                before: function(xhr) {
                    if(xhr && xhr.upload) {
                        if(xhr.upload.addEventListener) {
                            xhr.upload.addEventListener("progress", progress);
                        } else {
                            xhr.upload.onprogress = progress;
                        }
                    }
                    function progress(event) {
                        defer.notify({
                            percent: 100 * event.loaded / event.total,
                            loaded: event.loaded,
                            total: event.total
                        });
                    };
                }
            }, options))
            .then(function(response) {
                if(response && typeof response.responseText == "string") {
                    response = response.responseText;
                }
                try {
                    response = JSON.parse(response);
                } catch(e) {}
                defer.notify({percent: 100});
                defer.resolve({
                    response: response,
                    request: r.request
                });
            })
            .fail(function(xhr) {
                defer.reject(errorFromXhr(xhr));
            });

        return defer.promise;
    }
}

function errorFromXhr(xhr) {
    try {
        var result = JSON.parse(xhr.responseText);
        if(typeof result.errorMessage == "string") {
            return new Error(result.errorMessage);
        } else {
            return result;
        }
    } catch(e) {}
    return new Error(xhr.responseText);
}

},{"extend":1,"q":4,"reqwest":5}],15:[function(_dereq_,module,exports){

var extend = _dereq_("extend");

module.exports = createHub;

function createHub() {

    var handlers = [];

    return {
        on: on,
        pub: pub
    }

    function on(type, handler) {
        handlers.push({
            type: type,
            handler: handler
        });
    }

    function pub(type, data) {
        var event = extend({}, data, {type: type});
        handlers.forEach(function(handler) {
            if(handler.type == type) {
                handler.handler(event);
            }
        });
    }
}

},{"extend":1}],16:[function(_dereq_,module,exports){

module.exports = createModelContext;

function createModelContext(objects, users, channels, socket, hub) {
    return {
        create: function() {
            return createModel(objects, users, channels, socket, hub);
        }
    }
}

function createModel(objects, users, channels, socket, hub) {
    var observers = [];
    var handlers = [];
    var allObjects = {};

    var api = {
        watch: addObserver,
        on: addHandler
    }
    var model = {
        root: api,
        normalize: normalize,
        notifyHandlers: notifyHandlers,
        updateObject: updateObject
    }
    return api;

    function addObserver(name, options) {
        options = options || {};

        var observer;
        if("currentUser" == name) {
            observer = createCurrentUserObserver(model, objects, users, channels, hub);
        } else if("status" == name) {
            observer = createConnectionStatusObserver(model, socket);
        } else {
            observer = createArrayObserver(name, options, model, objects, channels);
        }
        observers.push(observer);
        observer.load();
        observer.connect();
    }

    function addHandler(event, handler) {
        handlers.push({event:event, handler:handler});
    }

    function notifyHandlers(event, data) {
        handlers.forEach(function(handler) {
            if(handler.event == event) {
                handler.handler(data);
            }
        });
    }

    function normalize(object, depth) {
        if(!object) {
            return object;
        }
        var depth = depth || 0;
        var id = object.id;
        var normalized = allObjects[id];
        if(typeof normalized == "undefined") {
            normalized = allObjects[id] = object;
        } else {
            objects.copy(object, normalized);
        }
        if(depth >= 0) {
            Object.keys(object).forEach(function(key) {
                var property = object[key];
                if(typeof property != "undefined" && typeof property.collectionName != "undefined") {
                    normalized[key] = normalize(property, depth - 1);
                } else if(Array.isArray(property)) {
                    property.forEach(function(x, i) {
                        if(typeof x.collectionName != "undefined") {
                            normalized[key][i] = normalize(x, depth - 1);
                        }
                    });
                }
            });
        }
        return normalized;
    }

    function updateObject(updated, depth) {
        normalize(updated, depth);
        observers.forEach(function(observer) {
            observer.sort && observer.sort();
        });
        notifyHandlers("change");
    }
}

function createArrayObserver(name, options, model, objects, channels) {
    var observer = {};
    observer.name = name;
    observer.collection = options.collection || name;
    observer.order = options.order || "-created";
    observer.filter = options.filter;
    observer.expand = options.expand + 0 || undefined;
    observer.sort = sort;
    observer.load = load;
    observer.connect = connect;

    var connectedRelations = {}; // collection:bool
    var expandedObjects = {}; // id:depth

    set([]);
    return observer;

    function set(o) {
        o.map(function(x) {
            x = model.normalize(x, observer.expand);
            registerRelations(x);
            return x;
        });
        extendArray(o);
        model.root[observer.name] = o;
        sort();
        model.notifyHandlers("change");
    }

    function get() {
        return model.root[observer.name];
    }

    function add(o) {
        o = model.normalize(o);
        registerRelations(o);
        get().push(o);
        observer.sort();
        model.notifyHandlers("change");
    }

    function update(o) {
        var depth = expandedObjects[o.id];
        if(typeof depth != "undefined" && depth > 0) {
            o.expand(depth).then(_update);
        } else {
            _update();
        }

        function _update() {
            model.updateObject(o, depth);
            registerRelations(o);
        }
    }

    function remove(o) {
        get().splice(indexOf(o), 1);
        model.notifyHandlers("change");
    }

    function indexOf(o) {
        var index = -1;
        get().some(function(a, i) {
            if(a.id == o.id) {
                index = i;
                return true;
            }
            return false;
        });
        return index;
    }

    function sort() {
        objects.sort(get(), observer.order);
    }

    function load() {
        var options = {expand: observer.expand};
        if(typeof observer.filter == "string") {
            objects.find(observer.collection, observer.filter, options).then(set);
        } else {
            objects.findAll(observer.collection, options).then(set);
        }
    }

    function connect() {
        var channel = channels.getChannel("objects/" + observer.collection, observer.filter);
        channel.on("object.created", function(event) {
            add(event.object);
        });
        channel.on("object.deleted", function(event) {
            remove(event.object);
        });
        channel.on("object.updated", function(event) {
            update(event.object);
        });
    }

    function connectRelation(collection) {
        if(!connectedRelations[collection]) {
            connectedRelations[collection] = true;
            var channel = channels.getChannel("objects/" + collection);
            channel.on("object.updated", function(event) {
                update(event.object);
            });
        }
    }

    function registerRelations(object, depth) {
        var depth = (typeof depth != "undefined") ? depth : observer.expand || 0;

        expandedObjects[object.id] = depth;
        if(depth > 0) {
            objects.getRelatedObjects(object).forEach(function(x) {
                connectRelation(x.collectionName);
                registerRelations(x, depth - 1);
            });
        }
    }

    function extendArray(array) {
        array.has = _filterHas;

        function _filterHas(key, value) {
            var filtered = array.filter(function(o) {
                var expected = [].concat(value);
                var actual   = [].concat(o[key]);
                return expected.some(function(v1) {
                    return actual.some(function(v2) {
                        return (v1.id || v1) == (v2.id || v2);
                    });
                });
            });
            extendArray(filtered);
            return filtered;
        }
    }
}

function createCurrentUserObserver(model, objects, users, channels, hub) {
    var observer = {}
    observer.name = "currentUser";
    observer.load = load;
    observer.connect = connect;

    init();
    return observer;

    function init() {
        model.root[observer.name] = null;
        hub.on("users.login", function(event) {
            set(event.user);
        });
        hub.on("users.signup", function(event) {
            set(event.user);
        });
        hub.on("users.logout", function() {
            set(null);
        });
    }

    function set(o) {
        o = model.normalize(o);
        model.root[observer.name] = o;
        model.notifyHandlers("change");
    }

    function load() {
        var user = users.currentUser();
        if(user) {
            user.refresh().then(set);
        }
    }

    function connect() {
        var ch = channels.getChannel("objects/users");
        ch.on("object.updated", function(event) {
            model.updateObject(event.object);
        });
    }
}

function createConnectionStatusObserver(model, socket) {
    var observer = {};
    observer.name = "status";
    observer.load = load;
    observer.connect = connect;

    init();
    return observer;

    function init() {
        set(socket.status());
        socket.on("status", function(event) {
            set(socket.status());
        });
    }

    function set(o) {
        model.root[observer.name] = o;
        model.notifyHandlers("change");
    }

    function load() {

    }

    function connect() {

    }
}

},{}],17:[function(_dereq_,module,exports){
/*
Copyright (c) 2010-2013 Thomas Peri
http://www.tumuski.com/

Permission is hereby granted, free of charge, to any person obtaining a
copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be included
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

/*jslint white: true, browser: true, onevar: true, undef: true, nomen: true,
    eqeqeq: true, plusplus: true, regexp: true, newcap: true, immed: true */
// (good parts minus bitwise and strict, plus white.)

/**
 * Nibbler - Multi-Base Encoder
 *
 * version 2013-04-24
 *
 * Options:
 *   dataBits: The number of bits in each character of unencoded data.
 *   codeBits: The number of bits in each character of encoded data.
 *   keyString: The characters that correspond to each value when encoded.
 *   pad (optional): The character to pad the end of encoded output.
 *   arrayData (optional): If truthy, unencoded data is an array instead of a string.
 *
 * Example:
 *
 * var base64_8bit = new Nibbler({
 *     dataBits: 8,
 *     codeBits: 6,
 *     keyString: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
 *     pad: '='
 * });
 * base64_8bit.encode("Hello, World!");  // returns "SGVsbG8sIFdvcmxkIQ=="
 * base64_8bit.decode("SGVsbG8sIFdvcmxkIQ==");  // returns "Hello, World!"
 *
 * var base64_7bit = new Nibbler({
 *     dataBits: 7,
 *     codeBits: 6,
 *     keyString: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
 *     pad: '='
 * });
 * base64_7bit.encode("Hello, World!");  // returns "kZdmzesQV9/LZkQg=="
 * base64_7bit.decode("kZdmzesQV9/LZkQg==");  // returns "Hello, World!"
 *
 */

module.exports = {
    create: function(options) {
        return new Nibbler(options);
    }
}


var Nibbler = function (options) {
    "use strict";

    // Code quality tools like jshint warn about bitwise operators,
    // because they're easily confused with other more common operators,
    // and because they're often misused for doing arithmetic.  Nibbler uses
    // them properly, though, for moving individual bits, so turn off the warning.
    /*jshint bitwise:false */

    var construct,

        // options
        pad, dataBits, codeBits, keyString, arrayData,

        // private instance variables
        mask, group, max,

        // private methods
        gcd, translate,

        // public methods
        encode, decode;

    // pseudo-constructor
    construct = function () {
        var i, mag, prev;

        // options
        pad = options.pad || '';
        dataBits = options.dataBits;
        codeBits = options.codeBits;
        keyString = options.keyString;
        arrayData = options.arrayData;

        // bitmasks
        mag = Math.max(dataBits, codeBits);
        prev = 0;
        mask = [];
        for (i = 0; i < mag; i += 1) {
            mask.push(prev);
            prev += prev + 1;
        }
        max = prev;

        // ouput code characters in multiples of this number
        group = dataBits / gcd(dataBits, codeBits);
    };

    // greatest common divisor
    gcd = function (a, b) {
        var t;
        while (b !== 0) {
            t = b;
            b = a % b;
            a = t;
        }
        return a;
    };

    // the re-coder
    translate = function (input, bitsIn, bitsOut, decoding) {
        var i, len, chr, byteIn,
            buffer, size, output,
            write;

        // append a byte to the output
        write = function (n) {
            if (!decoding) {
                output.push(keyString.charAt(n));
            } else if (arrayData) {
                output.push(n);
            } else {
                output.push(String.fromCharCode(n));
            }
        };

        buffer = 0;
        size = 0;
        output = [];

        len = input.length;
        for (i = 0; i < len; i += 1) {
            // the new size the buffer will be after adding these bits
            size += bitsIn;

            // read a character
            if (decoding) {
                // decode it
                chr = input.charAt(i);
                byteIn = keyString.indexOf(chr);
                if (chr === pad) {
                    break;
                } else if (byteIn < 0) {
                    throw 'the character "' + chr + '" is not a member of ' + keyString;
                }
            } else {
                if (arrayData) {
                    byteIn = input[i];
                } else {
                    byteIn = input.charCodeAt(i);
                }
                if ((byteIn | max) !== max) {
                    throw byteIn + " is outside the range 0-" + max;
                }
            }

            // shift the buffer to the left and add the new bits
            buffer = (buffer << bitsIn) | byteIn;

            // as long as there's enough in the buffer for another output...
            while (size >= bitsOut) {
                // the new size the buffer will be after an output
                size -= bitsOut;

                // output the part that lies to the left of that number of bits
                // by shifting the them to the right
                write(buffer >> size);

                // remove the bits we wrote from the buffer
                // by applying a mask with the new size
                buffer &= mask[size];
            }
        }

        // If we're encoding and there's input left over, pad the output.
        // Otherwise, leave the extra bits off, 'cause they themselves are padding
        if (!decoding && size > 0) {

            // flush the buffer
            write(buffer << (bitsOut - size));

            // add padding string for the remainder of the group
            while (output.length % group > 0) {
                output.push(pad);
            }
        }

        // string!
        return (arrayData && decoding) ? output : output.join('');
    };

    /**
     * Encode.  Input and output are strings.
     */
    encode = function (input) {
        return translate(input, dataBits, codeBits, false);
    };

    /**
     * Decode.  Input and output are strings.
     */
    decode = function (input) {
        return translate(input, codeBits, dataBits, true);
    };

    this.encode = encode;
    this.decode = decode;
    construct();
};

},{}],18:[function(_dereq_,module,exports){

var extend      = _dereq_("extend");
var query       = _dereq_("./query");
var failLogger  = _dereq_("./faillogger");
var Q           = _dereq_("q");

module.exports = createObjectsContext;

var nextContextId = 0;

function getInternalProperties(collectionName) {
    var properties = ["collectionName", "id", "internalId", "created", "updated", "permissions", "save", "saveAll", "remove", "grant", "revoke", "sysCreated", "sysUpdated", "sysPermissions"];
    if(collectionName == "users") {
        properties.push("username");
    }
    return properties;
}

function createObjectsContext(apiClient, files, collections) {
    var contextId = nextContextId++;
    var internalIds = 0;

    var prototype = {
        save: function() {
            return failOnUnsavedRelations(this)
                    .then(saveObject)
                    .then(savePermissionChanges)
                    .then(saveFileProperties)
                    .fail(failLogger.log);
        },
        saveAll: function() {
            return saveObjectsInGraph(this).fail(failLogger.log);
        },
        remove: function() {
            return removeObject(this).fail(failLogger.log);
        },
        refresh: function() {
            return refreshObject(this).fail(failLogger.log);
        },
        expand: function(options) {
            return expandObject(this, options).fail(failLogger.log);
        },
        grant: function(usernames, permissions) {
            if(typeof usernames === "string") {
                usernames = [usernames];
            }
            var internal = this.internalObject;
            usernames.forEach(function(username) {
                internal.grants.push({
                    username: username,
                    permissions: permissions
                });
            });
        },
        revoke: function(usernames, permissions) {
            if(typeof usernames === "string") {
                usernames = [usernames];
            }
            var internal = this.internalObject;
            usernames.forEach(function(username) {
                internal.revokes.push({
                    username: username,
                    permissions: permissions
                });
            });
        },
        grantPublic: function(permissions) {
            this.grant("*", permissions);
        },
        revokePublic: function(permissions) {
            this.revoke("*", permissions);
        },
        hasPermission: function(permission) {
            return this.permissions.indexOf(permission) != -1;
        }
    };

    return {
        create: createObject,
        createQuery: createQuery,
        getProperties: getProperties,
        createObject: createObject,
        getObjectStatus: getObjectStatus,
        getRelatedObjects: getRelatedObjects,
        findAll: findAll,
        find: find,
        search: search,
        sort: sortObjects,
        copy: copyValues
    };

    function createObject(collectionName, properties, factory) {
        var internal = createInternalObject(collectionName);
        var object = Object.create(prototype);
        Object.defineProperty(object, "id", { get: function() { return internal.id; }, enumerable:true });
        Object.defineProperty(object, "internalId", { writable: false, value: internal.internalId, enumerable:true });
        Object.defineProperty(object, "internalObject", { writable: false, value: internal, enumerable: false });
        Object.defineProperty(object, "collectionName", { get: function() { return internal.collectionName; }, enumerable:true });
        Object.defineProperty(object, "created", { get: function() { return new Date(internal.sysValues.sysCreated); }, enumerable:true });
        Object.defineProperty(object, "updated", { get: function() { return new Date(internal.sysValues.sysUpdated); }, enumerable:true });
        Object.defineProperty(object, "permissions", { get: function() { return internal.sysValues.sysPermissions; }, enumerable: true });
        if(collectionName == "users") {
            Object.defineProperty(object, "username", { get:function() { return internal.sysValues.sysUsername; }, enumerable:true });
        }

        properties = extend({}, collections.defaultValues(collectionName), properties);
        fillObjectWithValues(object, properties, factory || createObject);

        if(object.id !== null) {
            internal.status = "saved";
        }
        return object;
    }

    function fillObjectWithValues(object, properties, factory) {
        var internal = object.internalObject;
        var filteredProperties = {};
        if(typeof properties === "object") {
            var sysValues = internal.sysValues;
            internal.setId(properties.sysObjectId);
            Object.keys(properties).forEach(function(key) {
                var value = properties[key];
                if(key.indexOf("sys") === 0) {
                    sysValues[key] = value;
                } else if(typeof value.sysDatatype == "string") {
                    filteredProperties[key] = createPropertyWithDatatype(key, value, object, factory);
                    if(value.sysDatatype == "relation") {
                        internal.relations[key] = {
                            type: value.sysRelationType,
                            ids: (value.sysObjects || []).map(function(object) {
                                return object.sysObjectId || object;
                            })
                        }
                    }
                } else {
                    filteredProperties[key] = value;
                }
            });
        }
        extend(object, filteredProperties);
    }

    function createPropertyWithDatatype(key, value, object, factory) {
        switch(value.sysDatatype) {
            case "relation": return _createRelationProperty(value, factory);
            case "file": return files.create({
                filename: value.filename,
                url: files.urlForFile(object.collectionName, object.id, key, value.filename)
            });
        }
        return null;

        function _createRelationProperty(value, factory) {
            var results = [];
            if(typeof value.sysObjects !== "undefined") {
                results = value.sysObjects.map(function(object) {
                    if(typeof object === "string") {
                        return object
                    } else {
                        return factory(value.sysCollection, object, factory);
                    }
                });
            }
            if("single" === value.sysRelationType) {
                return results[0];
            } else {
                return results;
            }
        }
    }

    function createInternalObject(collectionName) {
        var object = {
            id: null,
            internalId: createInternalId(),
            collectionName: collectionName,
            sysValues: {},
            initialValues: {},
            created: new Date(),
            updated: new Date(),
            status: "new",
            grants: [],
            revokes: [],
            relations: {},
            setId: function(id) { if(id) { this.id = id; }},
            resetPermissions: function() { this.grants = []; this.revokes = []; }
        }
        return object;
    }

    function refreshObject(object) {
        var defer = Q.defer();
        var internal = object.internalObject;
        var internalProperties = getInternalProperties(object.collectionName);
        if(internal.status === "new") {
            defer.resolve(object);
        } else {
            findById(object.collectionName, object.id).then(function(updated) {
                Object.keys(updated)
                    .filter(function(key) {
                        return internalProperties.indexOf(key) == -1
                    })
                    .forEach(function(key) {
                        object[key] = updated[key];
                    });
                defer.resolve(object);
            });
        }
        return defer.promise;
    }

    function saveObject(object, defer) {
        var internal = object.internalObject
        var defer = typeof defer == "object" ? defer : Q.defer();
        if(internal.status === "saving") {
            setTimeout(function() {
                saveObject(object, defer);
            }, 100);
            return defer.promise;
        }

        var url, method, objectData, formData;
        if(object.id == null) {
            url = apiClient.url("/objects/:collection", {collection: object.collectionName});
            method = "post";
            formData = getDataForSaving(object)
            objectData = getPropertiesForSaving(object);
        } else {
            url = apiClient.url("/objects/:collection/:id", {collection: object.collectionName, id: object.id});
            method = "put";
            objectData = getPropertiesForSaving(object);
        }
        internal.status = "saving";
        apiClient.request(method, url, formData || objectData)
                 .progress(function(progress) {
                     if(typeof formData != "undefined") {
                         defer.notify(progress);
                     }
                 })
                 .then(function(response) {
                     internal.setId(response.sysObjectId);
                     internal.status = "saved";
                     applyRelationChanges(object, objectData);
                     if(typeof FormData != "undefined" && formData instanceof FormData) {
                         markFilesSaved(object);
                     }
                     defer.resolve(object);
                 })
                 .fail(function(error) {
                     internal.status = "error";
                     defer.reject(error);
                 });
        return defer.promise;
    }

    function removeObject(object) {
        var defer = Q.defer();
        var url = apiClient.url("/objects/:collection/:id", {collection: object.collectionName, id: object.id});
        apiClient.request("DELETE", url)
                 .then(function(response) {
                     defer.resolve();
                 })
                 .fail(function(error) {
                     defer.reject(error);
                 });
        return defer.promise;
    }

    function expandObject(object, options) {
        if(isUnsaved(object)) {
            throw new Error("Error calling expand() on unsaved object.")
        }
        var depth = 1;
        if(typeof options === "number") {
            depth = options;
        }
        return findById(object.collectionName, object.id, {expand:depth}).then(function(expanded) {
            var internal = object.internalObject;
            var relations = Object.keys(internal.relations);
            relations.forEach(function(relation) {
                object[relation] = expanded[relation];
            });
            return Q.resolve(object);
        });
    }

    function markFilesSaved(object) {
        var fileProperties = getFileProperties(object);
        return Object.keys(fileProperties).map(function(key) {
            var file = fileProperties[key];
            var url  = files.urlForFile(object.collectionName, object.id, key, file.filename);
            files.status(file, "saved");
            files.setUrl(file, url);
        });
    }

    function saveFileProperties(object) {
        var fileProperties = getFileProperties(object);
        var keys = Object.keys(fileProperties);
        var promises = [];
        var progress = [];
        keys.forEach(function(key) {
            var file = fileProperties[key];
            if(files.status(file) !== "saved") {
                var promise = files.saveFile(object.collectionName, object.id, key, file)
                promises.push(promise);
                progress.push(0);
            }
        });

        var defer = Q.defer();
        Q.all(promises)
            .progress(function(item) {
                progress[item.index] = item.value.percent;
                var percent = progress.reduce(function(previous, current, index, array) {
                    return previous + (current / array.length);
                }, 0);
                defer.notify({percent: Math.round(percent)});
            })
            .then(function() {
                defer.resolve(object);
            })
            .fail(function(error) {
                defer.reject(error);
            });
        return defer.promise;
    }

    function savePermissionChanges(object) {
        var defer = Q.defer();
        var url = apiClient.url("/permissions");
        var internal = object.internalObject;
        var grants = internal.grants.map(_convertChange);
        var revokes = internal.revokes.map(_convertChange);
        internal.resetPermissions();

        if(grants.length + revokes.length === 0) {
            defer.resolve(object);
        } else {
            var data = {grants:grants, revokes:revokes};
            apiClient.request("POST", url, data)
                     .then(function(response) {
                         defer.resolve(object);
                     })
                     .fail(function(error) {
                         defer.reject(error);
                     });
        }
        return defer.promise;

        function _convertChange(change) {
            return {
                sysObjectId: object.id,
                username: change.username,
                permissions: change.permissions
            }
        }
    }

    function failOnUnsavedRelations(object) {
        detectUndeclaredRelations(object);
        var related = getRelatedObjects(object);
        if(related.some(isUnsaved)) {
            throw new Error("Error saving object. Found unsaved related objects. Save related objects first or consider using saveAll().")
        } else {
            var defer = Q.defer();
            defer.fulfill(object);
            return defer.promise;
        }
    }

    function saveObjectsInGraph(rootObject) {
        var objects = getObjectsInGraph(rootObject);
        var unsavedInbound = objects.inbound.filter(isUnsaved);
        var outbound = objects.outbound;
        var remaining = objects.inbound.filter(function(o) { return !isUnsaved(o) });

        if(0 == outbound.length + unsavedInbound.length + remaining.length) {
            return rootObject.save();
        } else {
            return _saveUnsavedInbound().then(_saveOutbound).then(_saveRemaining);
        }

        function _saveUnsavedInbound() {
            return Q.all(unsavedInbound.map(saveObject));
        }
        function _saveOutbound() {
            return Q.all(outbound.map(saveObject));
        }
        function _saveRemaining() {
            return Q.all(remaining.map(saveObject));
        }
    }

    function getObjectsInGraph(rootObject) {
        var queue = [rootObject];
        var all      = {};
        var inbound  = {};
        var outbound = {};

        while(queue.length > 0) {
            var object = queue.shift();
            detectUndeclaredRelations(object);
            if(all[object.internalId] == null) {
                all[object.internalId] = object;
                var allRelated = getRelatedObjects(object).filter(function(a) { return typeof a == "object" });
                allRelated.forEach(function(related) {
                    inbound[related.internalId] = related;
                });
                if(allRelated.length > 0) {
                    outbound[object.internalId] = object;
                    queue = queue.concat(allRelated);
                }
            }
        }

        return {
            all:      _mapToArray(all),
            inbound:  _mapToArray(inbound),
            outbound: _mapToArray(outbound)
        }

        function _mapToArray(map) {
            return Object.keys(map).map(_objectForKey);
        }

        function _objectForKey(key) {
            return all[key];
        }
    }

    function getRelatedObjects(object) {
        var related = [];
        var internal = object.internalObject;
        Object.keys(internal.relations).forEach(function(key) {
            var property = object[key];
            if(property == null) {
                return;
            }
            related = related.concat(property);
        });
        return related;
    }

    function getRelationChanges(object, propertyName) {
        var internal = object.internalObject;
        var relation = internal.relations[propertyName];
        var changes = {
            additions: [],
            removals: []
        }

        if(relation) {
            var property = object[propertyName];
            var objects = [];
            if(property) {
                objects = (relation.type == "array") ? property : [property];
            }
            var currentIds = objects.map(function(o) { return o.id || o; })
                                    .filter(function(id) { return typeof id === "string"; });
            changes.additions = currentIds.filter(function(id) {
                return id != null && relation.ids.indexOf(id) == -1;
            });
            changes.removals = relation.ids.filter(function(id) {
                return id != null && currentIds.indexOf(id) == -1;
            });
        }

        return changes;
    }

    function applyRelationChanges(object, savedData) {
        var internal = object.internalObject;
        Object.keys(internal.relations).forEach(function(key) {
            var relation = internal.relations[key];
            var changes = savedData[key].sysRelationChanges;
            relation.ids = relation.ids
                .concat(changes.additions)
                .filter(function(id) {
                    return changes.removals.indexOf(id) == -1;
                });
        });
    }

    function detectUndeclaredRelations(object) {
        var collection = collections.get(object.collectionName);
        var relations = object.internalObject.relations;

        var properties = getProperties(object);
        Object.keys(properties).forEach(function(key) {
            if(relations[key]) {
                return;
            }
            var property = properties[key]
            var relationType = "";
            if(property !== null && typeof property === "object") {
                if(typeof property.length === "undefined") {
                    if(typeof property.collectionName === "string") {
                        relationType = "single"
                    }
                } else {
                    property.some(function(item) {
                        if(typeof item.collectionName === "string") {
                            relationType = "array"
                            return true;
                        }
                        return false;
                    })
                }
            }
            if(relationType !== "") {
                relations[key] = { type:relationType, ids:[] };
            }
        });
    }

    function getPropertyNames(object) {
        var internalProperties = getInternalProperties(object.collectionName);
        var keys = Object.keys(object);
        return keys.filter(function(key) {
            return internalProperties.indexOf(key) == -1;
        });
    }

    function getProperties(object) {
        if(!isObject(object)) { return {}; }
        var data = {};
        getPropertyNames(object).forEach(function(key) {
            if(/^[a-zA-Z]/.test(key)) {
                data[key] = object[key];
            }
        });
        var sysValues = object.internalObject.sysValues;
        var internalProperties = getInternalProperties(object.collectionName);
        Object.keys(sysValues).forEach(function(key) {
            if(internalProperties.indexOf(key) == -1) {
                data[key] = sysValues[key];
            }
        });
        return data;
    }

    function getDataForSaving(object) {
        var properties = getPropertiesForSaving(object);
        var fileProperties = getFileProperties(object);
        var hasFiles = false;
        var formData = apiClient.formData();
        Object.keys(fileProperties).forEach(function(key) {
            var file = fileProperties[key];
            var nativeFile = files.nativeFile(file);
            if(nativeFile && files.status(file) !== "saved") {
                hasFiles = true;
                formData.append(key, nativeFile);
            }
        });
        if(hasFiles) {
            formData.append("sysObjectData", JSON.stringify(properties));
            return formData;
        } else {
            return properties;
        }
    }

    function getPropertiesForSaving(object) {
        var internal = object.internalObject;
        var properties = getProperties(object);
        Object.keys(properties).forEach(function(key) {
            var property = properties[key];
            if(files.isFile(property)) {
                properties[key] = {
                    sysDatatype: "file",
                    filename: property.filename
                }
            } else if(typeof internal.relations[key] === "object") {
                properties[key] = {
                    sysRelationChanges: getRelationChanges(object, key)
                }
            }
        });
        return properties;
    }

    function getFileProperties(object) {
        var properties = getProperties(object);
        var fileProperties = {};
        Object.keys(properties).forEach(function(key) {
            var property = properties[key];
            if(files.isFile(property)) {
                fileProperties[key] = property;
            }
        });
        return fileProperties;
    }

    function createInternalId() {
        var id = "internal-id-" + contextId + "-" + internalIds;
        internalIds++;
        return id;
    }

    function queryParametersFromQueryOptions(options) {
        if(!options) { return; }
        var parameters = {};
        if(typeof options.expand === "number") {
            parameters.expanddepth = options.expand;
        } else if(options.expand === true) {
            parameters.expanddepth = 1;
        }
        return parameters;
    }

    function findAll(collectionName, options) {
        var url = apiClient.url("/objects/:collection",
                                {collection: collectionName},
                                queryParametersFromQueryOptions(options));
        return sendFindRequest(url, collectionName, options);
    }

    function find(collectionName) {
        if(arguments.length < 2) { return; }
        var a1 = arguments[1];
        var a2 = arguments[2];
        if(typeof a1 === "string" && a1.indexOf("=") == -1 && a1.indexOf(" ") == -1) {
            return findById(collectionName, a1, a2);
        } else if(typeof a1 === "string") {
            return findByQueryString(collectionName, a1, a2);
        } else if(typeof a1 === "object" && typeof a1.queryString === "function") {
            return findByQueryObject(collectionName, a1, a2);
        } else if(typeof a1 === "object") {
            return findByPropertyValues(collectionName, a1, a2);
        } else if(typeof a1 === "function") {
            return findByQueryFunction(collectionName, a1, a2);
        }
    }

    function findById(collectionName, id, options) {
        var url = apiClient.url("/objects/:collection/:id",
                                {collection: collectionName, id: id},
                                queryParametersFromQueryOptions(options));

        return sendFindRequest(url, collectionName, options);
    }

    function findByQueryString(collectionName, queryString, options) {
        var url = apiClient.url("/objects/:collection?filter=:queryString",
                                {collection: collectionName, queryString: queryString},
                                queryParametersFromQueryOptions(options));
        return sendFindRequest(url, collectionName, options);
    }

    function findByQueryObject(collectionName, queryObject, options) {
        return findByQueryString(collectionName, queryObject.queryString(), options);
    }

    function findByQueryFunction(collectionName, queryFunction, options) {
        var queryObject = createQuery();
        queryFunction(queryObject);
        return findByQueryString(collectionName, queryObject.queryString(), options);
    }

    function findByPropertyValues(collectionName, propertyValues, options) {
        return findByQueryFunction(collectionName, function(query) {
            Object.keys(propertyValues).forEach(function(property) {
                var value = propertyValues[property];
                if(typeof value === "object" && typeof value.id === "string") {
                    query.relation(property).has(value);
                } else {
                    query.string(property).equals(value);
                }
            });
        }, options);
    }

    function search(collectionName) {
        var propertyValues = arguments[1];
        var options = arguments[2];
        if(arguments.length >= 3 && typeof arguments[1] === "string") {
            propertyValues = {};
            var searchString = arguments[1]
            Array.prototype.forEach.call(arguments[2], function(property) {
                propertyValues[property] = searchString;
            });
            if(arguments.length == 4) {
                options = arguments[3];
            }
        }
        return find(collectionName, function(query) {
            query.operator("or");
            Object.keys(propertyValues).forEach(function(property) {
                var value = propertyValues[property];
                query.string(property).contains(value);
            });
        }, options);
    }

    function sendFindRequest(url, collectionName, options) {
        var factory = createObject;
        if(options && options.factory) {
            factory = options.factory;
        } else if(options && options.plain) {
            factory = function(collectionName, properties, factory) {
                return properties;
            }
        }
        var defer = Q.defer();
        apiClient.request("get", url)
                 .then(function(result) {
                     if(Array.isArray(result.objects)) {
                         var objects = result.objects.map(function(properties) {
                             return factory(collectionName, properties, factory);
                         });
                         defer.resolve(objects);
                     } else {
                         defer.resolve(factory(collectionName, result, factory));
                     }
                 })
                 .fail(function(error) {
                     defer.reject(error);
                 });
        return defer.promise;
    }

    function createQuery(options) {
        return query(options);
    }

    function getObjectStatus(object) {
        var internal = object.internalObject;
        return internal ? internal.status : undefined;
    }

    function isUnsaved(object) {
        return getObjectStatus(object) === "new";
    }

    function isObject(object) {
        return object !== undefined && object !== null;
    }

    function copyValues(from, to) {
        if(from == null || to == null) {
            return;
        }
        var internalProperties = getInternalProperties(from.collectionName);
        Object.keys(from)
              .filter(function(key) {
                  return internalProperties.indexOf(key) == -1;
              })
              .forEach(function(key) {
                  to[key] = from[key];
              });
        Object.keys(from.internalObject.sysValues)
              .forEach(function(key) {
                  to.internalObject.sysValues[key] = from.internalObject.sysValues[key];
              });
    }

    function sortObjects(objects, order) {
        order = order || ""
        var dir = 1;
        var key = order;
        if(order.indexOf("-") == 0) {
            dir = -1;
            key = order.substr(1);
        }
        if(typeof objects.sort == "function") {
            objects.sort(function(o1, o2) {
                var d1 = o1[key];
                var d2 = o2[key];
                if(typeof d1 == "undefined") { d1 = 0; }
                if(typeof d2 == "undefined") { d2 = 0; }
                if(d1.getTime) { d1 = d1.getTime(); }
                if(d2.getTime) { d2 = d2.getTime(); }

                if(d1 > d2) { return dir; }
                if(d1 < d2) { return -dir; }
                return 0;
            });
        }
    }
}

},{"./faillogger":11,"./query":19,"extend":1,"q":4}],19:[function(_dereq_,module,exports){

module.exports = function(options) {

    var operator = "and";
    var predicates = [];

    init();
    return {
        queryString: queryString,
        string: createStringPredicate,
        relation: createRelationPredicate,
        operator: function(o) { operator = o; }
    };

    function init() {
        if(typeof options === "string") {
            addPredicate(options);
        }
    }

    function addPredicate(predicate) {
        predicates.push(predicate);
    }

    function createStringPredicate(property) {
        return {
            equals: function(value) {
                addPredicate(format("$='$'", property, value));
            },
            contains: function(value) {
                addPredicate(format("$ like '%$%'", property, value));
            }
        }
    }

    function createRelationPredicate(property) {
        return {
            has: function(objectsOrIds) {
                var ids = _getQuotedIds(objectsOrIds);
                addPredicate(format("$ has ($)", property, ids.join(",")));
            }
        }
        function _getQuotedIds(objectsOrIds) {
            return [].concat(objectsOrIds).map(function(item) {
                return "'" + (item.id || item) + "'";
            });
        }
    }

    function queryString() {
        return predicates.join(format(" $ ", operator));
    }

    function format(template) {
        var parameters = Array.prototype.slice.call(arguments, 1);
        var result = template;
        parameters.forEach(function(parameter) {
            result = result.replace("$", parameter);
        });
        return result;
    }

};

},{}],20:[function(_dereq_,module,exports){


module.exports = createRequestContext;

function createRequestContext(apiClient) {
    return request;

    function request(method, url, data) {
        url = apiClient.url("/server" + url);
        return apiClient.request(method, url, data);
    }
}

},{}],21:[function(_dereq_,module,exports){

var Q  = _dereq_("q");
var WS = _dereq_("ws");

module.exports = createSocket;

function createSocket(apiClient) {
    var queue = [];
    var realtimeSessionPromise = null;
    var realtimeSessionId = "";
    var webSocket = null;
    var connectionIntervalId = null;
    var status = "disconnected";
    var handlers = {
        open: [],
        message: [],
        error: [],
        close: [],
        status: []
    };

    return {
        connect: connect,
        disconnect: disconnect,
        status: function() { return status },
        send: send,
        on: on
    }

    function send(packet) {
        if(typeof packet == "object") {
            packet = JSON.stringify(packet);
        }
        if(webSocket && webSocket.readyState == 1) {
            sendQueue();
            webSocket.send(packet);
        } else {
            queue.push(packet);
            connect();
        }
    }

    function sendQueue() {
        while(queue.length > 0) {
            if(webSocket && webSocket.readyState == 1) {
                var packet = queue.shift();
                webSocket.send(packet);
            } else {
                connect();
                break;
            }
        }
    }

    function on(event, handler) {
        handlers[event].push(handler);
    }

    function disconnect() {
        clearInterval(connectionIntervalId);
        webSocket && webSocket.close();
        realtimeSessionPromise = null;
    }

    function connect() {
        if(!realtimeSessionPromise) {
            connectSession();
        }
        if(!connectionIntervalId) {
            connectionIntervalId = setInterval(function() {
                if(!webSocket || webSocket.readyState > 1) {
                    setStatus("connecting");
                    realtimeSessionPromise.then(connectSocket);
                }
            }, 100);
        }
    }

    function connectSession() {
        setStatus("connecting");
        var defer = Q.defer();
        realtimeSessionPromise = defer.promise;
        var url = apiClient.url("/messaging/realtime/sessions", {}, {unique: (Math.random() * Date.now()).toString(16)});
        apiClient.request("post", url, {})
                 .then(function(response) {
                     realtimeSessionId = response.realtimeSessionId;
                     defer.resolve();
                 })
                 .fail(function(error) {
                     notifyHandlers("error", {error:error});
                 });
        return realtimeSessionPromise;
    }

    function connectSocket() {
        var url = apiClient.url("/messaging/realtime", {}, {rsession: realtimeSessionId});
        url = url.replace("http", "ws");
        webSocket = createWebSocket(url);
        webSocket.onopen = handleSocketOpen;
        webSocket.onerror = handleSocketError;
        webSocket.onmessage = handleSocketMessage;
        webSocket.onclose = handleSocketClose;
    }

    function createWebSocket(url) {
        if(typeof WebSocket != "undefined") {
            return new WebSocket(url);
        } else if(typeof WS != "undefined") {
            return new WS(url);
        }
    }

    function handleSocketOpen(event) {
        notifyHandlers("open", event);
        setStatus("connected");
        sendQueue();
    }

    function handleSocketError(event) {
        notifyHandlers("error", event);
    }

    function handleSocketMessage(event) {
        notifyHandlers("message", event);
    }

    function handleSocketClose(event) {
        notifyHandlers("close", event);
        setStatus("disconnected");
    }

    function notifyHandlers(eventName, event) {
        handlers[eventName].forEach(function(handler) {
            handler(event);
        });
    }

    function setStatus(newStatus) {
        var oldStatus = status;
        status = newStatus;
        if(newStatus != oldStatus) {
            notifyHandlers("status", {
                type: "status",
                status: status
            });
        }
    }

}

},{"q":4,"ws":6}],22:[function(_dereq_,module,exports){

var extend    = _dereq_("extend");
var Q         = _dereq_("q");

module.exports = createUsersContext;

var internalProperties = ["id", "username", "save"];

function createUsersContext(apiClient, objects, hub) {

    var currentUser = null;

    init();
    return {
        restoreSession: restoreSession,
        signup: signup,
        login: login,
        logout: logout,
        currentUser: function() { return currentUser; }
    };

    function init() {
        restoreSession();
    }

    function createUser(username, properties) {
        var allProperties = extend({}, properties, {sysUsername:username});
        var user = objects.create("users", allProperties);
        return user;
    }

    function signup(username, password, arg3, arg4) {
        var defer = Q.defer();
        var properties = {};
        var login = true;
        if(typeof arg3 == "boolean") {
            login = arg3;
        }
        if(typeof arg3 == "object") {
            properties = arg3;
        } else if(typeof arg4 == "object") {
            properties = arg4;
        }
        var url = apiClient.url("/users", {}, {login:login});
        var data = extend({sysUsername:username, sysPassword:password}, properties);
        apiClient.request("post", url, data)
                 .then(function(result) {
                     var user = createUser(username, result.user);
                     if(login) {
                         user = handleSignupOrLoginSuccess(username, result);
                     }
                     defer.resolve(user);
                     hub.pub("users.signup", {user: currentUser});
                 })
                 .fail(function(error) {
                     defer.reject(error);
                 });
        return defer.promise;
    }

    function login(username, password) {
        var defer = Q.defer();
        var url = apiClient.url("/sessions");
        apiClient.request("post", url, {sysUsername:username, sysPassword:password})
                 .then(function(result) {
                     handleSignupOrLoginSuccess(username, result);
                     defer.resolve(currentUser);
                     hub.pub("users.login", {user: currentUser});
                 })
                 .fail(function(error) {
                     defer.reject(error);
                 });
        return defer.promise;
    }

    function handleSignupOrLoginSuccess(username, result) {
        var id = result.user ? result.user.sysObjectId : null;
        storeSession(result.sysSessionId, username, id);
        currentUser = createUser(username, result.user);
        return currentUser;
    }

    function logout() {
        currentUser = null;
        apiClient.sessionId(null);
        if(typeof localStorage != "undefined") {
            localStorage.removeItem("appstax_session_" + apiClient.appKey());
        }
        hub.pub("users.logout");
    }

    function storeSession(sessionId, username, id) {
        apiClient.sessionId(sessionId);
        if(typeof localStorage != "undefined") {
            localStorage.setItem("appstax_session_" + apiClient.appKey(), JSON.stringify({
                username: username,
                sessionId: sessionId,
                userId: id
            }));
        }
    }

    function restoreSession() {
        if(typeof localStorage == "undefined") {
            return;
        }
        var sessionData = localStorage.getItem("appstax_session_" + apiClient.appKey());
        if(sessionData) {
            var session = JSON.parse(sessionData);
            apiClient.sessionId(session.sessionId);
            currentUser = createUser(session.username,
                                     {sysObjectId:session.userId});
        }
    }

    function getPropertyNames(user) {
        var keys = Object.keys(user);
        internalProperties.forEach(function(internal) {
            var index = keys.indexOf(internal);
            if(index >= 0) {
                keys.splice(index, 1);
            }
        });
        return keys;
    }

    function getProperties(user) {
        var data = {};
        getPropertyNames(user).forEach(function(key) {
            data[key] = user[key];
        });
        return data;
    }
}


},{"extend":1,"q":4}]},{},[12])
(12)
});