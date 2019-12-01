// ==UserScript==
// @name         musescore-downloader
// @namespace    https://www.xmader.com/
// @homepageURL  https://github.com/Xmader/musescore-downloader/
// @supportURL   https://github.com/Xmader/musescore-downloader/issues
// @version      0.4.0
// @description  download sheet music from musescore.com for free, no login or Musescore Pro required | 免登录、免 Musescore Pro，免费下载 musescore.com 上的曲谱
// @author       Xmader
// @match        https://musescore.com/*/*
// @license      MIT
// @copyright    Copyright (c) 2019 Xmader
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    function __awaiter(thisArg, _arguments, P, generator) {
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    const waitForDocumentLoaded = () => {
        if (document.readyState !== "complete") {
            return new Promise(resolve => {
                document.addEventListener("readystatechange", () => {
                    if (document.readyState == "complete") {
                        resolve();
                    }
                }, { once: true });
            });
        }
        else {
            return Promise.resolve();
        }
    };

    var global$1 = (typeof global !== "undefined" ? global :
                typeof self !== "undefined" ? self :
                typeof window !== "undefined" ? window : {});

    const PDFWorker = function () { 
    (function () {

        function __awaiter(thisArg, _arguments, P, generator) {
            return new (P || (P = Promise))(function (resolve, reject) {
                function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
                function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
                function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
                step((generator = generator.apply(thisArg, _arguments || [])).next());
            });
        }

        var global$1$1 = (typeof global$1 !== "undefined" ? global$1 :
                    typeof self !== "undefined" ? self :
                    typeof window !== "undefined" ? window : {});

        var lookup = [];
        var revLookup = [];
        var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array;
        var inited = false;
        function init () {
          inited = true;
          var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
          for (var i = 0, len = code.length; i < len; ++i) {
            lookup[i] = code[i];
            revLookup[code.charCodeAt(i)] = i;
          }

          revLookup['-'.charCodeAt(0)] = 62;
          revLookup['_'.charCodeAt(0)] = 63;
        }

        function toByteArray (b64) {
          if (!inited) {
            init();
          }
          var i, j, l, tmp, placeHolders, arr;
          var len = b64.length;

          if (len % 4 > 0) {
            throw new Error('Invalid string. Length must be a multiple of 4')
          }

          // the number of equal signs (place holders)
          // if there are two placeholders, than the two characters before it
          // represent one byte
          // if there is only one, then the three characters before it represent 2 bytes
          // this is just a cheap hack to not do indexOf twice
          placeHolders = b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0;

          // base64 is 4/3 + up to two characters of the original data
          arr = new Arr(len * 3 / 4 - placeHolders);

          // if there are placeholders, only get up to the last complete 4 chars
          l = placeHolders > 0 ? len - 4 : len;

          var L = 0;

          for (i = 0, j = 0; i < l; i += 4, j += 3) {
            tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)];
            arr[L++] = (tmp >> 16) & 0xFF;
            arr[L++] = (tmp >> 8) & 0xFF;
            arr[L++] = tmp & 0xFF;
          }

          if (placeHolders === 2) {
            tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4);
            arr[L++] = tmp & 0xFF;
          } else if (placeHolders === 1) {
            tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2);
            arr[L++] = (tmp >> 8) & 0xFF;
            arr[L++] = tmp & 0xFF;
          }

          return arr
        }

        function tripletToBase64 (num) {
          return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]
        }

        function encodeChunk (uint8, start, end) {
          var tmp;
          var output = [];
          for (var i = start; i < end; i += 3) {
            tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2]);
            output.push(tripletToBase64(tmp));
          }
          return output.join('')
        }

        function fromByteArray (uint8) {
          if (!inited) {
            init();
          }
          var tmp;
          var len = uint8.length;
          var extraBytes = len % 3; // if we have 1 byte left, pad 2 bytes
          var output = '';
          var parts = [];
          var maxChunkLength = 16383; // must be multiple of 3

          // go through the array every three bytes, we'll deal with trailing stuff later
          for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
            parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)));
          }

          // pad the end with zeros, but make sure to not forget the extra bytes
          if (extraBytes === 1) {
            tmp = uint8[len - 1];
            output += lookup[tmp >> 2];
            output += lookup[(tmp << 4) & 0x3F];
            output += '==';
          } else if (extraBytes === 2) {
            tmp = (uint8[len - 2] << 8) + (uint8[len - 1]);
            output += lookup[tmp >> 10];
            output += lookup[(tmp >> 4) & 0x3F];
            output += lookup[(tmp << 2) & 0x3F];
            output += '=';
          }

          parts.push(output);

          return parts.join('')
        }

        function read (buffer, offset, isLE, mLen, nBytes) {
          var e, m;
          var eLen = nBytes * 8 - mLen - 1;
          var eMax = (1 << eLen) - 1;
          var eBias = eMax >> 1;
          var nBits = -7;
          var i = isLE ? (nBytes - 1) : 0;
          var d = isLE ? -1 : 1;
          var s = buffer[offset + i];

          i += d;

          e = s & ((1 << (-nBits)) - 1);
          s >>= (-nBits);
          nBits += eLen;
          for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

          m = e & ((1 << (-nBits)) - 1);
          e >>= (-nBits);
          nBits += mLen;
          for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

          if (e === 0) {
            e = 1 - eBias;
          } else if (e === eMax) {
            return m ? NaN : ((s ? -1 : 1) * Infinity)
          } else {
            m = m + Math.pow(2, mLen);
            e = e - eBias;
          }
          return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
        }

        function write (buffer, value, offset, isLE, mLen, nBytes) {
          var e, m, c;
          var eLen = nBytes * 8 - mLen - 1;
          var eMax = (1 << eLen) - 1;
          var eBias = eMax >> 1;
          var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0);
          var i = isLE ? 0 : (nBytes - 1);
          var d = isLE ? 1 : -1;
          var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

          value = Math.abs(value);

          if (isNaN(value) || value === Infinity) {
            m = isNaN(value) ? 1 : 0;
            e = eMax;
          } else {
            e = Math.floor(Math.log(value) / Math.LN2);
            if (value * (c = Math.pow(2, -e)) < 1) {
              e--;
              c *= 2;
            }
            if (e + eBias >= 1) {
              value += rt / c;
            } else {
              value += rt * Math.pow(2, 1 - eBias);
            }
            if (value * c >= 2) {
              e++;
              c /= 2;
            }

            if (e + eBias >= eMax) {
              m = 0;
              e = eMax;
            } else if (e + eBias >= 1) {
              m = (value * c - 1) * Math.pow(2, mLen);
              e = e + eBias;
            } else {
              m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
              e = 0;
            }
          }

          for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

          e = (e << mLen) | m;
          eLen += mLen;
          for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

          buffer[offset + i - d] |= s * 128;
        }

        var toString = {}.toString;

        var isArray = Array.isArray || function (arr) {
          return toString.call(arr) == '[object Array]';
        };

        var INSPECT_MAX_BYTES = 50;

        /**
         * If `Buffer.TYPED_ARRAY_SUPPORT`:
         *   === true    Use Uint8Array implementation (fastest)
         *   === false   Use Object implementation (most compatible, even IE6)
         *
         * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
         * Opera 11.6+, iOS 4.2+.
         *
         * Due to various browser bugs, sometimes the Object implementation will be used even
         * when the browser supports typed arrays.
         *
         * Note:
         *
         *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
         *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
         *
         *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
         *
         *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
         *     incorrect length in some situations.

         * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
         * get the Object implementation, which is slower but behaves correctly.
         */
        Buffer.TYPED_ARRAY_SUPPORT = global$1$1.TYPED_ARRAY_SUPPORT !== undefined
          ? global$1$1.TYPED_ARRAY_SUPPORT
          : true;

        function kMaxLength () {
          return Buffer.TYPED_ARRAY_SUPPORT
            ? 0x7fffffff
            : 0x3fffffff
        }

        function createBuffer (that, length) {
          if (kMaxLength() < length) {
            throw new RangeError('Invalid typed array length')
          }
          if (Buffer.TYPED_ARRAY_SUPPORT) {
            // Return an augmented `Uint8Array` instance, for best performance
            that = new Uint8Array(length);
            that.__proto__ = Buffer.prototype;
          } else {
            // Fallback: Return an object instance of the Buffer class
            if (that === null) {
              that = new Buffer(length);
            }
            that.length = length;
          }

          return that
        }

        /**
         * The Buffer constructor returns instances of `Uint8Array` that have their
         * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
         * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
         * and the `Uint8Array` methods. Square bracket notation works as expected -- it
         * returns a single octet.
         *
         * The `Uint8Array` prototype remains unmodified.
         */

        function Buffer (arg, encodingOrOffset, length) {
          if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {
            return new Buffer(arg, encodingOrOffset, length)
          }

          // Common case.
          if (typeof arg === 'number') {
            if (typeof encodingOrOffset === 'string') {
              throw new Error(
                'If encoding is specified then the first argument must be a string'
              )
            }
            return allocUnsafe(this, arg)
          }
          return from(this, arg, encodingOrOffset, length)
        }

        Buffer.poolSize = 8192; // not used by this implementation

        // TODO: Legacy, not needed anymore. Remove in next major version.
        Buffer._augment = function (arr) {
          arr.__proto__ = Buffer.prototype;
          return arr
        };

        function from (that, value, encodingOrOffset, length) {
          if (typeof value === 'number') {
            throw new TypeError('"value" argument must not be a number')
          }

          if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
            return fromArrayBuffer(that, value, encodingOrOffset, length)
          }

          if (typeof value === 'string') {
            return fromString(that, value, encodingOrOffset)
          }

          return fromObject(that, value)
        }

        /**
         * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
         * if value is a number.
         * Buffer.from(str[, encoding])
         * Buffer.from(array)
         * Buffer.from(buffer)
         * Buffer.from(arrayBuffer[, byteOffset[, length]])
         **/
        Buffer.from = function (value, encodingOrOffset, length) {
          return from(null, value, encodingOrOffset, length)
        };

        if (Buffer.TYPED_ARRAY_SUPPORT) {
          Buffer.prototype.__proto__ = Uint8Array.prototype;
          Buffer.__proto__ = Uint8Array;
        }

        function assertSize (size) {
          if (typeof size !== 'number') {
            throw new TypeError('"size" argument must be a number')
          } else if (size < 0) {
            throw new RangeError('"size" argument must not be negative')
          }
        }

        function alloc (that, size, fill, encoding) {
          assertSize(size);
          if (size <= 0) {
            return createBuffer(that, size)
          }
          if (fill !== undefined) {
            // Only pay attention to encoding if it's a string. This
            // prevents accidentally sending in a number that would
            // be interpretted as a start offset.
            return typeof encoding === 'string'
              ? createBuffer(that, size).fill(fill, encoding)
              : createBuffer(that, size).fill(fill)
          }
          return createBuffer(that, size)
        }

        /**
         * Creates a new filled Buffer instance.
         * alloc(size[, fill[, encoding]])
         **/
        Buffer.alloc = function (size, fill, encoding) {
          return alloc(null, size, fill, encoding)
        };

        function allocUnsafe (that, size) {
          assertSize(size);
          that = createBuffer(that, size < 0 ? 0 : checked(size) | 0);
          if (!Buffer.TYPED_ARRAY_SUPPORT) {
            for (var i = 0; i < size; ++i) {
              that[i] = 0;
            }
          }
          return that
        }

        /**
         * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
         * */
        Buffer.allocUnsafe = function (size) {
          return allocUnsafe(null, size)
        };
        /**
         * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
         */
        Buffer.allocUnsafeSlow = function (size) {
          return allocUnsafe(null, size)
        };

        function fromString (that, string, encoding) {
          if (typeof encoding !== 'string' || encoding === '') {
            encoding = 'utf8';
          }

          if (!Buffer.isEncoding(encoding)) {
            throw new TypeError('"encoding" must be a valid string encoding')
          }

          var length = byteLength(string, encoding) | 0;
          that = createBuffer(that, length);

          var actual = that.write(string, encoding);

          if (actual !== length) {
            // Writing a hex string, for example, that contains invalid characters will
            // cause everything after the first invalid character to be ignored. (e.g.
            // 'abxxcd' will be treated as 'ab')
            that = that.slice(0, actual);
          }

          return that
        }

        function fromArrayLike (that, array) {
          var length = array.length < 0 ? 0 : checked(array.length) | 0;
          that = createBuffer(that, length);
          for (var i = 0; i < length; i += 1) {
            that[i] = array[i] & 255;
          }
          return that
        }

        function fromArrayBuffer (that, array, byteOffset, length) {
          array.byteLength; // this throws if `array` is not a valid ArrayBuffer

          if (byteOffset < 0 || array.byteLength < byteOffset) {
            throw new RangeError('\'offset\' is out of bounds')
          }

          if (array.byteLength < byteOffset + (length || 0)) {
            throw new RangeError('\'length\' is out of bounds')
          }

          if (byteOffset === undefined && length === undefined) {
            array = new Uint8Array(array);
          } else if (length === undefined) {
            array = new Uint8Array(array, byteOffset);
          } else {
            array = new Uint8Array(array, byteOffset, length);
          }

          if (Buffer.TYPED_ARRAY_SUPPORT) {
            // Return an augmented `Uint8Array` instance, for best performance
            that = array;
            that.__proto__ = Buffer.prototype;
          } else {
            // Fallback: Return an object instance of the Buffer class
            that = fromArrayLike(that, array);
          }
          return that
        }

        function fromObject (that, obj) {
          if (internalIsBuffer(obj)) {
            var len = checked(obj.length) | 0;
            that = createBuffer(that, len);

            if (that.length === 0) {
              return that
            }

            obj.copy(that, 0, 0, len);
            return that
          }

          if (obj) {
            if ((typeof ArrayBuffer !== 'undefined' &&
                obj.buffer instanceof ArrayBuffer) || 'length' in obj) {
              if (typeof obj.length !== 'number' || isnan(obj.length)) {
                return createBuffer(that, 0)
              }
              return fromArrayLike(that, obj)
            }

            if (obj.type === 'Buffer' && isArray(obj.data)) {
              return fromArrayLike(that, obj.data)
            }
          }

          throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
        }

        function checked (length) {
          // Note: cannot use `length < kMaxLength()` here because that fails when
          // length is NaN (which is otherwise coerced to zero.)
          if (length >= kMaxLength()) {
            throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                                 'size: 0x' + kMaxLength().toString(16) + ' bytes')
          }
          return length | 0
        }
        Buffer.isBuffer = isBuffer;
        function internalIsBuffer (b) {
          return !!(b != null && b._isBuffer)
        }

        Buffer.compare = function compare (a, b) {
          if (!internalIsBuffer(a) || !internalIsBuffer(b)) {
            throw new TypeError('Arguments must be Buffers')
          }

          if (a === b) return 0

          var x = a.length;
          var y = b.length;

          for (var i = 0, len = Math.min(x, y); i < len; ++i) {
            if (a[i] !== b[i]) {
              x = a[i];
              y = b[i];
              break
            }
          }

          if (x < y) return -1
          if (y < x) return 1
          return 0
        };

        Buffer.isEncoding = function isEncoding (encoding) {
          switch (String(encoding).toLowerCase()) {
            case 'hex':
            case 'utf8':
            case 'utf-8':
            case 'ascii':
            case 'latin1':
            case 'binary':
            case 'base64':
            case 'ucs2':
            case 'ucs-2':
            case 'utf16le':
            case 'utf-16le':
              return true
            default:
              return false
          }
        };

        Buffer.concat = function concat (list, length) {
          if (!isArray(list)) {
            throw new TypeError('"list" argument must be an Array of Buffers')
          }

          if (list.length === 0) {
            return Buffer.alloc(0)
          }

          var i;
          if (length === undefined) {
            length = 0;
            for (i = 0; i < list.length; ++i) {
              length += list[i].length;
            }
          }

          var buffer = Buffer.allocUnsafe(length);
          var pos = 0;
          for (i = 0; i < list.length; ++i) {
            var buf = list[i];
            if (!internalIsBuffer(buf)) {
              throw new TypeError('"list" argument must be an Array of Buffers')
            }
            buf.copy(buffer, pos);
            pos += buf.length;
          }
          return buffer
        };

        function byteLength (string, encoding) {
          if (internalIsBuffer(string)) {
            return string.length
          }
          if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' &&
              (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
            return string.byteLength
          }
          if (typeof string !== 'string') {
            string = '' + string;
          }

          var len = string.length;
          if (len === 0) return 0

          // Use a for loop to avoid recursion
          var loweredCase = false;
          for (;;) {
            switch (encoding) {
              case 'ascii':
              case 'latin1':
              case 'binary':
                return len
              case 'utf8':
              case 'utf-8':
              case undefined:
                return utf8ToBytes(string).length
              case 'ucs2':
              case 'ucs-2':
              case 'utf16le':
              case 'utf-16le':
                return len * 2
              case 'hex':
                return len >>> 1
              case 'base64':
                return base64ToBytes(string).length
              default:
                if (loweredCase) return utf8ToBytes(string).length // assume utf8
                encoding = ('' + encoding).toLowerCase();
                loweredCase = true;
            }
          }
        }
        Buffer.byteLength = byteLength;

        function slowToString (encoding, start, end) {
          var loweredCase = false;

          // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
          // property of a typed array.

          // This behaves neither like String nor Uint8Array in that we set start/end
          // to their upper/lower bounds if the value passed is out of range.
          // undefined is handled specially as per ECMA-262 6th Edition,
          // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
          if (start === undefined || start < 0) {
            start = 0;
          }
          // Return early if start > this.length. Done here to prevent potential uint32
          // coercion fail below.
          if (start > this.length) {
            return ''
          }

          if (end === undefined || end > this.length) {
            end = this.length;
          }

          if (end <= 0) {
            return ''
          }

          // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
          end >>>= 0;
          start >>>= 0;

          if (end <= start) {
            return ''
          }

          if (!encoding) encoding = 'utf8';

          while (true) {
            switch (encoding) {
              case 'hex':
                return hexSlice(this, start, end)

              case 'utf8':
              case 'utf-8':
                return utf8Slice(this, start, end)

              case 'ascii':
                return asciiSlice(this, start, end)

              case 'latin1':
              case 'binary':
                return latin1Slice(this, start, end)

              case 'base64':
                return base64Slice(this, start, end)

              case 'ucs2':
              case 'ucs-2':
              case 'utf16le':
              case 'utf-16le':
                return utf16leSlice(this, start, end)

              default:
                if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
                encoding = (encoding + '').toLowerCase();
                loweredCase = true;
            }
          }
        }

        // The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
        // Buffer instances.
        Buffer.prototype._isBuffer = true;

        function swap (b, n, m) {
          var i = b[n];
          b[n] = b[m];
          b[m] = i;
        }

        Buffer.prototype.swap16 = function swap16 () {
          var len = this.length;
          if (len % 2 !== 0) {
            throw new RangeError('Buffer size must be a multiple of 16-bits')
          }
          for (var i = 0; i < len; i += 2) {
            swap(this, i, i + 1);
          }
          return this
        };

        Buffer.prototype.swap32 = function swap32 () {
          var len = this.length;
          if (len % 4 !== 0) {
            throw new RangeError('Buffer size must be a multiple of 32-bits')
          }
          for (var i = 0; i < len; i += 4) {
            swap(this, i, i + 3);
            swap(this, i + 1, i + 2);
          }
          return this
        };

        Buffer.prototype.swap64 = function swap64 () {
          var len = this.length;
          if (len % 8 !== 0) {
            throw new RangeError('Buffer size must be a multiple of 64-bits')
          }
          for (var i = 0; i < len; i += 8) {
            swap(this, i, i + 7);
            swap(this, i + 1, i + 6);
            swap(this, i + 2, i + 5);
            swap(this, i + 3, i + 4);
          }
          return this
        };

        Buffer.prototype.toString = function toString () {
          var length = this.length | 0;
          if (length === 0) return ''
          if (arguments.length === 0) return utf8Slice(this, 0, length)
          return slowToString.apply(this, arguments)
        };

        Buffer.prototype.equals = function equals (b) {
          if (!internalIsBuffer(b)) throw new TypeError('Argument must be a Buffer')
          if (this === b) return true
          return Buffer.compare(this, b) === 0
        };

        Buffer.prototype.inspect = function inspect () {
          var str = '';
          var max = INSPECT_MAX_BYTES;
          if (this.length > 0) {
            str = this.toString('hex', 0, max).match(/.{2}/g).join(' ');
            if (this.length > max) str += ' ... ';
          }
          return '<Buffer ' + str + '>'
        };

        Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
          if (!internalIsBuffer(target)) {
            throw new TypeError('Argument must be a Buffer')
          }

          if (start === undefined) {
            start = 0;
          }
          if (end === undefined) {
            end = target ? target.length : 0;
          }
          if (thisStart === undefined) {
            thisStart = 0;
          }
          if (thisEnd === undefined) {
            thisEnd = this.length;
          }

          if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
            throw new RangeError('out of range index')
          }

          if (thisStart >= thisEnd && start >= end) {
            return 0
          }
          if (thisStart >= thisEnd) {
            return -1
          }
          if (start >= end) {
            return 1
          }

          start >>>= 0;
          end >>>= 0;
          thisStart >>>= 0;
          thisEnd >>>= 0;

          if (this === target) return 0

          var x = thisEnd - thisStart;
          var y = end - start;
          var len = Math.min(x, y);

          var thisCopy = this.slice(thisStart, thisEnd);
          var targetCopy = target.slice(start, end);

          for (var i = 0; i < len; ++i) {
            if (thisCopy[i] !== targetCopy[i]) {
              x = thisCopy[i];
              y = targetCopy[i];
              break
            }
          }

          if (x < y) return -1
          if (y < x) return 1
          return 0
        };

        // Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
        // OR the last index of `val` in `buffer` at offset <= `byteOffset`.
        //
        // Arguments:
        // - buffer - a Buffer to search
        // - val - a string, Buffer, or number
        // - byteOffset - an index into `buffer`; will be clamped to an int32
        // - encoding - an optional encoding, relevant is val is a string
        // - dir - true for indexOf, false for lastIndexOf
        function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
          // Empty buffer means no match
          if (buffer.length === 0) return -1

          // Normalize byteOffset
          if (typeof byteOffset === 'string') {
            encoding = byteOffset;
            byteOffset = 0;
          } else if (byteOffset > 0x7fffffff) {
            byteOffset = 0x7fffffff;
          } else if (byteOffset < -0x80000000) {
            byteOffset = -0x80000000;
          }
          byteOffset = +byteOffset;  // Coerce to Number.
          if (isNaN(byteOffset)) {
            // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
            byteOffset = dir ? 0 : (buffer.length - 1);
          }

          // Normalize byteOffset: negative offsets start from the end of the buffer
          if (byteOffset < 0) byteOffset = buffer.length + byteOffset;
          if (byteOffset >= buffer.length) {
            if (dir) return -1
            else byteOffset = buffer.length - 1;
          } else if (byteOffset < 0) {
            if (dir) byteOffset = 0;
            else return -1
          }

          // Normalize val
          if (typeof val === 'string') {
            val = Buffer.from(val, encoding);
          }

          // Finally, search either indexOf (if dir is true) or lastIndexOf
          if (internalIsBuffer(val)) {
            // Special case: looking for empty string/buffer always fails
            if (val.length === 0) {
              return -1
            }
            return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
          } else if (typeof val === 'number') {
            val = val & 0xFF; // Search for a byte value [0-255]
            if (Buffer.TYPED_ARRAY_SUPPORT &&
                typeof Uint8Array.prototype.indexOf === 'function') {
              if (dir) {
                return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
              } else {
                return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
              }
            }
            return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
          }

          throw new TypeError('val must be string, number or Buffer')
        }

        function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
          var indexSize = 1;
          var arrLength = arr.length;
          var valLength = val.length;

          if (encoding !== undefined) {
            encoding = String(encoding).toLowerCase();
            if (encoding === 'ucs2' || encoding === 'ucs-2' ||
                encoding === 'utf16le' || encoding === 'utf-16le') {
              if (arr.length < 2 || val.length < 2) {
                return -1
              }
              indexSize = 2;
              arrLength /= 2;
              valLength /= 2;
              byteOffset /= 2;
            }
          }

          function read (buf, i) {
            if (indexSize === 1) {
              return buf[i]
            } else {
              return buf.readUInt16BE(i * indexSize)
            }
          }

          var i;
          if (dir) {
            var foundIndex = -1;
            for (i = byteOffset; i < arrLength; i++) {
              if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
                if (foundIndex === -1) foundIndex = i;
                if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
              } else {
                if (foundIndex !== -1) i -= i - foundIndex;
                foundIndex = -1;
              }
            }
          } else {
            if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength;
            for (i = byteOffset; i >= 0; i--) {
              var found = true;
              for (var j = 0; j < valLength; j++) {
                if (read(arr, i + j) !== read(val, j)) {
                  found = false;
                  break
                }
              }
              if (found) return i
            }
          }

          return -1
        }

        Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
          return this.indexOf(val, byteOffset, encoding) !== -1
        };

        Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
          return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
        };

        Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
          return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
        };

        function hexWrite (buf, string, offset, length) {
          offset = Number(offset) || 0;
          var remaining = buf.length - offset;
          if (!length) {
            length = remaining;
          } else {
            length = Number(length);
            if (length > remaining) {
              length = remaining;
            }
          }

          // must be an even number of digits
          var strLen = string.length;
          if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')

          if (length > strLen / 2) {
            length = strLen / 2;
          }
          for (var i = 0; i < length; ++i) {
            var parsed = parseInt(string.substr(i * 2, 2), 16);
            if (isNaN(parsed)) return i
            buf[offset + i] = parsed;
          }
          return i
        }

        function utf8Write (buf, string, offset, length) {
          return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
        }

        function asciiWrite (buf, string, offset, length) {
          return blitBuffer(asciiToBytes(string), buf, offset, length)
        }

        function latin1Write (buf, string, offset, length) {
          return asciiWrite(buf, string, offset, length)
        }

        function base64Write (buf, string, offset, length) {
          return blitBuffer(base64ToBytes(string), buf, offset, length)
        }

        function ucs2Write (buf, string, offset, length) {
          return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
        }

        Buffer.prototype.write = function write (string, offset, length, encoding) {
          // Buffer#write(string)
          if (offset === undefined) {
            encoding = 'utf8';
            length = this.length;
            offset = 0;
          // Buffer#write(string, encoding)
          } else if (length === undefined && typeof offset === 'string') {
            encoding = offset;
            length = this.length;
            offset = 0;
          // Buffer#write(string, offset[, length][, encoding])
          } else if (isFinite(offset)) {
            offset = offset | 0;
            if (isFinite(length)) {
              length = length | 0;
              if (encoding === undefined) encoding = 'utf8';
            } else {
              encoding = length;
              length = undefined;
            }
          // legacy write(string, encoding, offset, length) - remove in v0.13
          } else {
            throw new Error(
              'Buffer.write(string, encoding, offset[, length]) is no longer supported'
            )
          }

          var remaining = this.length - offset;
          if (length === undefined || length > remaining) length = remaining;

          if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
            throw new RangeError('Attempt to write outside buffer bounds')
          }

          if (!encoding) encoding = 'utf8';

          var loweredCase = false;
          for (;;) {
            switch (encoding) {
              case 'hex':
                return hexWrite(this, string, offset, length)

              case 'utf8':
              case 'utf-8':
                return utf8Write(this, string, offset, length)

              case 'ascii':
                return asciiWrite(this, string, offset, length)

              case 'latin1':
              case 'binary':
                return latin1Write(this, string, offset, length)

              case 'base64':
                // Warning: maxLength not taken into account in base64Write
                return base64Write(this, string, offset, length)

              case 'ucs2':
              case 'ucs-2':
              case 'utf16le':
              case 'utf-16le':
                return ucs2Write(this, string, offset, length)

              default:
                if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
                encoding = ('' + encoding).toLowerCase();
                loweredCase = true;
            }
          }
        };

        Buffer.prototype.toJSON = function toJSON () {
          return {
            type: 'Buffer',
            data: Array.prototype.slice.call(this._arr || this, 0)
          }
        };

        function base64Slice (buf, start, end) {
          if (start === 0 && end === buf.length) {
            return fromByteArray(buf)
          } else {
            return fromByteArray(buf.slice(start, end))
          }
        }

        function utf8Slice (buf, start, end) {
          end = Math.min(buf.length, end);
          var res = [];

          var i = start;
          while (i < end) {
            var firstByte = buf[i];
            var codePoint = null;
            var bytesPerSequence = (firstByte > 0xEF) ? 4
              : (firstByte > 0xDF) ? 3
              : (firstByte > 0xBF) ? 2
              : 1;

            if (i + bytesPerSequence <= end) {
              var secondByte, thirdByte, fourthByte, tempCodePoint;

              switch (bytesPerSequence) {
                case 1:
                  if (firstByte < 0x80) {
                    codePoint = firstByte;
                  }
                  break
                case 2:
                  secondByte = buf[i + 1];
                  if ((secondByte & 0xC0) === 0x80) {
                    tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F);
                    if (tempCodePoint > 0x7F) {
                      codePoint = tempCodePoint;
                    }
                  }
                  break
                case 3:
                  secondByte = buf[i + 1];
                  thirdByte = buf[i + 2];
                  if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
                    tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F);
                    if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
                      codePoint = tempCodePoint;
                    }
                  }
                  break
                case 4:
                  secondByte = buf[i + 1];
                  thirdByte = buf[i + 2];
                  fourthByte = buf[i + 3];
                  if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
                    tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F);
                    if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
                      codePoint = tempCodePoint;
                    }
                  }
              }
            }

            if (codePoint === null) {
              // we did not generate a valid codePoint so insert a
              // replacement char (U+FFFD) and advance only 1 byte
              codePoint = 0xFFFD;
              bytesPerSequence = 1;
            } else if (codePoint > 0xFFFF) {
              // encode to utf16 (surrogate pair dance)
              codePoint -= 0x10000;
              res.push(codePoint >>> 10 & 0x3FF | 0xD800);
              codePoint = 0xDC00 | codePoint & 0x3FF;
            }

            res.push(codePoint);
            i += bytesPerSequence;
          }

          return decodeCodePointsArray(res)
        }

        // Based on http://stackoverflow.com/a/22747272/680742, the browser with
        // the lowest limit is Chrome, with 0x10000 args.
        // We go 1 magnitude less, for safety
        var MAX_ARGUMENTS_LENGTH = 0x1000;

        function decodeCodePointsArray (codePoints) {
          var len = codePoints.length;
          if (len <= MAX_ARGUMENTS_LENGTH) {
            return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
          }

          // Decode in chunks to avoid "call stack size exceeded".
          var res = '';
          var i = 0;
          while (i < len) {
            res += String.fromCharCode.apply(
              String,
              codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
            );
          }
          return res
        }

        function asciiSlice (buf, start, end) {
          var ret = '';
          end = Math.min(buf.length, end);

          for (var i = start; i < end; ++i) {
            ret += String.fromCharCode(buf[i] & 0x7F);
          }
          return ret
        }

        function latin1Slice (buf, start, end) {
          var ret = '';
          end = Math.min(buf.length, end);

          for (var i = start; i < end; ++i) {
            ret += String.fromCharCode(buf[i]);
          }
          return ret
        }

        function hexSlice (buf, start, end) {
          var len = buf.length;

          if (!start || start < 0) start = 0;
          if (!end || end < 0 || end > len) end = len;

          var out = '';
          for (var i = start; i < end; ++i) {
            out += toHex(buf[i]);
          }
          return out
        }

        function utf16leSlice (buf, start, end) {
          var bytes = buf.slice(start, end);
          var res = '';
          for (var i = 0; i < bytes.length; i += 2) {
            res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
          }
          return res
        }

        Buffer.prototype.slice = function slice (start, end) {
          var len = this.length;
          start = ~~start;
          end = end === undefined ? len : ~~end;

          if (start < 0) {
            start += len;
            if (start < 0) start = 0;
          } else if (start > len) {
            start = len;
          }

          if (end < 0) {
            end += len;
            if (end < 0) end = 0;
          } else if (end > len) {
            end = len;
          }

          if (end < start) end = start;

          var newBuf;
          if (Buffer.TYPED_ARRAY_SUPPORT) {
            newBuf = this.subarray(start, end);
            newBuf.__proto__ = Buffer.prototype;
          } else {
            var sliceLen = end - start;
            newBuf = new Buffer(sliceLen, undefined);
            for (var i = 0; i < sliceLen; ++i) {
              newBuf[i] = this[i + start];
            }
          }

          return newBuf
        };

        /*
         * Need to make sure that buffer isn't trying to write out of bounds.
         */
        function checkOffset (offset, ext, length) {
          if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
          if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
        }

        Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
          offset = offset | 0;
          byteLength = byteLength | 0;
          if (!noAssert) checkOffset(offset, byteLength, this.length);

          var val = this[offset];
          var mul = 1;
          var i = 0;
          while (++i < byteLength && (mul *= 0x100)) {
            val += this[offset + i] * mul;
          }

          return val
        };

        Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
          offset = offset | 0;
          byteLength = byteLength | 0;
          if (!noAssert) {
            checkOffset(offset, byteLength, this.length);
          }

          var val = this[offset + --byteLength];
          var mul = 1;
          while (byteLength > 0 && (mul *= 0x100)) {
            val += this[offset + --byteLength] * mul;
          }

          return val
        };

        Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
          if (!noAssert) checkOffset(offset, 1, this.length);
          return this[offset]
        };

        Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
          if (!noAssert) checkOffset(offset, 2, this.length);
          return this[offset] | (this[offset + 1] << 8)
        };

        Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
          if (!noAssert) checkOffset(offset, 2, this.length);
          return (this[offset] << 8) | this[offset + 1]
        };

        Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
          if (!noAssert) checkOffset(offset, 4, this.length);

          return ((this[offset]) |
              (this[offset + 1] << 8) |
              (this[offset + 2] << 16)) +
              (this[offset + 3] * 0x1000000)
        };

        Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
          if (!noAssert) checkOffset(offset, 4, this.length);

          return (this[offset] * 0x1000000) +
            ((this[offset + 1] << 16) |
            (this[offset + 2] << 8) |
            this[offset + 3])
        };

        Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
          offset = offset | 0;
          byteLength = byteLength | 0;
          if (!noAssert) checkOffset(offset, byteLength, this.length);

          var val = this[offset];
          var mul = 1;
          var i = 0;
          while (++i < byteLength && (mul *= 0x100)) {
            val += this[offset + i] * mul;
          }
          mul *= 0x80;

          if (val >= mul) val -= Math.pow(2, 8 * byteLength);

          return val
        };

        Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
          offset = offset | 0;
          byteLength = byteLength | 0;
          if (!noAssert) checkOffset(offset, byteLength, this.length);

          var i = byteLength;
          var mul = 1;
          var val = this[offset + --i];
          while (i > 0 && (mul *= 0x100)) {
            val += this[offset + --i] * mul;
          }
          mul *= 0x80;

          if (val >= mul) val -= Math.pow(2, 8 * byteLength);

          return val
        };

        Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
          if (!noAssert) checkOffset(offset, 1, this.length);
          if (!(this[offset] & 0x80)) return (this[offset])
          return ((0xff - this[offset] + 1) * -1)
        };

        Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
          if (!noAssert) checkOffset(offset, 2, this.length);
          var val = this[offset] | (this[offset + 1] << 8);
          return (val & 0x8000) ? val | 0xFFFF0000 : val
        };

        Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
          if (!noAssert) checkOffset(offset, 2, this.length);
          var val = this[offset + 1] | (this[offset] << 8);
          return (val & 0x8000) ? val | 0xFFFF0000 : val
        };

        Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
          if (!noAssert) checkOffset(offset, 4, this.length);

          return (this[offset]) |
            (this[offset + 1] << 8) |
            (this[offset + 2] << 16) |
            (this[offset + 3] << 24)
        };

        Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
          if (!noAssert) checkOffset(offset, 4, this.length);

          return (this[offset] << 24) |
            (this[offset + 1] << 16) |
            (this[offset + 2] << 8) |
            (this[offset + 3])
        };

        Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
          if (!noAssert) checkOffset(offset, 4, this.length);
          return read(this, offset, true, 23, 4)
        };

        Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
          if (!noAssert) checkOffset(offset, 4, this.length);
          return read(this, offset, false, 23, 4)
        };

        Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
          if (!noAssert) checkOffset(offset, 8, this.length);
          return read(this, offset, true, 52, 8)
        };

        Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
          if (!noAssert) checkOffset(offset, 8, this.length);
          return read(this, offset, false, 52, 8)
        };

        function checkInt (buf, value, offset, ext, max, min) {
          if (!internalIsBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
          if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
          if (offset + ext > buf.length) throw new RangeError('Index out of range')
        }

        Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
          value = +value;
          offset = offset | 0;
          byteLength = byteLength | 0;
          if (!noAssert) {
            var maxBytes = Math.pow(2, 8 * byteLength) - 1;
            checkInt(this, value, offset, byteLength, maxBytes, 0);
          }

          var mul = 1;
          var i = 0;
          this[offset] = value & 0xFF;
          while (++i < byteLength && (mul *= 0x100)) {
            this[offset + i] = (value / mul) & 0xFF;
          }

          return offset + byteLength
        };

        Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
          value = +value;
          offset = offset | 0;
          byteLength = byteLength | 0;
          if (!noAssert) {
            var maxBytes = Math.pow(2, 8 * byteLength) - 1;
            checkInt(this, value, offset, byteLength, maxBytes, 0);
          }

          var i = byteLength - 1;
          var mul = 1;
          this[offset + i] = value & 0xFF;
          while (--i >= 0 && (mul *= 0x100)) {
            this[offset + i] = (value / mul) & 0xFF;
          }

          return offset + byteLength
        };

        Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
          value = +value;
          offset = offset | 0;
          if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0);
          if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
          this[offset] = (value & 0xff);
          return offset + 1
        };

        function objectWriteUInt16 (buf, value, offset, littleEndian) {
          if (value < 0) value = 0xffff + value + 1;
          for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
            buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
              (littleEndian ? i : 1 - i) * 8;
          }
        }

        Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
          value = +value;
          offset = offset | 0;
          if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
          if (Buffer.TYPED_ARRAY_SUPPORT) {
            this[offset] = (value & 0xff);
            this[offset + 1] = (value >>> 8);
          } else {
            objectWriteUInt16(this, value, offset, true);
          }
          return offset + 2
        };

        Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
          value = +value;
          offset = offset | 0;
          if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
          if (Buffer.TYPED_ARRAY_SUPPORT) {
            this[offset] = (value >>> 8);
            this[offset + 1] = (value & 0xff);
          } else {
            objectWriteUInt16(this, value, offset, false);
          }
          return offset + 2
        };

        function objectWriteUInt32 (buf, value, offset, littleEndian) {
          if (value < 0) value = 0xffffffff + value + 1;
          for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
            buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff;
          }
        }

        Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
          value = +value;
          offset = offset | 0;
          if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
          if (Buffer.TYPED_ARRAY_SUPPORT) {
            this[offset + 3] = (value >>> 24);
            this[offset + 2] = (value >>> 16);
            this[offset + 1] = (value >>> 8);
            this[offset] = (value & 0xff);
          } else {
            objectWriteUInt32(this, value, offset, true);
          }
          return offset + 4
        };

        Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
          value = +value;
          offset = offset | 0;
          if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
          if (Buffer.TYPED_ARRAY_SUPPORT) {
            this[offset] = (value >>> 24);
            this[offset + 1] = (value >>> 16);
            this[offset + 2] = (value >>> 8);
            this[offset + 3] = (value & 0xff);
          } else {
            objectWriteUInt32(this, value, offset, false);
          }
          return offset + 4
        };

        Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
          value = +value;
          offset = offset | 0;
          if (!noAssert) {
            var limit = Math.pow(2, 8 * byteLength - 1);

            checkInt(this, value, offset, byteLength, limit - 1, -limit);
          }

          var i = 0;
          var mul = 1;
          var sub = 0;
          this[offset] = value & 0xFF;
          while (++i < byteLength && (mul *= 0x100)) {
            if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
              sub = 1;
            }
            this[offset + i] = ((value / mul) >> 0) - sub & 0xFF;
          }

          return offset + byteLength
        };

        Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
          value = +value;
          offset = offset | 0;
          if (!noAssert) {
            var limit = Math.pow(2, 8 * byteLength - 1);

            checkInt(this, value, offset, byteLength, limit - 1, -limit);
          }

          var i = byteLength - 1;
          var mul = 1;
          var sub = 0;
          this[offset + i] = value & 0xFF;
          while (--i >= 0 && (mul *= 0x100)) {
            if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
              sub = 1;
            }
            this[offset + i] = ((value / mul) >> 0) - sub & 0xFF;
          }

          return offset + byteLength
        };

        Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
          value = +value;
          offset = offset | 0;
          if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80);
          if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
          if (value < 0) value = 0xff + value + 1;
          this[offset] = (value & 0xff);
          return offset + 1
        };

        Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
          value = +value;
          offset = offset | 0;
          if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
          if (Buffer.TYPED_ARRAY_SUPPORT) {
            this[offset] = (value & 0xff);
            this[offset + 1] = (value >>> 8);
          } else {
            objectWriteUInt16(this, value, offset, true);
          }
          return offset + 2
        };

        Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
          value = +value;
          offset = offset | 0;
          if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
          if (Buffer.TYPED_ARRAY_SUPPORT) {
            this[offset] = (value >>> 8);
            this[offset + 1] = (value & 0xff);
          } else {
            objectWriteUInt16(this, value, offset, false);
          }
          return offset + 2
        };

        Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
          value = +value;
          offset = offset | 0;
          if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
          if (Buffer.TYPED_ARRAY_SUPPORT) {
            this[offset] = (value & 0xff);
            this[offset + 1] = (value >>> 8);
            this[offset + 2] = (value >>> 16);
            this[offset + 3] = (value >>> 24);
          } else {
            objectWriteUInt32(this, value, offset, true);
          }
          return offset + 4
        };

        Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
          value = +value;
          offset = offset | 0;
          if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
          if (value < 0) value = 0xffffffff + value + 1;
          if (Buffer.TYPED_ARRAY_SUPPORT) {
            this[offset] = (value >>> 24);
            this[offset + 1] = (value >>> 16);
            this[offset + 2] = (value >>> 8);
            this[offset + 3] = (value & 0xff);
          } else {
            objectWriteUInt32(this, value, offset, false);
          }
          return offset + 4
        };

        function checkIEEE754 (buf, value, offset, ext, max, min) {
          if (offset + ext > buf.length) throw new RangeError('Index out of range')
          if (offset < 0) throw new RangeError('Index out of range')
        }

        function writeFloat (buf, value, offset, littleEndian, noAssert) {
          if (!noAssert) {
            checkIEEE754(buf, value, offset, 4);
          }
          write(buf, value, offset, littleEndian, 23, 4);
          return offset + 4
        }

        Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
          return writeFloat(this, value, offset, true, noAssert)
        };

        Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
          return writeFloat(this, value, offset, false, noAssert)
        };

        function writeDouble (buf, value, offset, littleEndian, noAssert) {
          if (!noAssert) {
            checkIEEE754(buf, value, offset, 8);
          }
          write(buf, value, offset, littleEndian, 52, 8);
          return offset + 8
        }

        Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
          return writeDouble(this, value, offset, true, noAssert)
        };

        Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
          return writeDouble(this, value, offset, false, noAssert)
        };

        // copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
        Buffer.prototype.copy = function copy (target, targetStart, start, end) {
          if (!start) start = 0;
          if (!end && end !== 0) end = this.length;
          if (targetStart >= target.length) targetStart = target.length;
          if (!targetStart) targetStart = 0;
          if (end > 0 && end < start) end = start;

          // Copy 0 bytes; we're done
          if (end === start) return 0
          if (target.length === 0 || this.length === 0) return 0

          // Fatal error conditions
          if (targetStart < 0) {
            throw new RangeError('targetStart out of bounds')
          }
          if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
          if (end < 0) throw new RangeError('sourceEnd out of bounds')

          // Are we oob?
          if (end > this.length) end = this.length;
          if (target.length - targetStart < end - start) {
            end = target.length - targetStart + start;
          }

          var len = end - start;
          var i;

          if (this === target && start < targetStart && targetStart < end) {
            // descending copy from end
            for (i = len - 1; i >= 0; --i) {
              target[i + targetStart] = this[i + start];
            }
          } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
            // ascending copy from start
            for (i = 0; i < len; ++i) {
              target[i + targetStart] = this[i + start];
            }
          } else {
            Uint8Array.prototype.set.call(
              target,
              this.subarray(start, start + len),
              targetStart
            );
          }

          return len
        };

        // Usage:
        //    buffer.fill(number[, offset[, end]])
        //    buffer.fill(buffer[, offset[, end]])
        //    buffer.fill(string[, offset[, end]][, encoding])
        Buffer.prototype.fill = function fill (val, start, end, encoding) {
          // Handle string cases:
          if (typeof val === 'string') {
            if (typeof start === 'string') {
              encoding = start;
              start = 0;
              end = this.length;
            } else if (typeof end === 'string') {
              encoding = end;
              end = this.length;
            }
            if (val.length === 1) {
              var code = val.charCodeAt(0);
              if (code < 256) {
                val = code;
              }
            }
            if (encoding !== undefined && typeof encoding !== 'string') {
              throw new TypeError('encoding must be a string')
            }
            if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
              throw new TypeError('Unknown encoding: ' + encoding)
            }
          } else if (typeof val === 'number') {
            val = val & 255;
          }

          // Invalid ranges are not set to a default, so can range check early.
          if (start < 0 || this.length < start || this.length < end) {
            throw new RangeError('Out of range index')
          }

          if (end <= start) {
            return this
          }

          start = start >>> 0;
          end = end === undefined ? this.length : end >>> 0;

          if (!val) val = 0;

          var i;
          if (typeof val === 'number') {
            for (i = start; i < end; ++i) {
              this[i] = val;
            }
          } else {
            var bytes = internalIsBuffer(val)
              ? val
              : utf8ToBytes(new Buffer(val, encoding).toString());
            var len = bytes.length;
            for (i = 0; i < end - start; ++i) {
              this[i + start] = bytes[i % len];
            }
          }

          return this
        };

        // HELPER FUNCTIONS
        // ================

        var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g;

        function base64clean (str) {
          // Node strips out invalid characters like \n and \t from the string, base64-js does not
          str = stringtrim(str).replace(INVALID_BASE64_RE, '');
          // Node converts strings with length < 2 to ''
          if (str.length < 2) return ''
          // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
          while (str.length % 4 !== 0) {
            str = str + '=';
          }
          return str
        }

        function stringtrim (str) {
          if (str.trim) return str.trim()
          return str.replace(/^\s+|\s+$/g, '')
        }

        function toHex (n) {
          if (n < 16) return '0' + n.toString(16)
          return n.toString(16)
        }

        function utf8ToBytes (string, units) {
          units = units || Infinity;
          var codePoint;
          var length = string.length;
          var leadSurrogate = null;
          var bytes = [];

          for (var i = 0; i < length; ++i) {
            codePoint = string.charCodeAt(i);

            // is surrogate component
            if (codePoint > 0xD7FF && codePoint < 0xE000) {
              // last char was a lead
              if (!leadSurrogate) {
                // no lead yet
                if (codePoint > 0xDBFF) {
                  // unexpected trail
                  if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
                  continue
                } else if (i + 1 === length) {
                  // unpaired lead
                  if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
                  continue
                }

                // valid lead
                leadSurrogate = codePoint;

                continue
              }

              // 2 leads in a row
              if (codePoint < 0xDC00) {
                if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
                leadSurrogate = codePoint;
                continue
              }

              // valid surrogate pair
              codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000;
            } else if (leadSurrogate) {
              // valid bmp char, but last char was a lead
              if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
            }

            leadSurrogate = null;

            // encode utf8
            if (codePoint < 0x80) {
              if ((units -= 1) < 0) break
              bytes.push(codePoint);
            } else if (codePoint < 0x800) {
              if ((units -= 2) < 0) break
              bytes.push(
                codePoint >> 0x6 | 0xC0,
                codePoint & 0x3F | 0x80
              );
            } else if (codePoint < 0x10000) {
              if ((units -= 3) < 0) break
              bytes.push(
                codePoint >> 0xC | 0xE0,
                codePoint >> 0x6 & 0x3F | 0x80,
                codePoint & 0x3F | 0x80
              );
            } else if (codePoint < 0x110000) {
              if ((units -= 4) < 0) break
              bytes.push(
                codePoint >> 0x12 | 0xF0,
                codePoint >> 0xC & 0x3F | 0x80,
                codePoint >> 0x6 & 0x3F | 0x80,
                codePoint & 0x3F | 0x80
              );
            } else {
              throw new Error('Invalid code point')
            }
          }

          return bytes
        }

        function asciiToBytes (str) {
          var byteArray = [];
          for (var i = 0; i < str.length; ++i) {
            // Node's code seems to be doing this and not & 0x7F..
            byteArray.push(str.charCodeAt(i) & 0xFF);
          }
          return byteArray
        }

        function utf16leToBytes (str, units) {
          var c, hi, lo;
          var byteArray = [];
          for (var i = 0; i < str.length; ++i) {
            if ((units -= 2) < 0) break

            c = str.charCodeAt(i);
            hi = c >> 8;
            lo = c % 256;
            byteArray.push(lo);
            byteArray.push(hi);
          }

          return byteArray
        }


        function base64ToBytes (str) {
          return toByteArray(base64clean(str))
        }

        function blitBuffer (src, dst, offset, length) {
          for (var i = 0; i < length; ++i) {
            if ((i + offset >= dst.length) || (i >= src.length)) break
            dst[i + offset] = src[i];
          }
          return i
        }

        function isnan (val) {
          return val !== val // eslint-disable-line no-self-compare
        }


        // the following is from is-buffer, also by Feross Aboukhadijeh and with same lisence
        // The _isBuffer check is for Safari 5-7 support, because it's missing
        // Object.prototype.constructor. Remove this eventually
        function isBuffer(obj) {
          return obj != null && (!!obj._isBuffer || isFastBuffer(obj) || isSlowBuffer(obj))
        }

        function isFastBuffer (obj) {
          return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
        }

        // For Node v0.10 support. Remove this eventually.
        function isSlowBuffer (obj) {
          return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isFastBuffer(obj.slice(0, 0))
        }

        var domain;

        // This constructor is used to store event handlers. Instantiating this is
        // faster than explicitly calling `Object.create(null)` to get a "clean" empty
        // object (tested with v8 v4.9).
        function EventHandlers() {}
        EventHandlers.prototype = Object.create(null);

        function EventEmitter() {
          EventEmitter.init.call(this);
        }

        // nodejs oddity
        // require('events') === require('events').EventEmitter
        EventEmitter.EventEmitter = EventEmitter;

        EventEmitter.usingDomains = false;

        EventEmitter.prototype.domain = undefined;
        EventEmitter.prototype._events = undefined;
        EventEmitter.prototype._maxListeners = undefined;

        // By default EventEmitters will print a warning if more than 10 listeners are
        // added to it. This is a useful default which helps finding memory leaks.
        EventEmitter.defaultMaxListeners = 10;

        EventEmitter.init = function() {
          this.domain = null;
          if (EventEmitter.usingDomains) {
            // if there is an active domain, then attach to it.
            if (domain.active && !(this instanceof domain.Domain)) ;
          }

          if (!this._events || this._events === Object.getPrototypeOf(this)._events) {
            this._events = new EventHandlers();
            this._eventsCount = 0;
          }

          this._maxListeners = this._maxListeners || undefined;
        };

        // Obviously not all Emitters should be limited to 10. This function allows
        // that to be increased. Set to zero for unlimited.
        EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
          if (typeof n !== 'number' || n < 0 || isNaN(n))
            throw new TypeError('"n" argument must be a positive number');
          this._maxListeners = n;
          return this;
        };

        function $getMaxListeners(that) {
          if (that._maxListeners === undefined)
            return EventEmitter.defaultMaxListeners;
          return that._maxListeners;
        }

        EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
          return $getMaxListeners(this);
        };

        // These standalone emit* functions are used to optimize calling of event
        // handlers for fast cases because emit() itself often has a variable number of
        // arguments and can be deoptimized because of that. These functions always have
        // the same number of arguments and thus do not get deoptimized, so the code
        // inside them can execute faster.
        function emitNone(handler, isFn, self) {
          if (isFn)
            handler.call(self);
          else {
            var len = handler.length;
            var listeners = arrayClone(handler, len);
            for (var i = 0; i < len; ++i)
              listeners[i].call(self);
          }
        }
        function emitOne(handler, isFn, self, arg1) {
          if (isFn)
            handler.call(self, arg1);
          else {
            var len = handler.length;
            var listeners = arrayClone(handler, len);
            for (var i = 0; i < len; ++i)
              listeners[i].call(self, arg1);
          }
        }
        function emitTwo(handler, isFn, self, arg1, arg2) {
          if (isFn)
            handler.call(self, arg1, arg2);
          else {
            var len = handler.length;
            var listeners = arrayClone(handler, len);
            for (var i = 0; i < len; ++i)
              listeners[i].call(self, arg1, arg2);
          }
        }
        function emitThree(handler, isFn, self, arg1, arg2, arg3) {
          if (isFn)
            handler.call(self, arg1, arg2, arg3);
          else {
            var len = handler.length;
            var listeners = arrayClone(handler, len);
            for (var i = 0; i < len; ++i)
              listeners[i].call(self, arg1, arg2, arg3);
          }
        }

        function emitMany(handler, isFn, self, args) {
          if (isFn)
            handler.apply(self, args);
          else {
            var len = handler.length;
            var listeners = arrayClone(handler, len);
            for (var i = 0; i < len; ++i)
              listeners[i].apply(self, args);
          }
        }

        EventEmitter.prototype.emit = function emit(type) {
          var er, handler, len, args, i, events, domain;
          var doError = (type === 'error');

          events = this._events;
          if (events)
            doError = (doError && events.error == null);
          else if (!doError)
            return false;

          domain = this.domain;

          // If there is no 'error' event listener then throw.
          if (doError) {
            er = arguments[1];
            if (domain) {
              if (!er)
                er = new Error('Uncaught, unspecified "error" event');
              er.domainEmitter = this;
              er.domain = domain;
              er.domainThrown = false;
              domain.emit('error', er);
            } else if (er instanceof Error) {
              throw er; // Unhandled 'error' event
            } else {
              // At least give some kind of context to the user
              var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
              err.context = er;
              throw err;
            }
            return false;
          }

          handler = events[type];

          if (!handler)
            return false;

          var isFn = typeof handler === 'function';
          len = arguments.length;
          switch (len) {
            // fast cases
            case 1:
              emitNone(handler, isFn, this);
              break;
            case 2:
              emitOne(handler, isFn, this, arguments[1]);
              break;
            case 3:
              emitTwo(handler, isFn, this, arguments[1], arguments[2]);
              break;
            case 4:
              emitThree(handler, isFn, this, arguments[1], arguments[2], arguments[3]);
              break;
            // slower
            default:
              args = new Array(len - 1);
              for (i = 1; i < len; i++)
                args[i - 1] = arguments[i];
              emitMany(handler, isFn, this, args);
          }

          return true;
        };

        function _addListener(target, type, listener, prepend) {
          var m;
          var events;
          var existing;

          if (typeof listener !== 'function')
            throw new TypeError('"listener" argument must be a function');

          events = target._events;
          if (!events) {
            events = target._events = new EventHandlers();
            target._eventsCount = 0;
          } else {
            // To avoid recursion in the case that type === "newListener"! Before
            // adding it to the listeners, first emit "newListener".
            if (events.newListener) {
              target.emit('newListener', type,
                          listener.listener ? listener.listener : listener);

              // Re-assign `events` because a newListener handler could have caused the
              // this._events to be assigned to a new object
              events = target._events;
            }
            existing = events[type];
          }

          if (!existing) {
            // Optimize the case of one listener. Don't need the extra array object.
            existing = events[type] = listener;
            ++target._eventsCount;
          } else {
            if (typeof existing === 'function') {
              // Adding the second element, need to change to array.
              existing = events[type] = prepend ? [listener, existing] :
                                                  [existing, listener];
            } else {
              // If we've already got an array, just append.
              if (prepend) {
                existing.unshift(listener);
              } else {
                existing.push(listener);
              }
            }

            // Check for listener leak
            if (!existing.warned) {
              m = $getMaxListeners(target);
              if (m && m > 0 && existing.length > m) {
                existing.warned = true;
                var w = new Error('Possible EventEmitter memory leak detected. ' +
                                    existing.length + ' ' + type + ' listeners added. ' +
                                    'Use emitter.setMaxListeners() to increase limit');
                w.name = 'MaxListenersExceededWarning';
                w.emitter = target;
                w.type = type;
                w.count = existing.length;
                emitWarning(w);
              }
            }
          }

          return target;
        }
        function emitWarning(e) {
          typeof console.warn === 'function' ? console.warn(e) : console.log(e);
        }
        EventEmitter.prototype.addListener = function addListener(type, listener) {
          return _addListener(this, type, listener, false);
        };

        EventEmitter.prototype.on = EventEmitter.prototype.addListener;

        EventEmitter.prototype.prependListener =
            function prependListener(type, listener) {
              return _addListener(this, type, listener, true);
            };

        function _onceWrap(target, type, listener) {
          var fired = false;
          function g() {
            target.removeListener(type, g);
            if (!fired) {
              fired = true;
              listener.apply(target, arguments);
            }
          }
          g.listener = listener;
          return g;
        }

        EventEmitter.prototype.once = function once(type, listener) {
          if (typeof listener !== 'function')
            throw new TypeError('"listener" argument must be a function');
          this.on(type, _onceWrap(this, type, listener));
          return this;
        };

        EventEmitter.prototype.prependOnceListener =
            function prependOnceListener(type, listener) {
              if (typeof listener !== 'function')
                throw new TypeError('"listener" argument must be a function');
              this.prependListener(type, _onceWrap(this, type, listener));
              return this;
            };

        // emits a 'removeListener' event iff the listener was removed
        EventEmitter.prototype.removeListener =
            function removeListener(type, listener) {
              var list, events, position, i, originalListener;

              if (typeof listener !== 'function')
                throw new TypeError('"listener" argument must be a function');

              events = this._events;
              if (!events)
                return this;

              list = events[type];
              if (!list)
                return this;

              if (list === listener || (list.listener && list.listener === listener)) {
                if (--this._eventsCount === 0)
                  this._events = new EventHandlers();
                else {
                  delete events[type];
                  if (events.removeListener)
                    this.emit('removeListener', type, list.listener || listener);
                }
              } else if (typeof list !== 'function') {
                position = -1;

                for (i = list.length; i-- > 0;) {
                  if (list[i] === listener ||
                      (list[i].listener && list[i].listener === listener)) {
                    originalListener = list[i].listener;
                    position = i;
                    break;
                  }
                }

                if (position < 0)
                  return this;

                if (list.length === 1) {
                  list[0] = undefined;
                  if (--this._eventsCount === 0) {
                    this._events = new EventHandlers();
                    return this;
                  } else {
                    delete events[type];
                  }
                } else {
                  spliceOne(list, position);
                }

                if (events.removeListener)
                  this.emit('removeListener', type, originalListener || listener);
              }

              return this;
            };

        EventEmitter.prototype.removeAllListeners =
            function removeAllListeners(type) {
              var listeners, events;

              events = this._events;
              if (!events)
                return this;

              // not listening for removeListener, no need to emit
              if (!events.removeListener) {
                if (arguments.length === 0) {
                  this._events = new EventHandlers();
                  this._eventsCount = 0;
                } else if (events[type]) {
                  if (--this._eventsCount === 0)
                    this._events = new EventHandlers();
                  else
                    delete events[type];
                }
                return this;
              }

              // emit removeListener for all listeners on all events
              if (arguments.length === 0) {
                var keys = Object.keys(events);
                for (var i = 0, key; i < keys.length; ++i) {
                  key = keys[i];
                  if (key === 'removeListener') continue;
                  this.removeAllListeners(key);
                }
                this.removeAllListeners('removeListener');
                this._events = new EventHandlers();
                this._eventsCount = 0;
                return this;
              }

              listeners = events[type];

              if (typeof listeners === 'function') {
                this.removeListener(type, listeners);
              } else if (listeners) {
                // LIFO order
                do {
                  this.removeListener(type, listeners[listeners.length - 1]);
                } while (listeners[0]);
              }

              return this;
            };

        EventEmitter.prototype.listeners = function listeners(type) {
          var evlistener;
          var ret;
          var events = this._events;

          if (!events)
            ret = [];
          else {
            evlistener = events[type];
            if (!evlistener)
              ret = [];
            else if (typeof evlistener === 'function')
              ret = [evlistener.listener || evlistener];
            else
              ret = unwrapListeners(evlistener);
          }

          return ret;
        };

        EventEmitter.listenerCount = function(emitter, type) {
          if (typeof emitter.listenerCount === 'function') {
            return emitter.listenerCount(type);
          } else {
            return listenerCount.call(emitter, type);
          }
        };

        EventEmitter.prototype.listenerCount = listenerCount;
        function listenerCount(type) {
          var events = this._events;

          if (events) {
            var evlistener = events[type];

            if (typeof evlistener === 'function') {
              return 1;
            } else if (evlistener) {
              return evlistener.length;
            }
          }

          return 0;
        }

        EventEmitter.prototype.eventNames = function eventNames() {
          return this._eventsCount > 0 ? Reflect.ownKeys(this._events) : [];
        };

        // About 1.5x faster than the two-arg version of Array#splice().
        function spliceOne(list, index) {
          for (var i = index, k = i + 1, n = list.length; k < n; i += 1, k += 1)
            list[i] = list[k];
          list.pop();
        }

        function arrayClone(arr, i) {
          var copy = new Array(i);
          while (i--)
            copy[i] = arr[i];
          return copy;
        }

        function unwrapListeners(arr) {
          var ret = new Array(arr.length);
          for (var i = 0; i < ret.length; ++i) {
            ret[i] = arr[i].listener || arr[i];
          }
          return ret;
        }

        // shim for using process in browser
        // based off https://github.com/defunctzombie/node-process/blob/master/browser.js

        function defaultSetTimout() {
            throw new Error('setTimeout has not been defined');
        }
        function defaultClearTimeout () {
            throw new Error('clearTimeout has not been defined');
        }
        var cachedSetTimeout = defaultSetTimout;
        var cachedClearTimeout = defaultClearTimeout;
        if (typeof global$1$1.setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        }
        if (typeof global$1$1.clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        }

        function runTimeout(fun) {
            if (cachedSetTimeout === setTimeout) {
                //normal enviroments in sane situations
                return setTimeout(fun, 0);
            }
            // if setTimeout wasn't available but was latter defined
            if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
                cachedSetTimeout = setTimeout;
                return setTimeout(fun, 0);
            }
            try {
                // when when somebody has screwed with setTimeout but no I.E. maddness
                return cachedSetTimeout(fun, 0);
            } catch(e){
                try {
                    // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
                    return cachedSetTimeout.call(null, fun, 0);
                } catch(e){
                    // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
                    return cachedSetTimeout.call(this, fun, 0);
                }
            }


        }
        function runClearTimeout(marker) {
            if (cachedClearTimeout === clearTimeout) {
                //normal enviroments in sane situations
                return clearTimeout(marker);
            }
            // if clearTimeout wasn't available but was latter defined
            if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
                cachedClearTimeout = clearTimeout;
                return clearTimeout(marker);
            }
            try {
                // when when somebody has screwed with setTimeout but no I.E. maddness
                return cachedClearTimeout(marker);
            } catch (e){
                try {
                    // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
                    return cachedClearTimeout.call(null, marker);
                } catch (e){
                    // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
                    // Some versions of I.E. have different rules for clearTimeout vs setTimeout
                    return cachedClearTimeout.call(this, marker);
                }
            }



        }
        var queue = [];
        var draining = false;
        var currentQueue;
        var queueIndex = -1;

        function cleanUpNextTick() {
            if (!draining || !currentQueue) {
                return;
            }
            draining = false;
            if (currentQueue.length) {
                queue = currentQueue.concat(queue);
            } else {
                queueIndex = -1;
            }
            if (queue.length) {
                drainQueue();
            }
        }

        function drainQueue() {
            if (draining) {
                return;
            }
            var timeout = runTimeout(cleanUpNextTick);
            draining = true;

            var len = queue.length;
            while(len) {
                currentQueue = queue;
                queue = [];
                while (++queueIndex < len) {
                    if (currentQueue) {
                        currentQueue[queueIndex].run();
                    }
                }
                queueIndex = -1;
                len = queue.length;
            }
            currentQueue = null;
            draining = false;
            runClearTimeout(timeout);
        }
        function nextTick(fun) {
            var args = new Array(arguments.length - 1);
            if (arguments.length > 1) {
                for (var i = 1; i < arguments.length; i++) {
                    args[i - 1] = arguments[i];
                }
            }
            queue.push(new Item(fun, args));
            if (queue.length === 1 && !draining) {
                runTimeout(drainQueue);
            }
        }
        // v8 likes predictible objects
        function Item(fun, array) {
            this.fun = fun;
            this.array = array;
        }
        Item.prototype.run = function () {
            this.fun.apply(null, this.array);
        };

        // from https://github.com/kumavis/browser-process-hrtime/blob/master/index.js
        var performance = global$1$1.performance || {};
        var performanceNow =
          performance.now        ||
          performance.mozNow     ||
          performance.msNow      ||
          performance.oNow       ||
          performance.webkitNow  ||
          function(){ return (new Date()).getTime() };

        var inherits;
        if (typeof Object.create === 'function'){
          inherits = function inherits(ctor, superCtor) {
            // implementation from standard node.js 'util' module
            ctor.super_ = superCtor;
            ctor.prototype = Object.create(superCtor.prototype, {
              constructor: {
                value: ctor,
                enumerable: false,
                writable: true,
                configurable: true
              }
            });
          };
        } else {
          inherits = function inherits(ctor, superCtor) {
            ctor.super_ = superCtor;
            var TempCtor = function () {};
            TempCtor.prototype = superCtor.prototype;
            ctor.prototype = new TempCtor();
            ctor.prototype.constructor = ctor;
          };
        }
        var inherits$1 = inherits;

        var formatRegExp = /%[sdj%]/g;
        function format(f) {
          if (!isString(f)) {
            var objects = [];
            for (var i = 0; i < arguments.length; i++) {
              objects.push(inspect(arguments[i]));
            }
            return objects.join(' ');
          }

          var i = 1;
          var args = arguments;
          var len = args.length;
          var str = String(f).replace(formatRegExp, function(x) {
            if (x === '%%') return '%';
            if (i >= len) return x;
            switch (x) {
              case '%s': return String(args[i++]);
              case '%d': return Number(args[i++]);
              case '%j':
                try {
                  return JSON.stringify(args[i++]);
                } catch (_) {
                  return '[Circular]';
                }
              default:
                return x;
            }
          });
          for (var x = args[i]; i < len; x = args[++i]) {
            if (isNull(x) || !isObject(x)) {
              str += ' ' + x;
            } else {
              str += ' ' + inspect(x);
            }
          }
          return str;
        }

        // Mark that a method should not be used.
        // Returns a modified function which warns once by default.
        // If --no-deprecation is set, then it is a no-op.
        function deprecate(fn, msg) {
          // Allow for deprecating things in the process of starting up.
          if (isUndefined(global$1$1.process)) {
            return function() {
              return deprecate(fn, msg).apply(this, arguments);
            };
          }

          var warned = false;
          function deprecated() {
            if (!warned) {
              {
                console.error(msg);
              }
              warned = true;
            }
            return fn.apply(this, arguments);
          }

          return deprecated;
        }

        var debugs = {};
        var debugEnviron;
        function debuglog(set) {
          if (isUndefined(debugEnviron))
            debugEnviron =  '';
          set = set.toUpperCase();
          if (!debugs[set]) {
            if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
              var pid = 0;
              debugs[set] = function() {
                var msg = format.apply(null, arguments);
                console.error('%s %d: %s', set, pid, msg);
              };
            } else {
              debugs[set] = function() {};
            }
          }
          return debugs[set];
        }

        /**
         * Echos the value of a value. Trys to print the value out
         * in the best way possible given the different types.
         *
         * @param {Object} obj The object to print out.
         * @param {Object} opts Optional options object that alters the output.
         */
        /* legacy: obj, showHidden, depth, colors*/
        function inspect(obj, opts) {
          // default options
          var ctx = {
            seen: [],
            stylize: stylizeNoColor
          };
          // legacy...
          if (arguments.length >= 3) ctx.depth = arguments[2];
          if (arguments.length >= 4) ctx.colors = arguments[3];
          if (isBoolean(opts)) {
            // legacy...
            ctx.showHidden = opts;
          } else if (opts) {
            // got an "options" object
            _extend(ctx, opts);
          }
          // set default options
          if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
          if (isUndefined(ctx.depth)) ctx.depth = 2;
          if (isUndefined(ctx.colors)) ctx.colors = false;
          if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
          if (ctx.colors) ctx.stylize = stylizeWithColor;
          return formatValue(ctx, obj, ctx.depth);
        }

        // http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
        inspect.colors = {
          'bold' : [1, 22],
          'italic' : [3, 23],
          'underline' : [4, 24],
          'inverse' : [7, 27],
          'white' : [37, 39],
          'grey' : [90, 39],
          'black' : [30, 39],
          'blue' : [34, 39],
          'cyan' : [36, 39],
          'green' : [32, 39],
          'magenta' : [35, 39],
          'red' : [31, 39],
          'yellow' : [33, 39]
        };

        // Don't use 'blue' not visible on cmd.exe
        inspect.styles = {
          'special': 'cyan',
          'number': 'yellow',
          'boolean': 'yellow',
          'undefined': 'grey',
          'null': 'bold',
          'string': 'green',
          'date': 'magenta',
          // "name": intentionally not styling
          'regexp': 'red'
        };


        function stylizeWithColor(str, styleType) {
          var style = inspect.styles[styleType];

          if (style) {
            return '\u001b[' + inspect.colors[style][0] + 'm' + str +
                   '\u001b[' + inspect.colors[style][1] + 'm';
          } else {
            return str;
          }
        }


        function stylizeNoColor(str, styleType) {
          return str;
        }


        function arrayToHash(array) {
          var hash = {};

          array.forEach(function(val, idx) {
            hash[val] = true;
          });

          return hash;
        }


        function formatValue(ctx, value, recurseTimes) {
          // Provide a hook for user-specified inspect functions.
          // Check that value is an object with an inspect function on it
          if (ctx.customInspect &&
              value &&
              isFunction(value.inspect) &&
              // Filter out the util module, it's inspect function is special
              value.inspect !== inspect &&
              // Also filter out any prototype objects using the circular check.
              !(value.constructor && value.constructor.prototype === value)) {
            var ret = value.inspect(recurseTimes, ctx);
            if (!isString(ret)) {
              ret = formatValue(ctx, ret, recurseTimes);
            }
            return ret;
          }

          // Primitive types cannot have properties
          var primitive = formatPrimitive(ctx, value);
          if (primitive) {
            return primitive;
          }

          // Look up the keys of the object.
          var keys = Object.keys(value);
          var visibleKeys = arrayToHash(keys);

          if (ctx.showHidden) {
            keys = Object.getOwnPropertyNames(value);
          }

          // IE doesn't make error fields non-enumerable
          // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
          if (isError(value)
              && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
            return formatError(value);
          }

          // Some type of object without properties can be shortcutted.
          if (keys.length === 0) {
            if (isFunction(value)) {
              var name = value.name ? ': ' + value.name : '';
              return ctx.stylize('[Function' + name + ']', 'special');
            }
            if (isRegExp(value)) {
              return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
            }
            if (isDate(value)) {
              return ctx.stylize(Date.prototype.toString.call(value), 'date');
            }
            if (isError(value)) {
              return formatError(value);
            }
          }

          var base = '', array = false, braces = ['{', '}'];

          // Make Array say that they are Array
          if (isArray$1(value)) {
            array = true;
            braces = ['[', ']'];
          }

          // Make functions say that they are functions
          if (isFunction(value)) {
            var n = value.name ? ': ' + value.name : '';
            base = ' [Function' + n + ']';
          }

          // Make RegExps say that they are RegExps
          if (isRegExp(value)) {
            base = ' ' + RegExp.prototype.toString.call(value);
          }

          // Make dates with properties first say the date
          if (isDate(value)) {
            base = ' ' + Date.prototype.toUTCString.call(value);
          }

          // Make error with message first say the error
          if (isError(value)) {
            base = ' ' + formatError(value);
          }

          if (keys.length === 0 && (!array || value.length == 0)) {
            return braces[0] + base + braces[1];
          }

          if (recurseTimes < 0) {
            if (isRegExp(value)) {
              return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
            } else {
              return ctx.stylize('[Object]', 'special');
            }
          }

          ctx.seen.push(value);

          var output;
          if (array) {
            output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
          } else {
            output = keys.map(function(key) {
              return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
            });
          }

          ctx.seen.pop();

          return reduceToSingleString(output, base, braces);
        }


        function formatPrimitive(ctx, value) {
          if (isUndefined(value))
            return ctx.stylize('undefined', 'undefined');
          if (isString(value)) {
            var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                                     .replace(/'/g, "\\'")
                                                     .replace(/\\"/g, '"') + '\'';
            return ctx.stylize(simple, 'string');
          }
          if (isNumber(value))
            return ctx.stylize('' + value, 'number');
          if (isBoolean(value))
            return ctx.stylize('' + value, 'boolean');
          // For some reason typeof null is "object", so special case here.
          if (isNull(value))
            return ctx.stylize('null', 'null');
        }


        function formatError(value) {
          return '[' + Error.prototype.toString.call(value) + ']';
        }


        function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
          var output = [];
          for (var i = 0, l = value.length; i < l; ++i) {
            if (hasOwnProperty(value, String(i))) {
              output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
                  String(i), true));
            } else {
              output.push('');
            }
          }
          keys.forEach(function(key) {
            if (!key.match(/^\d+$/)) {
              output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
                  key, true));
            }
          });
          return output;
        }


        function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
          var name, str, desc;
          desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
          if (desc.get) {
            if (desc.set) {
              str = ctx.stylize('[Getter/Setter]', 'special');
            } else {
              str = ctx.stylize('[Getter]', 'special');
            }
          } else {
            if (desc.set) {
              str = ctx.stylize('[Setter]', 'special');
            }
          }
          if (!hasOwnProperty(visibleKeys, key)) {
            name = '[' + key + ']';
          }
          if (!str) {
            if (ctx.seen.indexOf(desc.value) < 0) {
              if (isNull(recurseTimes)) {
                str = formatValue(ctx, desc.value, null);
              } else {
                str = formatValue(ctx, desc.value, recurseTimes - 1);
              }
              if (str.indexOf('\n') > -1) {
                if (array) {
                  str = str.split('\n').map(function(line) {
                    return '  ' + line;
                  }).join('\n').substr(2);
                } else {
                  str = '\n' + str.split('\n').map(function(line) {
                    return '   ' + line;
                  }).join('\n');
                }
              }
            } else {
              str = ctx.stylize('[Circular]', 'special');
            }
          }
          if (isUndefined(name)) {
            if (array && key.match(/^\d+$/)) {
              return str;
            }
            name = JSON.stringify('' + key);
            if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
              name = name.substr(1, name.length - 2);
              name = ctx.stylize(name, 'name');
            } else {
              name = name.replace(/'/g, "\\'")
                         .replace(/\\"/g, '"')
                         .replace(/(^"|"$)/g, "'");
              name = ctx.stylize(name, 'string');
            }
          }

          return name + ': ' + str;
        }


        function reduceToSingleString(output, base, braces) {
          var length = output.reduce(function(prev, cur) {
            if (cur.indexOf('\n') >= 0) ;
            return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
          }, 0);

          if (length > 60) {
            return braces[0] +
                   (base === '' ? '' : base + '\n ') +
                   ' ' +
                   output.join(',\n  ') +
                   ' ' +
                   braces[1];
          }

          return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
        }


        // NOTE: These type checking functions intentionally don't use `instanceof`
        // because it is fragile and can be easily faked with `Object.create()`.
        function isArray$1(ar) {
          return Array.isArray(ar);
        }

        function isBoolean(arg) {
          return typeof arg === 'boolean';
        }

        function isNull(arg) {
          return arg === null;
        }

        function isNumber(arg) {
          return typeof arg === 'number';
        }

        function isString(arg) {
          return typeof arg === 'string';
        }

        function isUndefined(arg) {
          return arg === void 0;
        }

        function isRegExp(re) {
          return isObject(re) && objectToString(re) === '[object RegExp]';
        }

        function isObject(arg) {
          return typeof arg === 'object' && arg !== null;
        }

        function isDate(d) {
          return isObject(d) && objectToString(d) === '[object Date]';
        }

        function isError(e) {
          return isObject(e) &&
              (objectToString(e) === '[object Error]' || e instanceof Error);
        }

        function isFunction(arg) {
          return typeof arg === 'function';
        }

        function objectToString(o) {
          return Object.prototype.toString.call(o);
        }

        function _extend(origin, add) {
          // Don't do anything if add isn't an object
          if (!add || !isObject(add)) return origin;

          var keys = Object.keys(add);
          var i = keys.length;
          while (i--) {
            origin[keys[i]] = add[keys[i]];
          }
          return origin;
        }
        function hasOwnProperty(obj, prop) {
          return Object.prototype.hasOwnProperty.call(obj, prop);
        }

        var INSPECT_MAX_BYTES$1 = 50;

        /**
         * If `Buffer.TYPED_ARRAY_SUPPORT`:
         *   === true    Use Uint8Array implementation (fastest)
         *   === false   Use Object implementation (most compatible, even IE6)
         *
         * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
         * Opera 11.6+, iOS 4.2+.
         *
         * Due to various browser bugs, sometimes the Object implementation will be used even
         * when the browser supports typed arrays.
         *
         * Note:
         *
         *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
         *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
         *
         *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
         *
         *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
         *     incorrect length in some situations.

         * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
         * get the Object implementation, which is slower but behaves correctly.
         */
        Buffer$1.TYPED_ARRAY_SUPPORT = global$1$1.TYPED_ARRAY_SUPPORT !== undefined
          ? global$1$1.TYPED_ARRAY_SUPPORT
          : true;

        function kMaxLength$1 () {
          return Buffer$1.TYPED_ARRAY_SUPPORT
            ? 0x7fffffff
            : 0x3fffffff
        }

        function createBuffer$1 (that, length) {
          if (kMaxLength$1() < length) {
            throw new RangeError('Invalid typed array length')
          }
          if (Buffer$1.TYPED_ARRAY_SUPPORT) {
            // Return an augmented `Uint8Array` instance, for best performance
            that = new Uint8Array(length);
            that.__proto__ = Buffer$1.prototype;
          } else {
            // Fallback: Return an object instance of the Buffer class
            if (that === null) {
              that = new Buffer$1(length);
            }
            that.length = length;
          }

          return that
        }

        /**
         * The Buffer constructor returns instances of `Uint8Array` that have their
         * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
         * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
         * and the `Uint8Array` methods. Square bracket notation works as expected -- it
         * returns a single octet.
         *
         * The `Uint8Array` prototype remains unmodified.
         */

        function Buffer$1 (arg, encodingOrOffset, length) {
          if (!Buffer$1.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer$1)) {
            return new Buffer$1(arg, encodingOrOffset, length)
          }

          // Common case.
          if (typeof arg === 'number') {
            if (typeof encodingOrOffset === 'string') {
              throw new Error(
                'If encoding is specified then the first argument must be a string'
              )
            }
            return allocUnsafe$1(this, arg)
          }
          return from$1(this, arg, encodingOrOffset, length)
        }

        Buffer$1.poolSize = 8192; // not used by this implementation

        // TODO: Legacy, not needed anymore. Remove in next major version.
        Buffer$1._augment = function (arr) {
          arr.__proto__ = Buffer$1.prototype;
          return arr
        };

        function from$1 (that, value, encodingOrOffset, length) {
          if (typeof value === 'number') {
            throw new TypeError('"value" argument must not be a number')
          }

          if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
            return fromArrayBuffer$1(that, value, encodingOrOffset, length)
          }

          if (typeof value === 'string') {
            return fromString$1(that, value, encodingOrOffset)
          }

          return fromObject$1(that, value)
        }

        /**
         * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
         * if value is a number.
         * Buffer.from(str[, encoding])
         * Buffer.from(array)
         * Buffer.from(buffer)
         * Buffer.from(arrayBuffer[, byteOffset[, length]])
         **/
        Buffer$1.from = function (value, encodingOrOffset, length) {
          return from$1(null, value, encodingOrOffset, length)
        };

        if (Buffer$1.TYPED_ARRAY_SUPPORT) {
          Buffer$1.prototype.__proto__ = Uint8Array.prototype;
          Buffer$1.__proto__ = Uint8Array;
        }

        function assertSize$1 (size) {
          if (typeof size !== 'number') {
            throw new TypeError('"size" argument must be a number')
          } else if (size < 0) {
            throw new RangeError('"size" argument must not be negative')
          }
        }

        function alloc$1 (that, size, fill, encoding) {
          assertSize$1(size);
          if (size <= 0) {
            return createBuffer$1(that, size)
          }
          if (fill !== undefined) {
            // Only pay attention to encoding if it's a string. This
            // prevents accidentally sending in a number that would
            // be interpretted as a start offset.
            return typeof encoding === 'string'
              ? createBuffer$1(that, size).fill(fill, encoding)
              : createBuffer$1(that, size).fill(fill)
          }
          return createBuffer$1(that, size)
        }

        /**
         * Creates a new filled Buffer instance.
         * alloc(size[, fill[, encoding]])
         **/
        Buffer$1.alloc = function (size, fill, encoding) {
          return alloc$1(null, size, fill, encoding)
        };

        function allocUnsafe$1 (that, size) {
          assertSize$1(size);
          that = createBuffer$1(that, size < 0 ? 0 : checked$1(size) | 0);
          if (!Buffer$1.TYPED_ARRAY_SUPPORT) {
            for (var i = 0; i < size; ++i) {
              that[i] = 0;
            }
          }
          return that
        }

        /**
         * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
         * */
        Buffer$1.allocUnsafe = function (size) {
          return allocUnsafe$1(null, size)
        };
        /**
         * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
         */
        Buffer$1.allocUnsafeSlow = function (size) {
          return allocUnsafe$1(null, size)
        };

        function fromString$1 (that, string, encoding) {
          if (typeof encoding !== 'string' || encoding === '') {
            encoding = 'utf8';
          }

          if (!Buffer$1.isEncoding(encoding)) {
            throw new TypeError('"encoding" must be a valid string encoding')
          }

          var length = byteLength$1(string, encoding) | 0;
          that = createBuffer$1(that, length);

          var actual = that.write(string, encoding);

          if (actual !== length) {
            // Writing a hex string, for example, that contains invalid characters will
            // cause everything after the first invalid character to be ignored. (e.g.
            // 'abxxcd' will be treated as 'ab')
            that = that.slice(0, actual);
          }

          return that
        }

        function fromArrayLike$1 (that, array) {
          var length = array.length < 0 ? 0 : checked$1(array.length) | 0;
          that = createBuffer$1(that, length);
          for (var i = 0; i < length; i += 1) {
            that[i] = array[i] & 255;
          }
          return that
        }

        function fromArrayBuffer$1 (that, array, byteOffset, length) {
          array.byteLength; // this throws if `array` is not a valid ArrayBuffer

          if (byteOffset < 0 || array.byteLength < byteOffset) {
            throw new RangeError('\'offset\' is out of bounds')
          }

          if (array.byteLength < byteOffset + (length || 0)) {
            throw new RangeError('\'length\' is out of bounds')
          }

          if (byteOffset === undefined && length === undefined) {
            array = new Uint8Array(array);
          } else if (length === undefined) {
            array = new Uint8Array(array, byteOffset);
          } else {
            array = new Uint8Array(array, byteOffset, length);
          }

          if (Buffer$1.TYPED_ARRAY_SUPPORT) {
            // Return an augmented `Uint8Array` instance, for best performance
            that = array;
            that.__proto__ = Buffer$1.prototype;
          } else {
            // Fallback: Return an object instance of the Buffer class
            that = fromArrayLike$1(that, array);
          }
          return that
        }

        function fromObject$1 (that, obj) {
          if (internalIsBuffer$1(obj)) {
            var len = checked$1(obj.length) | 0;
            that = createBuffer$1(that, len);

            if (that.length === 0) {
              return that
            }

            obj.copy(that, 0, 0, len);
            return that
          }

          if (obj) {
            if ((typeof ArrayBuffer !== 'undefined' &&
                obj.buffer instanceof ArrayBuffer) || 'length' in obj) {
              if (typeof obj.length !== 'number' || isnan$1(obj.length)) {
                return createBuffer$1(that, 0)
              }
              return fromArrayLike$1(that, obj)
            }

            if (obj.type === 'Buffer' && isArray(obj.data)) {
              return fromArrayLike$1(that, obj.data)
            }
          }

          throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
        }

        function checked$1 (length) {
          // Note: cannot use `length < kMaxLength()` here because that fails when
          // length is NaN (which is otherwise coerced to zero.)
          if (length >= kMaxLength$1()) {
            throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                                 'size: 0x' + kMaxLength$1().toString(16) + ' bytes')
          }
          return length | 0
        }
        Buffer$1.isBuffer = isBuffer$1;
        function internalIsBuffer$1 (b) {
          return !!(b != null && b._isBuffer)
        }

        Buffer$1.compare = function compare (a, b) {
          if (!internalIsBuffer$1(a) || !internalIsBuffer$1(b)) {
            throw new TypeError('Arguments must be Buffers')
          }

          if (a === b) return 0

          var x = a.length;
          var y = b.length;

          for (var i = 0, len = Math.min(x, y); i < len; ++i) {
            if (a[i] !== b[i]) {
              x = a[i];
              y = b[i];
              break
            }
          }

          if (x < y) return -1
          if (y < x) return 1
          return 0
        };

        Buffer$1.isEncoding = function isEncoding (encoding) {
          switch (String(encoding).toLowerCase()) {
            case 'hex':
            case 'utf8':
            case 'utf-8':
            case 'ascii':
            case 'latin1':
            case 'binary':
            case 'base64':
            case 'ucs2':
            case 'ucs-2':
            case 'utf16le':
            case 'utf-16le':
              return true
            default:
              return false
          }
        };

        Buffer$1.concat = function concat (list, length) {
          if (!isArray(list)) {
            throw new TypeError('"list" argument must be an Array of Buffers')
          }

          if (list.length === 0) {
            return Buffer$1.alloc(0)
          }

          var i;
          if (length === undefined) {
            length = 0;
            for (i = 0; i < list.length; ++i) {
              length += list[i].length;
            }
          }

          var buffer = Buffer$1.allocUnsafe(length);
          var pos = 0;
          for (i = 0; i < list.length; ++i) {
            var buf = list[i];
            if (!internalIsBuffer$1(buf)) {
              throw new TypeError('"list" argument must be an Array of Buffers')
            }
            buf.copy(buffer, pos);
            pos += buf.length;
          }
          return buffer
        };

        function byteLength$1 (string, encoding) {
          if (internalIsBuffer$1(string)) {
            return string.length
          }
          if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' &&
              (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
            return string.byteLength
          }
          if (typeof string !== 'string') {
            string = '' + string;
          }

          var len = string.length;
          if (len === 0) return 0

          // Use a for loop to avoid recursion
          var loweredCase = false;
          for (;;) {
            switch (encoding) {
              case 'ascii':
              case 'latin1':
              case 'binary':
                return len
              case 'utf8':
              case 'utf-8':
              case undefined:
                return utf8ToBytes$1(string).length
              case 'ucs2':
              case 'ucs-2':
              case 'utf16le':
              case 'utf-16le':
                return len * 2
              case 'hex':
                return len >>> 1
              case 'base64':
                return base64ToBytes$1(string).length
              default:
                if (loweredCase) return utf8ToBytes$1(string).length // assume utf8
                encoding = ('' + encoding).toLowerCase();
                loweredCase = true;
            }
          }
        }
        Buffer$1.byteLength = byteLength$1;

        function slowToString$1 (encoding, start, end) {
          var loweredCase = false;

          // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
          // property of a typed array.

          // This behaves neither like String nor Uint8Array in that we set start/end
          // to their upper/lower bounds if the value passed is out of range.
          // undefined is handled specially as per ECMA-262 6th Edition,
          // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
          if (start === undefined || start < 0) {
            start = 0;
          }
          // Return early if start > this.length. Done here to prevent potential uint32
          // coercion fail below.
          if (start > this.length) {
            return ''
          }

          if (end === undefined || end > this.length) {
            end = this.length;
          }

          if (end <= 0) {
            return ''
          }

          // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
          end >>>= 0;
          start >>>= 0;

          if (end <= start) {
            return ''
          }

          if (!encoding) encoding = 'utf8';

          while (true) {
            switch (encoding) {
              case 'hex':
                return hexSlice$1(this, start, end)

              case 'utf8':
              case 'utf-8':
                return utf8Slice$1(this, start, end)

              case 'ascii':
                return asciiSlice$1(this, start, end)

              case 'latin1':
              case 'binary':
                return latin1Slice$1(this, start, end)

              case 'base64':
                return base64Slice$1(this, start, end)

              case 'ucs2':
              case 'ucs-2':
              case 'utf16le':
              case 'utf-16le':
                return utf16leSlice$1(this, start, end)

              default:
                if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
                encoding = (encoding + '').toLowerCase();
                loweredCase = true;
            }
          }
        }

        // The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
        // Buffer instances.
        Buffer$1.prototype._isBuffer = true;

        function swap$1 (b, n, m) {
          var i = b[n];
          b[n] = b[m];
          b[m] = i;
        }

        Buffer$1.prototype.swap16 = function swap16 () {
          var len = this.length;
          if (len % 2 !== 0) {
            throw new RangeError('Buffer size must be a multiple of 16-bits')
          }
          for (var i = 0; i < len; i += 2) {
            swap$1(this, i, i + 1);
          }
          return this
        };

        Buffer$1.prototype.swap32 = function swap32 () {
          var len = this.length;
          if (len % 4 !== 0) {
            throw new RangeError('Buffer size must be a multiple of 32-bits')
          }
          for (var i = 0; i < len; i += 4) {
            swap$1(this, i, i + 3);
            swap$1(this, i + 1, i + 2);
          }
          return this
        };

        Buffer$1.prototype.swap64 = function swap64 () {
          var len = this.length;
          if (len % 8 !== 0) {
            throw new RangeError('Buffer size must be a multiple of 64-bits')
          }
          for (var i = 0; i < len; i += 8) {
            swap$1(this, i, i + 7);
            swap$1(this, i + 1, i + 6);
            swap$1(this, i + 2, i + 5);
            swap$1(this, i + 3, i + 4);
          }
          return this
        };

        Buffer$1.prototype.toString = function toString () {
          var length = this.length | 0;
          if (length === 0) return ''
          if (arguments.length === 0) return utf8Slice$1(this, 0, length)
          return slowToString$1.apply(this, arguments)
        };

        Buffer$1.prototype.equals = function equals (b) {
          if (!internalIsBuffer$1(b)) throw new TypeError('Argument must be a Buffer')
          if (this === b) return true
          return Buffer$1.compare(this, b) === 0
        };

        Buffer$1.prototype.inspect = function inspect () {
          var str = '';
          var max = INSPECT_MAX_BYTES$1;
          if (this.length > 0) {
            str = this.toString('hex', 0, max).match(/.{2}/g).join(' ');
            if (this.length > max) str += ' ... ';
          }
          return '<Buffer ' + str + '>'
        };

        Buffer$1.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
          if (!internalIsBuffer$1(target)) {
            throw new TypeError('Argument must be a Buffer')
          }

          if (start === undefined) {
            start = 0;
          }
          if (end === undefined) {
            end = target ? target.length : 0;
          }
          if (thisStart === undefined) {
            thisStart = 0;
          }
          if (thisEnd === undefined) {
            thisEnd = this.length;
          }

          if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
            throw new RangeError('out of range index')
          }

          if (thisStart >= thisEnd && start >= end) {
            return 0
          }
          if (thisStart >= thisEnd) {
            return -1
          }
          if (start >= end) {
            return 1
          }

          start >>>= 0;
          end >>>= 0;
          thisStart >>>= 0;
          thisEnd >>>= 0;

          if (this === target) return 0

          var x = thisEnd - thisStart;
          var y = end - start;
          var len = Math.min(x, y);

          var thisCopy = this.slice(thisStart, thisEnd);
          var targetCopy = target.slice(start, end);

          for (var i = 0; i < len; ++i) {
            if (thisCopy[i] !== targetCopy[i]) {
              x = thisCopy[i];
              y = targetCopy[i];
              break
            }
          }

          if (x < y) return -1
          if (y < x) return 1
          return 0
        };

        // Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
        // OR the last index of `val` in `buffer` at offset <= `byteOffset`.
        //
        // Arguments:
        // - buffer - a Buffer to search
        // - val - a string, Buffer, or number
        // - byteOffset - an index into `buffer`; will be clamped to an int32
        // - encoding - an optional encoding, relevant is val is a string
        // - dir - true for indexOf, false for lastIndexOf
        function bidirectionalIndexOf$1 (buffer, val, byteOffset, encoding, dir) {
          // Empty buffer means no match
          if (buffer.length === 0) return -1

          // Normalize byteOffset
          if (typeof byteOffset === 'string') {
            encoding = byteOffset;
            byteOffset = 0;
          } else if (byteOffset > 0x7fffffff) {
            byteOffset = 0x7fffffff;
          } else if (byteOffset < -0x80000000) {
            byteOffset = -0x80000000;
          }
          byteOffset = +byteOffset;  // Coerce to Number.
          if (isNaN(byteOffset)) {
            // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
            byteOffset = dir ? 0 : (buffer.length - 1);
          }

          // Normalize byteOffset: negative offsets start from the end of the buffer
          if (byteOffset < 0) byteOffset = buffer.length + byteOffset;
          if (byteOffset >= buffer.length) {
            if (dir) return -1
            else byteOffset = buffer.length - 1;
          } else if (byteOffset < 0) {
            if (dir) byteOffset = 0;
            else return -1
          }

          // Normalize val
          if (typeof val === 'string') {
            val = Buffer$1.from(val, encoding);
          }

          // Finally, search either indexOf (if dir is true) or lastIndexOf
          if (internalIsBuffer$1(val)) {
            // Special case: looking for empty string/buffer always fails
            if (val.length === 0) {
              return -1
            }
            return arrayIndexOf$1(buffer, val, byteOffset, encoding, dir)
          } else if (typeof val === 'number') {
            val = val & 0xFF; // Search for a byte value [0-255]
            if (Buffer$1.TYPED_ARRAY_SUPPORT &&
                typeof Uint8Array.prototype.indexOf === 'function') {
              if (dir) {
                return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
              } else {
                return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
              }
            }
            return arrayIndexOf$1(buffer, [ val ], byteOffset, encoding, dir)
          }

          throw new TypeError('val must be string, number or Buffer')
        }

        function arrayIndexOf$1 (arr, val, byteOffset, encoding, dir) {
          var indexSize = 1;
          var arrLength = arr.length;
          var valLength = val.length;

          if (encoding !== undefined) {
            encoding = String(encoding).toLowerCase();
            if (encoding === 'ucs2' || encoding === 'ucs-2' ||
                encoding === 'utf16le' || encoding === 'utf-16le') {
              if (arr.length < 2 || val.length < 2) {
                return -1
              }
              indexSize = 2;
              arrLength /= 2;
              valLength /= 2;
              byteOffset /= 2;
            }
          }

          function read (buf, i) {
            if (indexSize === 1) {
              return buf[i]
            } else {
              return buf.readUInt16BE(i * indexSize)
            }
          }

          var i;
          if (dir) {
            var foundIndex = -1;
            for (i = byteOffset; i < arrLength; i++) {
              if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
                if (foundIndex === -1) foundIndex = i;
                if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
              } else {
                if (foundIndex !== -1) i -= i - foundIndex;
                foundIndex = -1;
              }
            }
          } else {
            if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength;
            for (i = byteOffset; i >= 0; i--) {
              var found = true;
              for (var j = 0; j < valLength; j++) {
                if (read(arr, i + j) !== read(val, j)) {
                  found = false;
                  break
                }
              }
              if (found) return i
            }
          }

          return -1
        }

        Buffer$1.prototype.includes = function includes (val, byteOffset, encoding) {
          return this.indexOf(val, byteOffset, encoding) !== -1
        };

        Buffer$1.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
          return bidirectionalIndexOf$1(this, val, byteOffset, encoding, true)
        };

        Buffer$1.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
          return bidirectionalIndexOf$1(this, val, byteOffset, encoding, false)
        };

        function hexWrite$1 (buf, string, offset, length) {
          offset = Number(offset) || 0;
          var remaining = buf.length - offset;
          if (!length) {
            length = remaining;
          } else {
            length = Number(length);
            if (length > remaining) {
              length = remaining;
            }
          }

          // must be an even number of digits
          var strLen = string.length;
          if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')

          if (length > strLen / 2) {
            length = strLen / 2;
          }
          for (var i = 0; i < length; ++i) {
            var parsed = parseInt(string.substr(i * 2, 2), 16);
            if (isNaN(parsed)) return i
            buf[offset + i] = parsed;
          }
          return i
        }

        function utf8Write$1 (buf, string, offset, length) {
          return blitBuffer$1(utf8ToBytes$1(string, buf.length - offset), buf, offset, length)
        }

        function asciiWrite$1 (buf, string, offset, length) {
          return blitBuffer$1(asciiToBytes$1(string), buf, offset, length)
        }

        function latin1Write$1 (buf, string, offset, length) {
          return asciiWrite$1(buf, string, offset, length)
        }

        function base64Write$1 (buf, string, offset, length) {
          return blitBuffer$1(base64ToBytes$1(string), buf, offset, length)
        }

        function ucs2Write$1 (buf, string, offset, length) {
          return blitBuffer$1(utf16leToBytes$1(string, buf.length - offset), buf, offset, length)
        }

        Buffer$1.prototype.write = function write (string, offset, length, encoding) {
          // Buffer#write(string)
          if (offset === undefined) {
            encoding = 'utf8';
            length = this.length;
            offset = 0;
          // Buffer#write(string, encoding)
          } else if (length === undefined && typeof offset === 'string') {
            encoding = offset;
            length = this.length;
            offset = 0;
          // Buffer#write(string, offset[, length][, encoding])
          } else if (isFinite(offset)) {
            offset = offset | 0;
            if (isFinite(length)) {
              length = length | 0;
              if (encoding === undefined) encoding = 'utf8';
            } else {
              encoding = length;
              length = undefined;
            }
          // legacy write(string, encoding, offset, length) - remove in v0.13
          } else {
            throw new Error(
              'Buffer.write(string, encoding, offset[, length]) is no longer supported'
            )
          }

          var remaining = this.length - offset;
          if (length === undefined || length > remaining) length = remaining;

          if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
            throw new RangeError('Attempt to write outside buffer bounds')
          }

          if (!encoding) encoding = 'utf8';

          var loweredCase = false;
          for (;;) {
            switch (encoding) {
              case 'hex':
                return hexWrite$1(this, string, offset, length)

              case 'utf8':
              case 'utf-8':
                return utf8Write$1(this, string, offset, length)

              case 'ascii':
                return asciiWrite$1(this, string, offset, length)

              case 'latin1':
              case 'binary':
                return latin1Write$1(this, string, offset, length)

              case 'base64':
                // Warning: maxLength not taken into account in base64Write
                return base64Write$1(this, string, offset, length)

              case 'ucs2':
              case 'ucs-2':
              case 'utf16le':
              case 'utf-16le':
                return ucs2Write$1(this, string, offset, length)

              default:
                if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
                encoding = ('' + encoding).toLowerCase();
                loweredCase = true;
            }
          }
        };

        Buffer$1.prototype.toJSON = function toJSON () {
          return {
            type: 'Buffer',
            data: Array.prototype.slice.call(this._arr || this, 0)
          }
        };

        function base64Slice$1 (buf, start, end) {
          if (start === 0 && end === buf.length) {
            return fromByteArray(buf)
          } else {
            return fromByteArray(buf.slice(start, end))
          }
        }

        function utf8Slice$1 (buf, start, end) {
          end = Math.min(buf.length, end);
          var res = [];

          var i = start;
          while (i < end) {
            var firstByte = buf[i];
            var codePoint = null;
            var bytesPerSequence = (firstByte > 0xEF) ? 4
              : (firstByte > 0xDF) ? 3
              : (firstByte > 0xBF) ? 2
              : 1;

            if (i + bytesPerSequence <= end) {
              var secondByte, thirdByte, fourthByte, tempCodePoint;

              switch (bytesPerSequence) {
                case 1:
                  if (firstByte < 0x80) {
                    codePoint = firstByte;
                  }
                  break
                case 2:
                  secondByte = buf[i + 1];
                  if ((secondByte & 0xC0) === 0x80) {
                    tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F);
                    if (tempCodePoint > 0x7F) {
                      codePoint = tempCodePoint;
                    }
                  }
                  break
                case 3:
                  secondByte = buf[i + 1];
                  thirdByte = buf[i + 2];
                  if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
                    tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F);
                    if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
                      codePoint = tempCodePoint;
                    }
                  }
                  break
                case 4:
                  secondByte = buf[i + 1];
                  thirdByte = buf[i + 2];
                  fourthByte = buf[i + 3];
                  if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
                    tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F);
                    if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
                      codePoint = tempCodePoint;
                    }
                  }
              }
            }

            if (codePoint === null) {
              // we did not generate a valid codePoint so insert a
              // replacement char (U+FFFD) and advance only 1 byte
              codePoint = 0xFFFD;
              bytesPerSequence = 1;
            } else if (codePoint > 0xFFFF) {
              // encode to utf16 (surrogate pair dance)
              codePoint -= 0x10000;
              res.push(codePoint >>> 10 & 0x3FF | 0xD800);
              codePoint = 0xDC00 | codePoint & 0x3FF;
            }

            res.push(codePoint);
            i += bytesPerSequence;
          }

          return decodeCodePointsArray$1(res)
        }

        // Based on http://stackoverflow.com/a/22747272/680742, the browser with
        // the lowest limit is Chrome, with 0x10000 args.
        // We go 1 magnitude less, for safety
        var MAX_ARGUMENTS_LENGTH$1 = 0x1000;

        function decodeCodePointsArray$1 (codePoints) {
          var len = codePoints.length;
          if (len <= MAX_ARGUMENTS_LENGTH$1) {
            return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
          }

          // Decode in chunks to avoid "call stack size exceeded".
          var res = '';
          var i = 0;
          while (i < len) {
            res += String.fromCharCode.apply(
              String,
              codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH$1)
            );
          }
          return res
        }

        function asciiSlice$1 (buf, start, end) {
          var ret = '';
          end = Math.min(buf.length, end);

          for (var i = start; i < end; ++i) {
            ret += String.fromCharCode(buf[i] & 0x7F);
          }
          return ret
        }

        function latin1Slice$1 (buf, start, end) {
          var ret = '';
          end = Math.min(buf.length, end);

          for (var i = start; i < end; ++i) {
            ret += String.fromCharCode(buf[i]);
          }
          return ret
        }

        function hexSlice$1 (buf, start, end) {
          var len = buf.length;

          if (!start || start < 0) start = 0;
          if (!end || end < 0 || end > len) end = len;

          var out = '';
          for (var i = start; i < end; ++i) {
            out += toHex$1(buf[i]);
          }
          return out
        }

        function utf16leSlice$1 (buf, start, end) {
          var bytes = buf.slice(start, end);
          var res = '';
          for (var i = 0; i < bytes.length; i += 2) {
            res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
          }
          return res
        }

        Buffer$1.prototype.slice = function slice (start, end) {
          var len = this.length;
          start = ~~start;
          end = end === undefined ? len : ~~end;

          if (start < 0) {
            start += len;
            if (start < 0) start = 0;
          } else if (start > len) {
            start = len;
          }

          if (end < 0) {
            end += len;
            if (end < 0) end = 0;
          } else if (end > len) {
            end = len;
          }

          if (end < start) end = start;

          var newBuf;
          if (Buffer$1.TYPED_ARRAY_SUPPORT) {
            newBuf = this.subarray(start, end);
            newBuf.__proto__ = Buffer$1.prototype;
          } else {
            var sliceLen = end - start;
            newBuf = new Buffer$1(sliceLen, undefined);
            for (var i = 0; i < sliceLen; ++i) {
              newBuf[i] = this[i + start];
            }
          }

          return newBuf
        };

        /*
         * Need to make sure that buffer isn't trying to write out of bounds.
         */
        function checkOffset$1 (offset, ext, length) {
          if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
          if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
        }

        Buffer$1.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
          offset = offset | 0;
          byteLength = byteLength | 0;
          if (!noAssert) checkOffset$1(offset, byteLength, this.length);

          var val = this[offset];
          var mul = 1;
          var i = 0;
          while (++i < byteLength && (mul *= 0x100)) {
            val += this[offset + i] * mul;
          }

          return val
        };

        Buffer$1.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
          offset = offset | 0;
          byteLength = byteLength | 0;
          if (!noAssert) {
            checkOffset$1(offset, byteLength, this.length);
          }

          var val = this[offset + --byteLength];
          var mul = 1;
          while (byteLength > 0 && (mul *= 0x100)) {
            val += this[offset + --byteLength] * mul;
          }

          return val
        };

        Buffer$1.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
          if (!noAssert) checkOffset$1(offset, 1, this.length);
          return this[offset]
        };

        Buffer$1.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
          if (!noAssert) checkOffset$1(offset, 2, this.length);
          return this[offset] | (this[offset + 1] << 8)
        };

        Buffer$1.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
          if (!noAssert) checkOffset$1(offset, 2, this.length);
          return (this[offset] << 8) | this[offset + 1]
        };

        Buffer$1.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
          if (!noAssert) checkOffset$1(offset, 4, this.length);

          return ((this[offset]) |
              (this[offset + 1] << 8) |
              (this[offset + 2] << 16)) +
              (this[offset + 3] * 0x1000000)
        };

        Buffer$1.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
          if (!noAssert) checkOffset$1(offset, 4, this.length);

          return (this[offset] * 0x1000000) +
            ((this[offset + 1] << 16) |
            (this[offset + 2] << 8) |
            this[offset + 3])
        };

        Buffer$1.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
          offset = offset | 0;
          byteLength = byteLength | 0;
          if (!noAssert) checkOffset$1(offset, byteLength, this.length);

          var val = this[offset];
          var mul = 1;
          var i = 0;
          while (++i < byteLength && (mul *= 0x100)) {
            val += this[offset + i] * mul;
          }
          mul *= 0x80;

          if (val >= mul) val -= Math.pow(2, 8 * byteLength);

          return val
        };

        Buffer$1.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
          offset = offset | 0;
          byteLength = byteLength | 0;
          if (!noAssert) checkOffset$1(offset, byteLength, this.length);

          var i = byteLength;
          var mul = 1;
          var val = this[offset + --i];
          while (i > 0 && (mul *= 0x100)) {
            val += this[offset + --i] * mul;
          }
          mul *= 0x80;

          if (val >= mul) val -= Math.pow(2, 8 * byteLength);

          return val
        };

        Buffer$1.prototype.readInt8 = function readInt8 (offset, noAssert) {
          if (!noAssert) checkOffset$1(offset, 1, this.length);
          if (!(this[offset] & 0x80)) return (this[offset])
          return ((0xff - this[offset] + 1) * -1)
        };

        Buffer$1.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
          if (!noAssert) checkOffset$1(offset, 2, this.length);
          var val = this[offset] | (this[offset + 1] << 8);
          return (val & 0x8000) ? val | 0xFFFF0000 : val
        };

        Buffer$1.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
          if (!noAssert) checkOffset$1(offset, 2, this.length);
          var val = this[offset + 1] | (this[offset] << 8);
          return (val & 0x8000) ? val | 0xFFFF0000 : val
        };

        Buffer$1.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
          if (!noAssert) checkOffset$1(offset, 4, this.length);

          return (this[offset]) |
            (this[offset + 1] << 8) |
            (this[offset + 2] << 16) |
            (this[offset + 3] << 24)
        };

        Buffer$1.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
          if (!noAssert) checkOffset$1(offset, 4, this.length);

          return (this[offset] << 24) |
            (this[offset + 1] << 16) |
            (this[offset + 2] << 8) |
            (this[offset + 3])
        };

        Buffer$1.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
          if (!noAssert) checkOffset$1(offset, 4, this.length);
          return read(this, offset, true, 23, 4)
        };

        Buffer$1.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
          if (!noAssert) checkOffset$1(offset, 4, this.length);
          return read(this, offset, false, 23, 4)
        };

        Buffer$1.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
          if (!noAssert) checkOffset$1(offset, 8, this.length);
          return read(this, offset, true, 52, 8)
        };

        Buffer$1.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
          if (!noAssert) checkOffset$1(offset, 8, this.length);
          return read(this, offset, false, 52, 8)
        };

        function checkInt$1 (buf, value, offset, ext, max, min) {
          if (!internalIsBuffer$1(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
          if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
          if (offset + ext > buf.length) throw new RangeError('Index out of range')
        }

        Buffer$1.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
          value = +value;
          offset = offset | 0;
          byteLength = byteLength | 0;
          if (!noAssert) {
            var maxBytes = Math.pow(2, 8 * byteLength) - 1;
            checkInt$1(this, value, offset, byteLength, maxBytes, 0);
          }

          var mul = 1;
          var i = 0;
          this[offset] = value & 0xFF;
          while (++i < byteLength && (mul *= 0x100)) {
            this[offset + i] = (value / mul) & 0xFF;
          }

          return offset + byteLength
        };

        Buffer$1.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
          value = +value;
          offset = offset | 0;
          byteLength = byteLength | 0;
          if (!noAssert) {
            var maxBytes = Math.pow(2, 8 * byteLength) - 1;
            checkInt$1(this, value, offset, byteLength, maxBytes, 0);
          }

          var i = byteLength - 1;
          var mul = 1;
          this[offset + i] = value & 0xFF;
          while (--i >= 0 && (mul *= 0x100)) {
            this[offset + i] = (value / mul) & 0xFF;
          }

          return offset + byteLength
        };

        Buffer$1.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
          value = +value;
          offset = offset | 0;
          if (!noAssert) checkInt$1(this, value, offset, 1, 0xff, 0);
          if (!Buffer$1.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
          this[offset] = (value & 0xff);
          return offset + 1
        };

        function objectWriteUInt16$1 (buf, value, offset, littleEndian) {
          if (value < 0) value = 0xffff + value + 1;
          for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
            buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
              (littleEndian ? i : 1 - i) * 8;
          }
        }

        Buffer$1.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
          value = +value;
          offset = offset | 0;
          if (!noAssert) checkInt$1(this, value, offset, 2, 0xffff, 0);
          if (Buffer$1.TYPED_ARRAY_SUPPORT) {
            this[offset] = (value & 0xff);
            this[offset + 1] = (value >>> 8);
          } else {
            objectWriteUInt16$1(this, value, offset, true);
          }
          return offset + 2
        };

        Buffer$1.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
          value = +value;
          offset = offset | 0;
          if (!noAssert) checkInt$1(this, value, offset, 2, 0xffff, 0);
          if (Buffer$1.TYPED_ARRAY_SUPPORT) {
            this[offset] = (value >>> 8);
            this[offset + 1] = (value & 0xff);
          } else {
            objectWriteUInt16$1(this, value, offset, false);
          }
          return offset + 2
        };

        function objectWriteUInt32$1 (buf, value, offset, littleEndian) {
          if (value < 0) value = 0xffffffff + value + 1;
          for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
            buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff;
          }
        }

        Buffer$1.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
          value = +value;
          offset = offset | 0;
          if (!noAssert) checkInt$1(this, value, offset, 4, 0xffffffff, 0);
          if (Buffer$1.TYPED_ARRAY_SUPPORT) {
            this[offset + 3] = (value >>> 24);
            this[offset + 2] = (value >>> 16);
            this[offset + 1] = (value >>> 8);
            this[offset] = (value & 0xff);
          } else {
            objectWriteUInt32$1(this, value, offset, true);
          }
          return offset + 4
        };

        Buffer$1.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
          value = +value;
          offset = offset | 0;
          if (!noAssert) checkInt$1(this, value, offset, 4, 0xffffffff, 0);
          if (Buffer$1.TYPED_ARRAY_SUPPORT) {
            this[offset] = (value >>> 24);
            this[offset + 1] = (value >>> 16);
            this[offset + 2] = (value >>> 8);
            this[offset + 3] = (value & 0xff);
          } else {
            objectWriteUInt32$1(this, value, offset, false);
          }
          return offset + 4
        };

        Buffer$1.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
          value = +value;
          offset = offset | 0;
          if (!noAssert) {
            var limit = Math.pow(2, 8 * byteLength - 1);

            checkInt$1(this, value, offset, byteLength, limit - 1, -limit);
          }

          var i = 0;
          var mul = 1;
          var sub = 0;
          this[offset] = value & 0xFF;
          while (++i < byteLength && (mul *= 0x100)) {
            if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
              sub = 1;
            }
            this[offset + i] = ((value / mul) >> 0) - sub & 0xFF;
          }

          return offset + byteLength
        };

        Buffer$1.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
          value = +value;
          offset = offset | 0;
          if (!noAssert) {
            var limit = Math.pow(2, 8 * byteLength - 1);

            checkInt$1(this, value, offset, byteLength, limit - 1, -limit);
          }

          var i = byteLength - 1;
          var mul = 1;
          var sub = 0;
          this[offset + i] = value & 0xFF;
          while (--i >= 0 && (mul *= 0x100)) {
            if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
              sub = 1;
            }
            this[offset + i] = ((value / mul) >> 0) - sub & 0xFF;
          }

          return offset + byteLength
        };

        Buffer$1.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
          value = +value;
          offset = offset | 0;
          if (!noAssert) checkInt$1(this, value, offset, 1, 0x7f, -0x80);
          if (!Buffer$1.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
          if (value < 0) value = 0xff + value + 1;
          this[offset] = (value & 0xff);
          return offset + 1
        };

        Buffer$1.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
          value = +value;
          offset = offset | 0;
          if (!noAssert) checkInt$1(this, value, offset, 2, 0x7fff, -0x8000);
          if (Buffer$1.TYPED_ARRAY_SUPPORT) {
            this[offset] = (value & 0xff);
            this[offset + 1] = (value >>> 8);
          } else {
            objectWriteUInt16$1(this, value, offset, true);
          }
          return offset + 2
        };

        Buffer$1.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
          value = +value;
          offset = offset | 0;
          if (!noAssert) checkInt$1(this, value, offset, 2, 0x7fff, -0x8000);
          if (Buffer$1.TYPED_ARRAY_SUPPORT) {
            this[offset] = (value >>> 8);
            this[offset + 1] = (value & 0xff);
          } else {
            objectWriteUInt16$1(this, value, offset, false);
          }
          return offset + 2
        };

        Buffer$1.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
          value = +value;
          offset = offset | 0;
          if (!noAssert) checkInt$1(this, value, offset, 4, 0x7fffffff, -0x80000000);
          if (Buffer$1.TYPED_ARRAY_SUPPORT) {
            this[offset] = (value & 0xff);
            this[offset + 1] = (value >>> 8);
            this[offset + 2] = (value >>> 16);
            this[offset + 3] = (value >>> 24);
          } else {
            objectWriteUInt32$1(this, value, offset, true);
          }
          return offset + 4
        };

        Buffer$1.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
          value = +value;
          offset = offset | 0;
          if (!noAssert) checkInt$1(this, value, offset, 4, 0x7fffffff, -0x80000000);
          if (value < 0) value = 0xffffffff + value + 1;
          if (Buffer$1.TYPED_ARRAY_SUPPORT) {
            this[offset] = (value >>> 24);
            this[offset + 1] = (value >>> 16);
            this[offset + 2] = (value >>> 8);
            this[offset + 3] = (value & 0xff);
          } else {
            objectWriteUInt32$1(this, value, offset, false);
          }
          return offset + 4
        };

        function checkIEEE754$1 (buf, value, offset, ext, max, min) {
          if (offset + ext > buf.length) throw new RangeError('Index out of range')
          if (offset < 0) throw new RangeError('Index out of range')
        }

        function writeFloat$1 (buf, value, offset, littleEndian, noAssert) {
          if (!noAssert) {
            checkIEEE754$1(buf, value, offset, 4);
          }
          write(buf, value, offset, littleEndian, 23, 4);
          return offset + 4
        }

        Buffer$1.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
          return writeFloat$1(this, value, offset, true, noAssert)
        };

        Buffer$1.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
          return writeFloat$1(this, value, offset, false, noAssert)
        };

        function writeDouble$1 (buf, value, offset, littleEndian, noAssert) {
          if (!noAssert) {
            checkIEEE754$1(buf, value, offset, 8);
          }
          write(buf, value, offset, littleEndian, 52, 8);
          return offset + 8
        }

        Buffer$1.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
          return writeDouble$1(this, value, offset, true, noAssert)
        };

        Buffer$1.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
          return writeDouble$1(this, value, offset, false, noAssert)
        };

        // copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
        Buffer$1.prototype.copy = function copy (target, targetStart, start, end) {
          if (!start) start = 0;
          if (!end && end !== 0) end = this.length;
          if (targetStart >= target.length) targetStart = target.length;
          if (!targetStart) targetStart = 0;
          if (end > 0 && end < start) end = start;

          // Copy 0 bytes; we're done
          if (end === start) return 0
          if (target.length === 0 || this.length === 0) return 0

          // Fatal error conditions
          if (targetStart < 0) {
            throw new RangeError('targetStart out of bounds')
          }
          if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
          if (end < 0) throw new RangeError('sourceEnd out of bounds')

          // Are we oob?
          if (end > this.length) end = this.length;
          if (target.length - targetStart < end - start) {
            end = target.length - targetStart + start;
          }

          var len = end - start;
          var i;

          if (this === target && start < targetStart && targetStart < end) {
            // descending copy from end
            for (i = len - 1; i >= 0; --i) {
              target[i + targetStart] = this[i + start];
            }
          } else if (len < 1000 || !Buffer$1.TYPED_ARRAY_SUPPORT) {
            // ascending copy from start
            for (i = 0; i < len; ++i) {
              target[i + targetStart] = this[i + start];
            }
          } else {
            Uint8Array.prototype.set.call(
              target,
              this.subarray(start, start + len),
              targetStart
            );
          }

          return len
        };

        // Usage:
        //    buffer.fill(number[, offset[, end]])
        //    buffer.fill(buffer[, offset[, end]])
        //    buffer.fill(string[, offset[, end]][, encoding])
        Buffer$1.prototype.fill = function fill (val, start, end, encoding) {
          // Handle string cases:
          if (typeof val === 'string') {
            if (typeof start === 'string') {
              encoding = start;
              start = 0;
              end = this.length;
            } else if (typeof end === 'string') {
              encoding = end;
              end = this.length;
            }
            if (val.length === 1) {
              var code = val.charCodeAt(0);
              if (code < 256) {
                val = code;
              }
            }
            if (encoding !== undefined && typeof encoding !== 'string') {
              throw new TypeError('encoding must be a string')
            }
            if (typeof encoding === 'string' && !Buffer$1.isEncoding(encoding)) {
              throw new TypeError('Unknown encoding: ' + encoding)
            }
          } else if (typeof val === 'number') {
            val = val & 255;
          }

          // Invalid ranges are not set to a default, so can range check early.
          if (start < 0 || this.length < start || this.length < end) {
            throw new RangeError('Out of range index')
          }

          if (end <= start) {
            return this
          }

          start = start >>> 0;
          end = end === undefined ? this.length : end >>> 0;

          if (!val) val = 0;

          var i;
          if (typeof val === 'number') {
            for (i = start; i < end; ++i) {
              this[i] = val;
            }
          } else {
            var bytes = internalIsBuffer$1(val)
              ? val
              : utf8ToBytes$1(new Buffer$1(val, encoding).toString());
            var len = bytes.length;
            for (i = 0; i < end - start; ++i) {
              this[i + start] = bytes[i % len];
            }
          }

          return this
        };

        // HELPER FUNCTIONS
        // ================

        var INVALID_BASE64_RE$1 = /[^+\/0-9A-Za-z-_]/g;

        function base64clean$1 (str) {
          // Node strips out invalid characters like \n and \t from the string, base64-js does not
          str = stringtrim$1(str).replace(INVALID_BASE64_RE$1, '');
          // Node converts strings with length < 2 to ''
          if (str.length < 2) return ''
          // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
          while (str.length % 4 !== 0) {
            str = str + '=';
          }
          return str
        }

        function stringtrim$1 (str) {
          if (str.trim) return str.trim()
          return str.replace(/^\s+|\s+$/g, '')
        }

        function toHex$1 (n) {
          if (n < 16) return '0' + n.toString(16)
          return n.toString(16)
        }

        function utf8ToBytes$1 (string, units) {
          units = units || Infinity;
          var codePoint;
          var length = string.length;
          var leadSurrogate = null;
          var bytes = [];

          for (var i = 0; i < length; ++i) {
            codePoint = string.charCodeAt(i);

            // is surrogate component
            if (codePoint > 0xD7FF && codePoint < 0xE000) {
              // last char was a lead
              if (!leadSurrogate) {
                // no lead yet
                if (codePoint > 0xDBFF) {
                  // unexpected trail
                  if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
                  continue
                } else if (i + 1 === length) {
                  // unpaired lead
                  if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
                  continue
                }

                // valid lead
                leadSurrogate = codePoint;

                continue
              }

              // 2 leads in a row
              if (codePoint < 0xDC00) {
                if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
                leadSurrogate = codePoint;
                continue
              }

              // valid surrogate pair
              codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000;
            } else if (leadSurrogate) {
              // valid bmp char, but last char was a lead
              if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
            }

            leadSurrogate = null;

            // encode utf8
            if (codePoint < 0x80) {
              if ((units -= 1) < 0) break
              bytes.push(codePoint);
            } else if (codePoint < 0x800) {
              if ((units -= 2) < 0) break
              bytes.push(
                codePoint >> 0x6 | 0xC0,
                codePoint & 0x3F | 0x80
              );
            } else if (codePoint < 0x10000) {
              if ((units -= 3) < 0) break
              bytes.push(
                codePoint >> 0xC | 0xE0,
                codePoint >> 0x6 & 0x3F | 0x80,
                codePoint & 0x3F | 0x80
              );
            } else if (codePoint < 0x110000) {
              if ((units -= 4) < 0) break
              bytes.push(
                codePoint >> 0x12 | 0xF0,
                codePoint >> 0xC & 0x3F | 0x80,
                codePoint >> 0x6 & 0x3F | 0x80,
                codePoint & 0x3F | 0x80
              );
            } else {
              throw new Error('Invalid code point')
            }
          }

          return bytes
        }

        function asciiToBytes$1 (str) {
          var byteArray = [];
          for (var i = 0; i < str.length; ++i) {
            // Node's code seems to be doing this and not & 0x7F..
            byteArray.push(str.charCodeAt(i) & 0xFF);
          }
          return byteArray
        }

        function utf16leToBytes$1 (str, units) {
          var c, hi, lo;
          var byteArray = [];
          for (var i = 0; i < str.length; ++i) {
            if ((units -= 2) < 0) break

            c = str.charCodeAt(i);
            hi = c >> 8;
            lo = c % 256;
            byteArray.push(lo);
            byteArray.push(hi);
          }

          return byteArray
        }


        function base64ToBytes$1 (str) {
          return toByteArray(base64clean$1(str))
        }

        function blitBuffer$1 (src, dst, offset, length) {
          for (var i = 0; i < length; ++i) {
            if ((i + offset >= dst.length) || (i >= src.length)) break
            dst[i + offset] = src[i];
          }
          return i
        }

        function isnan$1 (val) {
          return val !== val // eslint-disable-line no-self-compare
        }


        // the following is from is-buffer, also by Feross Aboukhadijeh and with same lisence
        // The _isBuffer check is for Safari 5-7 support, because it's missing
        // Object.prototype.constructor. Remove this eventually
        function isBuffer$1(obj) {
          return obj != null && (!!obj._isBuffer || isFastBuffer$1(obj) || isSlowBuffer$1(obj))
        }

        function isFastBuffer$1 (obj) {
          return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
        }

        // For Node v0.10 support. Remove this eventually.
        function isSlowBuffer$1 (obj) {
          return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isFastBuffer$1(obj.slice(0, 0))
        }

        function BufferList() {
          this.head = null;
          this.tail = null;
          this.length = 0;
        }

        BufferList.prototype.push = function (v) {
          var entry = { data: v, next: null };
          if (this.length > 0) this.tail.next = entry;else this.head = entry;
          this.tail = entry;
          ++this.length;
        };

        BufferList.prototype.unshift = function (v) {
          var entry = { data: v, next: this.head };
          if (this.length === 0) this.tail = entry;
          this.head = entry;
          ++this.length;
        };

        BufferList.prototype.shift = function () {
          if (this.length === 0) return;
          var ret = this.head.data;
          if (this.length === 1) this.head = this.tail = null;else this.head = this.head.next;
          --this.length;
          return ret;
        };

        BufferList.prototype.clear = function () {
          this.head = this.tail = null;
          this.length = 0;
        };

        BufferList.prototype.join = function (s) {
          if (this.length === 0) return '';
          var p = this.head;
          var ret = '' + p.data;
          while (p = p.next) {
            ret += s + p.data;
          }return ret;
        };

        BufferList.prototype.concat = function (n) {
          if (this.length === 0) return Buffer$1.alloc(0);
          if (this.length === 1) return this.head.data;
          var ret = Buffer$1.allocUnsafe(n >>> 0);
          var p = this.head;
          var i = 0;
          while (p) {
            p.data.copy(ret, i);
            i += p.data.length;
            p = p.next;
          }
          return ret;
        };

        // Copyright Joyent, Inc. and other Node contributors.
        var isBufferEncoding = Buffer$1.isEncoding
          || function(encoding) {
               switch (encoding && encoding.toLowerCase()) {
                 case 'hex': case 'utf8': case 'utf-8': case 'ascii': case 'binary': case 'base64': case 'ucs2': case 'ucs-2': case 'utf16le': case 'utf-16le': case 'raw': return true;
                 default: return false;
               }
             };


        function assertEncoding(encoding) {
          if (encoding && !isBufferEncoding(encoding)) {
            throw new Error('Unknown encoding: ' + encoding);
          }
        }

        // StringDecoder provides an interface for efficiently splitting a series of
        // buffers into a series of JS strings without breaking apart multi-byte
        // characters. CESU-8 is handled as part of the UTF-8 encoding.
        //
        // @TODO Handling all encodings inside a single object makes it very difficult
        // to reason about this code, so it should be split up in the future.
        // @TODO There should be a utf8-strict encoding that rejects invalid UTF-8 code
        // points as used by CESU-8.
        function StringDecoder(encoding) {
          this.encoding = (encoding || 'utf8').toLowerCase().replace(/[-_]/, '');
          assertEncoding(encoding);
          switch (this.encoding) {
            case 'utf8':
              // CESU-8 represents each of Surrogate Pair by 3-bytes
              this.surrogateSize = 3;
              break;
            case 'ucs2':
            case 'utf16le':
              // UTF-16 represents each of Surrogate Pair by 2-bytes
              this.surrogateSize = 2;
              this.detectIncompleteChar = utf16DetectIncompleteChar;
              break;
            case 'base64':
              // Base-64 stores 3 bytes in 4 chars, and pads the remainder.
              this.surrogateSize = 3;
              this.detectIncompleteChar = base64DetectIncompleteChar;
              break;
            default:
              this.write = passThroughWrite;
              return;
          }

          // Enough space to store all bytes of a single character. UTF-8 needs 4
          // bytes, but CESU-8 may require up to 6 (3 bytes per surrogate).
          this.charBuffer = new Buffer$1(6);
          // Number of bytes received for the current incomplete multi-byte character.
          this.charReceived = 0;
          // Number of bytes expected for the current incomplete multi-byte character.
          this.charLength = 0;
        }

        // write decodes the given buffer and returns it as JS string that is
        // guaranteed to not contain any partial multi-byte characters. Any partial
        // character found at the end of the buffer is buffered up, and will be
        // returned when calling write again with the remaining bytes.
        //
        // Note: Converting a Buffer containing an orphan surrogate to a String
        // currently works, but converting a String to a Buffer (via `new Buffer`, or
        // Buffer#write) will replace incomplete surrogates with the unicode
        // replacement character. See https://codereview.chromium.org/121173009/ .
        StringDecoder.prototype.write = function(buffer) {
          var charStr = '';
          // if our last write ended with an incomplete multibyte character
          while (this.charLength) {
            // determine how many remaining bytes this buffer has to offer for this char
            var available = (buffer.length >= this.charLength - this.charReceived) ?
                this.charLength - this.charReceived :
                buffer.length;

            // add the new bytes to the char buffer
            buffer.copy(this.charBuffer, this.charReceived, 0, available);
            this.charReceived += available;

            if (this.charReceived < this.charLength) {
              // still not enough chars in this buffer? wait for more ...
              return '';
            }

            // remove bytes belonging to the current character from the buffer
            buffer = buffer.slice(available, buffer.length);

            // get the character that was split
            charStr = this.charBuffer.slice(0, this.charLength).toString(this.encoding);

            // CESU-8: lead surrogate (D800-DBFF) is also the incomplete character
            var charCode = charStr.charCodeAt(charStr.length - 1);
            if (charCode >= 0xD800 && charCode <= 0xDBFF) {
              this.charLength += this.surrogateSize;
              charStr = '';
              continue;
            }
            this.charReceived = this.charLength = 0;

            // if there are no more bytes in this buffer, just emit our char
            if (buffer.length === 0) {
              return charStr;
            }
            break;
          }

          // determine and set charLength / charReceived
          this.detectIncompleteChar(buffer);

          var end = buffer.length;
          if (this.charLength) {
            // buffer the incomplete character bytes we got
            buffer.copy(this.charBuffer, 0, buffer.length - this.charReceived, end);
            end -= this.charReceived;
          }

          charStr += buffer.toString(this.encoding, 0, end);

          var end = charStr.length - 1;
          var charCode = charStr.charCodeAt(end);
          // CESU-8: lead surrogate (D800-DBFF) is also the incomplete character
          if (charCode >= 0xD800 && charCode <= 0xDBFF) {
            var size = this.surrogateSize;
            this.charLength += size;
            this.charReceived += size;
            this.charBuffer.copy(this.charBuffer, size, 0, size);
            buffer.copy(this.charBuffer, 0, 0, size);
            return charStr.substring(0, end);
          }

          // or just emit the charStr
          return charStr;
        };

        // detectIncompleteChar determines if there is an incomplete UTF-8 character at
        // the end of the given buffer. If so, it sets this.charLength to the byte
        // length that character, and sets this.charReceived to the number of bytes
        // that are available for this character.
        StringDecoder.prototype.detectIncompleteChar = function(buffer) {
          // determine how many bytes we have to check at the end of this buffer
          var i = (buffer.length >= 3) ? 3 : buffer.length;

          // Figure out if one of the last i bytes of our buffer announces an
          // incomplete char.
          for (; i > 0; i--) {
            var c = buffer[buffer.length - i];

            // See http://en.wikipedia.org/wiki/UTF-8#Description

            // 110XXXXX
            if (i == 1 && c >> 5 == 0x06) {
              this.charLength = 2;
              break;
            }

            // 1110XXXX
            if (i <= 2 && c >> 4 == 0x0E) {
              this.charLength = 3;
              break;
            }

            // 11110XXX
            if (i <= 3 && c >> 3 == 0x1E) {
              this.charLength = 4;
              break;
            }
          }
          this.charReceived = i;
        };

        StringDecoder.prototype.end = function(buffer) {
          var res = '';
          if (buffer && buffer.length)
            res = this.write(buffer);

          if (this.charReceived) {
            var cr = this.charReceived;
            var buf = this.charBuffer;
            var enc = this.encoding;
            res += buf.slice(0, cr).toString(enc);
          }

          return res;
        };

        function passThroughWrite(buffer) {
          return buffer.toString(this.encoding);
        }

        function utf16DetectIncompleteChar(buffer) {
          this.charReceived = buffer.length % 2;
          this.charLength = this.charReceived ? 2 : 0;
        }

        function base64DetectIncompleteChar(buffer) {
          this.charReceived = buffer.length % 3;
          this.charLength = this.charReceived ? 3 : 0;
        }

        Readable.ReadableState = ReadableState;

        var debug = debuglog('stream');
        inherits$1(Readable, EventEmitter);

        function prependListener(emitter, event, fn) {
          // Sadly this is not cacheable as some libraries bundle their own
          // event emitter implementation with them.
          if (typeof emitter.prependListener === 'function') {
            return emitter.prependListener(event, fn);
          } else {
            // This is a hack to make sure that our error handler is attached before any
            // userland ones.  NEVER DO THIS. This is here only because this code needs
            // to continue to work with older versions of Node.js that do not include
            // the prependListener() method. The goal is to eventually remove this hack.
            if (!emitter._events || !emitter._events[event])
              emitter.on(event, fn);
            else if (Array.isArray(emitter._events[event]))
              emitter._events[event].unshift(fn);
            else
              emitter._events[event] = [fn, emitter._events[event]];
          }
        }
        function listenerCount$1 (emitter, type) {
          return emitter.listeners(type).length;
        }
        function ReadableState(options, stream) {

          options = options || {};

          // object stream flag. Used to make read(n) ignore n and to
          // make all the buffer merging and length checks go away
          this.objectMode = !!options.objectMode;

          if (stream instanceof Duplex) this.objectMode = this.objectMode || !!options.readableObjectMode;

          // the point at which it stops calling _read() to fill the buffer
          // Note: 0 is a valid value, means "don't call _read preemptively ever"
          var hwm = options.highWaterMark;
          var defaultHwm = this.objectMode ? 16 : 16 * 1024;
          this.highWaterMark = hwm || hwm === 0 ? hwm : defaultHwm;

          // cast to ints.
          this.highWaterMark = ~ ~this.highWaterMark;

          // A linked list is used to store data chunks instead of an array because the
          // linked list can remove elements from the beginning faster than
          // array.shift()
          this.buffer = new BufferList();
          this.length = 0;
          this.pipes = null;
          this.pipesCount = 0;
          this.flowing = null;
          this.ended = false;
          this.endEmitted = false;
          this.reading = false;

          // a flag to be able to tell if the onwrite cb is called immediately,
          // or on a later tick.  We set this to true at first, because any
          // actions that shouldn't happen until "later" should generally also
          // not happen before the first write call.
          this.sync = true;

          // whenever we return null, then we set a flag to say
          // that we're awaiting a 'readable' event emission.
          this.needReadable = false;
          this.emittedReadable = false;
          this.readableListening = false;
          this.resumeScheduled = false;

          // Crypto is kind of old and crusty.  Historically, its default string
          // encoding is 'binary' so we have to make this configurable.
          // Everything else in the universe uses 'utf8', though.
          this.defaultEncoding = options.defaultEncoding || 'utf8';

          // when piping, we only care about 'readable' events that happen
          // after read()ing all the bytes and not getting any pushback.
          this.ranOut = false;

          // the number of writers that are awaiting a drain event in .pipe()s
          this.awaitDrain = 0;

          // if true, a maybeReadMore has been scheduled
          this.readingMore = false;

          this.decoder = null;
          this.encoding = null;
          if (options.encoding) {
            this.decoder = new StringDecoder(options.encoding);
            this.encoding = options.encoding;
          }
        }
        function Readable(options) {

          if (!(this instanceof Readable)) return new Readable(options);

          this._readableState = new ReadableState(options, this);

          // legacy
          this.readable = true;

          if (options && typeof options.read === 'function') this._read = options.read;

          EventEmitter.call(this);
        }

        // Manually shove something into the read() buffer.
        // This returns true if the highWaterMark has not been hit yet,
        // similar to how Writable.write() returns true if you should
        // write() some more.
        Readable.prototype.push = function (chunk, encoding) {
          var state = this._readableState;

          if (!state.objectMode && typeof chunk === 'string') {
            encoding = encoding || state.defaultEncoding;
            if (encoding !== state.encoding) {
              chunk = Buffer.from(chunk, encoding);
              encoding = '';
            }
          }

          return readableAddChunk(this, state, chunk, encoding, false);
        };

        // Unshift should *always* be something directly out of read()
        Readable.prototype.unshift = function (chunk) {
          var state = this._readableState;
          return readableAddChunk(this, state, chunk, '', true);
        };

        Readable.prototype.isPaused = function () {
          return this._readableState.flowing === false;
        };

        function readableAddChunk(stream, state, chunk, encoding, addToFront) {
          var er = chunkInvalid(state, chunk);
          if (er) {
            stream.emit('error', er);
          } else if (chunk === null) {
            state.reading = false;
            onEofChunk(stream, state);
          } else if (state.objectMode || chunk && chunk.length > 0) {
            if (state.ended && !addToFront) {
              var e = new Error('stream.push() after EOF');
              stream.emit('error', e);
            } else if (state.endEmitted && addToFront) {
              var _e = new Error('stream.unshift() after end event');
              stream.emit('error', _e);
            } else {
              var skipAdd;
              if (state.decoder && !addToFront && !encoding) {
                chunk = state.decoder.write(chunk);
                skipAdd = !state.objectMode && chunk.length === 0;
              }

              if (!addToFront) state.reading = false;

              // Don't add to the buffer if we've decoded to an empty string chunk and
              // we're not in object mode
              if (!skipAdd) {
                // if we want the data now, just emit it.
                if (state.flowing && state.length === 0 && !state.sync) {
                  stream.emit('data', chunk);
                  stream.read(0);
                } else {
                  // update the buffer info.
                  state.length += state.objectMode ? 1 : chunk.length;
                  if (addToFront) state.buffer.unshift(chunk);else state.buffer.push(chunk);

                  if (state.needReadable) emitReadable(stream);
                }
              }

              maybeReadMore(stream, state);
            }
          } else if (!addToFront) {
            state.reading = false;
          }

          return needMoreData(state);
        }

        // if it's past the high water mark, we can push in some more.
        // Also, if we have no data yet, we can stand some
        // more bytes.  This is to work around cases where hwm=0,
        // such as the repl.  Also, if the push() triggered a
        // readable event, and the user called read(largeNumber) such that
        // needReadable was set, then we ought to push more, so that another
        // 'readable' event will be triggered.
        function needMoreData(state) {
          return !state.ended && (state.needReadable || state.length < state.highWaterMark || state.length === 0);
        }

        // backwards compatibility.
        Readable.prototype.setEncoding = function (enc) {
          this._readableState.decoder = new StringDecoder(enc);
          this._readableState.encoding = enc;
          return this;
        };

        // Don't raise the hwm > 8MB
        var MAX_HWM = 0x800000;
        function computeNewHighWaterMark(n) {
          if (n >= MAX_HWM) {
            n = MAX_HWM;
          } else {
            // Get the next highest power of 2 to prevent increasing hwm excessively in
            // tiny amounts
            n--;
            n |= n >>> 1;
            n |= n >>> 2;
            n |= n >>> 4;
            n |= n >>> 8;
            n |= n >>> 16;
            n++;
          }
          return n;
        }

        // This function is designed to be inlinable, so please take care when making
        // changes to the function body.
        function howMuchToRead(n, state) {
          if (n <= 0 || state.length === 0 && state.ended) return 0;
          if (state.objectMode) return 1;
          if (n !== n) {
            // Only flow one buffer at a time
            if (state.flowing && state.length) return state.buffer.head.data.length;else return state.length;
          }
          // If we're asking for more than the current hwm, then raise the hwm.
          if (n > state.highWaterMark) state.highWaterMark = computeNewHighWaterMark(n);
          if (n <= state.length) return n;
          // Don't have enough
          if (!state.ended) {
            state.needReadable = true;
            return 0;
          }
          return state.length;
        }

        // you can override either this method, or the async _read(n) below.
        Readable.prototype.read = function (n) {
          debug('read', n);
          n = parseInt(n, 10);
          var state = this._readableState;
          var nOrig = n;

          if (n !== 0) state.emittedReadable = false;

          // if we're doing read(0) to trigger a readable event, but we
          // already have a bunch of data in the buffer, then just trigger
          // the 'readable' event and move on.
          if (n === 0 && state.needReadable && (state.length >= state.highWaterMark || state.ended)) {
            debug('read: emitReadable', state.length, state.ended);
            if (state.length === 0 && state.ended) endReadable(this);else emitReadable(this);
            return null;
          }

          n = howMuchToRead(n, state);

          // if we've ended, and we're now clear, then finish it up.
          if (n === 0 && state.ended) {
            if (state.length === 0) endReadable(this);
            return null;
          }

          // All the actual chunk generation logic needs to be
          // *below* the call to _read.  The reason is that in certain
          // synthetic stream cases, such as passthrough streams, _read
          // may be a completely synchronous operation which may change
          // the state of the read buffer, providing enough data when
          // before there was *not* enough.
          //
          // So, the steps are:
          // 1. Figure out what the state of things will be after we do
          // a read from the buffer.
          //
          // 2. If that resulting state will trigger a _read, then call _read.
          // Note that this may be asynchronous, or synchronous.  Yes, it is
          // deeply ugly to write APIs this way, but that still doesn't mean
          // that the Readable class should behave improperly, as streams are
          // designed to be sync/async agnostic.
          // Take note if the _read call is sync or async (ie, if the read call
          // has returned yet), so that we know whether or not it's safe to emit
          // 'readable' etc.
          //
          // 3. Actually pull the requested chunks out of the buffer and return.

          // if we need a readable event, then we need to do some reading.
          var doRead = state.needReadable;
          debug('need readable', doRead);

          // if we currently have less than the highWaterMark, then also read some
          if (state.length === 0 || state.length - n < state.highWaterMark) {
            doRead = true;
            debug('length less than watermark', doRead);
          }

          // however, if we've ended, then there's no point, and if we're already
          // reading, then it's unnecessary.
          if (state.ended || state.reading) {
            doRead = false;
            debug('reading or ended', doRead);
          } else if (doRead) {
            debug('do read');
            state.reading = true;
            state.sync = true;
            // if the length is currently zero, then we *need* a readable event.
            if (state.length === 0) state.needReadable = true;
            // call internal read method
            this._read(state.highWaterMark);
            state.sync = false;
            // If _read pushed data synchronously, then `reading` will be false,
            // and we need to re-evaluate how much data we can return to the user.
            if (!state.reading) n = howMuchToRead(nOrig, state);
          }

          var ret;
          if (n > 0) ret = fromList(n, state);else ret = null;

          if (ret === null) {
            state.needReadable = true;
            n = 0;
          } else {
            state.length -= n;
          }

          if (state.length === 0) {
            // If we have nothing in the buffer, then we want to know
            // as soon as we *do* get something into the buffer.
            if (!state.ended) state.needReadable = true;

            // If we tried to read() past the EOF, then emit end on the next tick.
            if (nOrig !== n && state.ended) endReadable(this);
          }

          if (ret !== null) this.emit('data', ret);

          return ret;
        };

        function chunkInvalid(state, chunk) {
          var er = null;
          if (!isBuffer(chunk) && typeof chunk !== 'string' && chunk !== null && chunk !== undefined && !state.objectMode) {
            er = new TypeError('Invalid non-string/buffer chunk');
          }
          return er;
        }

        function onEofChunk(stream, state) {
          if (state.ended) return;
          if (state.decoder) {
            var chunk = state.decoder.end();
            if (chunk && chunk.length) {
              state.buffer.push(chunk);
              state.length += state.objectMode ? 1 : chunk.length;
            }
          }
          state.ended = true;

          // emit 'readable' now to make sure it gets picked up.
          emitReadable(stream);
        }

        // Don't emit readable right away in sync mode, because this can trigger
        // another read() call => stack overflow.  This way, it might trigger
        // a nextTick recursion warning, but that's not so bad.
        function emitReadable(stream) {
          var state = stream._readableState;
          state.needReadable = false;
          if (!state.emittedReadable) {
            debug('emitReadable', state.flowing);
            state.emittedReadable = true;
            if (state.sync) nextTick(emitReadable_, stream);else emitReadable_(stream);
          }
        }

        function emitReadable_(stream) {
          debug('emit readable');
          stream.emit('readable');
          flow(stream);
        }

        // at this point, the user has presumably seen the 'readable' event,
        // and called read() to consume some data.  that may have triggered
        // in turn another _read(n) call, in which case reading = true if
        // it's in progress.
        // However, if we're not ended, or reading, and the length < hwm,
        // then go ahead and try to read some more preemptively.
        function maybeReadMore(stream, state) {
          if (!state.readingMore) {
            state.readingMore = true;
            nextTick(maybeReadMore_, stream, state);
          }
        }

        function maybeReadMore_(stream, state) {
          var len = state.length;
          while (!state.reading && !state.flowing && !state.ended && state.length < state.highWaterMark) {
            debug('maybeReadMore read 0');
            stream.read(0);
            if (len === state.length)
              // didn't get any data, stop spinning.
              break;else len = state.length;
          }
          state.readingMore = false;
        }

        // abstract method.  to be overridden in specific implementation classes.
        // call cb(er, data) where data is <= n in length.
        // for virtual (non-string, non-buffer) streams, "length" is somewhat
        // arbitrary, and perhaps not very meaningful.
        Readable.prototype._read = function (n) {
          this.emit('error', new Error('not implemented'));
        };

        Readable.prototype.pipe = function (dest, pipeOpts) {
          var src = this;
          var state = this._readableState;

          switch (state.pipesCount) {
            case 0:
              state.pipes = dest;
              break;
            case 1:
              state.pipes = [state.pipes, dest];
              break;
            default:
              state.pipes.push(dest);
              break;
          }
          state.pipesCount += 1;
          debug('pipe count=%d opts=%j', state.pipesCount, pipeOpts);

          var doEnd = (!pipeOpts || pipeOpts.end !== false);

          var endFn = doEnd ? onend : cleanup;
          if (state.endEmitted) nextTick(endFn);else src.once('end', endFn);

          dest.on('unpipe', onunpipe);
          function onunpipe(readable) {
            debug('onunpipe');
            if (readable === src) {
              cleanup();
            }
          }

          function onend() {
            debug('onend');
            dest.end();
          }

          // when the dest drains, it reduces the awaitDrain counter
          // on the source.  This would be more elegant with a .once()
          // handler in flow(), but adding and removing repeatedly is
          // too slow.
          var ondrain = pipeOnDrain(src);
          dest.on('drain', ondrain);

          var cleanedUp = false;
          function cleanup() {
            debug('cleanup');
            // cleanup event handlers once the pipe is broken
            dest.removeListener('close', onclose);
            dest.removeListener('finish', onfinish);
            dest.removeListener('drain', ondrain);
            dest.removeListener('error', onerror);
            dest.removeListener('unpipe', onunpipe);
            src.removeListener('end', onend);
            src.removeListener('end', cleanup);
            src.removeListener('data', ondata);

            cleanedUp = true;

            // if the reader is waiting for a drain event from this
            // specific writer, then it would cause it to never start
            // flowing again.
            // So, if this is awaiting a drain, then we just call it now.
            // If we don't know, then assume that we are waiting for one.
            if (state.awaitDrain && (!dest._writableState || dest._writableState.needDrain)) ondrain();
          }

          // If the user pushes more data while we're writing to dest then we'll end up
          // in ondata again. However, we only want to increase awaitDrain once because
          // dest will only emit one 'drain' event for the multiple writes.
          // => Introduce a guard on increasing awaitDrain.
          var increasedAwaitDrain = false;
          src.on('data', ondata);
          function ondata(chunk) {
            debug('ondata');
            increasedAwaitDrain = false;
            var ret = dest.write(chunk);
            if (false === ret && !increasedAwaitDrain) {
              // If the user unpiped during `dest.write()`, it is possible
              // to get stuck in a permanently paused state if that write
              // also returned false.
              // => Check whether `dest` is still a piping destination.
              if ((state.pipesCount === 1 && state.pipes === dest || state.pipesCount > 1 && indexOf(state.pipes, dest) !== -1) && !cleanedUp) {
                debug('false write response, pause', src._readableState.awaitDrain);
                src._readableState.awaitDrain++;
                increasedAwaitDrain = true;
              }
              src.pause();
            }
          }

          // if the dest has an error, then stop piping into it.
          // however, don't suppress the throwing behavior for this.
          function onerror(er) {
            debug('onerror', er);
            unpipe();
            dest.removeListener('error', onerror);
            if (listenerCount$1(dest, 'error') === 0) dest.emit('error', er);
          }

          // Make sure our error handler is attached before userland ones.
          prependListener(dest, 'error', onerror);

          // Both close and finish should trigger unpipe, but only once.
          function onclose() {
            dest.removeListener('finish', onfinish);
            unpipe();
          }
          dest.once('close', onclose);
          function onfinish() {
            debug('onfinish');
            dest.removeListener('close', onclose);
            unpipe();
          }
          dest.once('finish', onfinish);

          function unpipe() {
            debug('unpipe');
            src.unpipe(dest);
          }

          // tell the dest that it's being piped to
          dest.emit('pipe', src);

          // start the flow if it hasn't been started already.
          if (!state.flowing) {
            debug('pipe resume');
            src.resume();
          }

          return dest;
        };

        function pipeOnDrain(src) {
          return function () {
            var state = src._readableState;
            debug('pipeOnDrain', state.awaitDrain);
            if (state.awaitDrain) state.awaitDrain--;
            if (state.awaitDrain === 0 && src.listeners('data').length) {
              state.flowing = true;
              flow(src);
            }
          };
        }

        Readable.prototype.unpipe = function (dest) {
          var state = this._readableState;

          // if we're not piping anywhere, then do nothing.
          if (state.pipesCount === 0) return this;

          // just one destination.  most common case.
          if (state.pipesCount === 1) {
            // passed in one, but it's not the right one.
            if (dest && dest !== state.pipes) return this;

            if (!dest) dest = state.pipes;

            // got a match.
            state.pipes = null;
            state.pipesCount = 0;
            state.flowing = false;
            if (dest) dest.emit('unpipe', this);
            return this;
          }

          // slow case. multiple pipe destinations.

          if (!dest) {
            // remove all.
            var dests = state.pipes;
            var len = state.pipesCount;
            state.pipes = null;
            state.pipesCount = 0;
            state.flowing = false;

            for (var _i = 0; _i < len; _i++) {
              dests[_i].emit('unpipe', this);
            }return this;
          }

          // try to find the right one.
          var i = indexOf(state.pipes, dest);
          if (i === -1) return this;

          state.pipes.splice(i, 1);
          state.pipesCount -= 1;
          if (state.pipesCount === 1) state.pipes = state.pipes[0];

          dest.emit('unpipe', this);

          return this;
        };

        // set up data events if they are asked for
        // Ensure readable listeners eventually get something
        Readable.prototype.on = function (ev, fn) {
          var res = EventEmitter.prototype.on.call(this, ev, fn);

          if (ev === 'data') {
            // Start flowing on next tick if stream isn't explicitly paused
            if (this._readableState.flowing !== false) this.resume();
          } else if (ev === 'readable') {
            var state = this._readableState;
            if (!state.endEmitted && !state.readableListening) {
              state.readableListening = state.needReadable = true;
              state.emittedReadable = false;
              if (!state.reading) {
                nextTick(nReadingNextTick, this);
              } else if (state.length) {
                emitReadable(this);
              }
            }
          }

          return res;
        };
        Readable.prototype.addListener = Readable.prototype.on;

        function nReadingNextTick(self) {
          debug('readable nexttick read 0');
          self.read(0);
        }

        // pause() and resume() are remnants of the legacy readable stream API
        // If the user uses them, then switch into old mode.
        Readable.prototype.resume = function () {
          var state = this._readableState;
          if (!state.flowing) {
            debug('resume');
            state.flowing = true;
            resume(this, state);
          }
          return this;
        };

        function resume(stream, state) {
          if (!state.resumeScheduled) {
            state.resumeScheduled = true;
            nextTick(resume_, stream, state);
          }
        }

        function resume_(stream, state) {
          if (!state.reading) {
            debug('resume read 0');
            stream.read(0);
          }

          state.resumeScheduled = false;
          state.awaitDrain = 0;
          stream.emit('resume');
          flow(stream);
          if (state.flowing && !state.reading) stream.read(0);
        }

        Readable.prototype.pause = function () {
          debug('call pause flowing=%j', this._readableState.flowing);
          if (false !== this._readableState.flowing) {
            debug('pause');
            this._readableState.flowing = false;
            this.emit('pause');
          }
          return this;
        };

        function flow(stream) {
          var state = stream._readableState;
          debug('flow', state.flowing);
          while (state.flowing && stream.read() !== null) {}
        }

        // wrap an old-style stream as the async data source.
        // This is *not* part of the readable stream interface.
        // It is an ugly unfortunate mess of history.
        Readable.prototype.wrap = function (stream) {
          var state = this._readableState;
          var paused = false;

          var self = this;
          stream.on('end', function () {
            debug('wrapped end');
            if (state.decoder && !state.ended) {
              var chunk = state.decoder.end();
              if (chunk && chunk.length) self.push(chunk);
            }

            self.push(null);
          });

          stream.on('data', function (chunk) {
            debug('wrapped data');
            if (state.decoder) chunk = state.decoder.write(chunk);

            // don't skip over falsy values in objectMode
            if (state.objectMode && (chunk === null || chunk === undefined)) return;else if (!state.objectMode && (!chunk || !chunk.length)) return;

            var ret = self.push(chunk);
            if (!ret) {
              paused = true;
              stream.pause();
            }
          });

          // proxy all the other methods.
          // important when wrapping filters and duplexes.
          for (var i in stream) {
            if (this[i] === undefined && typeof stream[i] === 'function') {
              this[i] = function (method) {
                return function () {
                  return stream[method].apply(stream, arguments);
                };
              }(i);
            }
          }

          // proxy certain important events.
          var events = ['error', 'close', 'destroy', 'pause', 'resume'];
          forEach(events, function (ev) {
            stream.on(ev, self.emit.bind(self, ev));
          });

          // when we try to consume some more bytes, simply unpause the
          // underlying stream.
          self._read = function (n) {
            debug('wrapped _read', n);
            if (paused) {
              paused = false;
              stream.resume();
            }
          };

          return self;
        };

        // exposed for testing purposes only.
        Readable._fromList = fromList;

        // Pluck off n bytes from an array of buffers.
        // Length is the combined lengths of all the buffers in the list.
        // This function is designed to be inlinable, so please take care when making
        // changes to the function body.
        function fromList(n, state) {
          // nothing buffered
          if (state.length === 0) return null;

          var ret;
          if (state.objectMode) ret = state.buffer.shift();else if (!n || n >= state.length) {
            // read it all, truncate the list
            if (state.decoder) ret = state.buffer.join('');else if (state.buffer.length === 1) ret = state.buffer.head.data;else ret = state.buffer.concat(state.length);
            state.buffer.clear();
          } else {
            // read part of list
            ret = fromListPartial(n, state.buffer, state.decoder);
          }

          return ret;
        }

        // Extracts only enough buffered data to satisfy the amount requested.
        // This function is designed to be inlinable, so please take care when making
        // changes to the function body.
        function fromListPartial(n, list, hasStrings) {
          var ret;
          if (n < list.head.data.length) {
            // slice is the same for buffers and strings
            ret = list.head.data.slice(0, n);
            list.head.data = list.head.data.slice(n);
          } else if (n === list.head.data.length) {
            // first chunk is a perfect match
            ret = list.shift();
          } else {
            // result spans more than one buffer
            ret = hasStrings ? copyFromBufferString(n, list) : copyFromBuffer(n, list);
          }
          return ret;
        }

        // Copies a specified amount of characters from the list of buffered data
        // chunks.
        // This function is designed to be inlinable, so please take care when making
        // changes to the function body.
        function copyFromBufferString(n, list) {
          var p = list.head;
          var c = 1;
          var ret = p.data;
          n -= ret.length;
          while (p = p.next) {
            var str = p.data;
            var nb = n > str.length ? str.length : n;
            if (nb === str.length) ret += str;else ret += str.slice(0, n);
            n -= nb;
            if (n === 0) {
              if (nb === str.length) {
                ++c;
                if (p.next) list.head = p.next;else list.head = list.tail = null;
              } else {
                list.head = p;
                p.data = str.slice(nb);
              }
              break;
            }
            ++c;
          }
          list.length -= c;
          return ret;
        }

        // Copies a specified amount of bytes from the list of buffered data chunks.
        // This function is designed to be inlinable, so please take care when making
        // changes to the function body.
        function copyFromBuffer(n, list) {
          var ret = Buffer.allocUnsafe(n);
          var p = list.head;
          var c = 1;
          p.data.copy(ret);
          n -= p.data.length;
          while (p = p.next) {
            var buf = p.data;
            var nb = n > buf.length ? buf.length : n;
            buf.copy(ret, ret.length - n, 0, nb);
            n -= nb;
            if (n === 0) {
              if (nb === buf.length) {
                ++c;
                if (p.next) list.head = p.next;else list.head = list.tail = null;
              } else {
                list.head = p;
                p.data = buf.slice(nb);
              }
              break;
            }
            ++c;
          }
          list.length -= c;
          return ret;
        }

        function endReadable(stream) {
          var state = stream._readableState;

          // If we get here before consuming all the bytes, then that is a
          // bug in node.  Should never happen.
          if (state.length > 0) throw new Error('"endReadable()" called on non-empty stream');

          if (!state.endEmitted) {
            state.ended = true;
            nextTick(endReadableNT, state, stream);
          }
        }

        function endReadableNT(state, stream) {
          // Check that we didn't get one last unshift.
          if (!state.endEmitted && state.length === 0) {
            state.endEmitted = true;
            stream.readable = false;
            stream.emit('end');
          }
        }

        function forEach(xs, f) {
          for (var i = 0, l = xs.length; i < l; i++) {
            f(xs[i], i);
          }
        }

        function indexOf(xs, x) {
          for (var i = 0, l = xs.length; i < l; i++) {
            if (xs[i] === x) return i;
          }
          return -1;
        }

        // A bit simpler than readable streams.
        Writable.WritableState = WritableState;
        inherits$1(Writable, EventEmitter);

        function nop() {}

        function WriteReq(chunk, encoding, cb) {
          this.chunk = chunk;
          this.encoding = encoding;
          this.callback = cb;
          this.next = null;
        }

        function WritableState(options, stream) {
          Object.defineProperty(this, 'buffer', {
            get: deprecate(function () {
              return this.getBuffer();
            }, '_writableState.buffer is deprecated. Use _writableState.getBuffer ' + 'instead.')
          });
          options = options || {};

          // object stream flag to indicate whether or not this stream
          // contains buffers or objects.
          this.objectMode = !!options.objectMode;

          if (stream instanceof Duplex) this.objectMode = this.objectMode || !!options.writableObjectMode;

          // the point at which write() starts returning false
          // Note: 0 is a valid value, means that we always return false if
          // the entire buffer is not flushed immediately on write()
          var hwm = options.highWaterMark;
          var defaultHwm = this.objectMode ? 16 : 16 * 1024;
          this.highWaterMark = hwm || hwm === 0 ? hwm : defaultHwm;

          // cast to ints.
          this.highWaterMark = ~ ~this.highWaterMark;

          this.needDrain = false;
          // at the start of calling end()
          this.ending = false;
          // when end() has been called, and returned
          this.ended = false;
          // when 'finish' is emitted
          this.finished = false;

          // should we decode strings into buffers before passing to _write?
          // this is here so that some node-core streams can optimize string
          // handling at a lower level.
          var noDecode = options.decodeStrings === false;
          this.decodeStrings = !noDecode;

          // Crypto is kind of old and crusty.  Historically, its default string
          // encoding is 'binary' so we have to make this configurable.
          // Everything else in the universe uses 'utf8', though.
          this.defaultEncoding = options.defaultEncoding || 'utf8';

          // not an actual buffer we keep track of, but a measurement
          // of how much we're waiting to get pushed to some underlying
          // socket or file.
          this.length = 0;

          // a flag to see when we're in the middle of a write.
          this.writing = false;

          // when true all writes will be buffered until .uncork() call
          this.corked = 0;

          // a flag to be able to tell if the onwrite cb is called immediately,
          // or on a later tick.  We set this to true at first, because any
          // actions that shouldn't happen until "later" should generally also
          // not happen before the first write call.
          this.sync = true;

          // a flag to know if we're processing previously buffered items, which
          // may call the _write() callback in the same tick, so that we don't
          // end up in an overlapped onwrite situation.
          this.bufferProcessing = false;

          // the callback that's passed to _write(chunk,cb)
          this.onwrite = function (er) {
            onwrite(stream, er);
          };

          // the callback that the user supplies to write(chunk,encoding,cb)
          this.writecb = null;

          // the amount that is being written when _write is called.
          this.writelen = 0;

          this.bufferedRequest = null;
          this.lastBufferedRequest = null;

          // number of pending user-supplied write callbacks
          // this must be 0 before 'finish' can be emitted
          this.pendingcb = 0;

          // emit prefinish if the only thing we're waiting for is _write cbs
          // This is relevant for synchronous Transform streams
          this.prefinished = false;

          // True if the error was already emitted and should not be thrown again
          this.errorEmitted = false;

          // count buffered requests
          this.bufferedRequestCount = 0;

          // allocate the first CorkedRequest, there is always
          // one allocated and free to use, and we maintain at most two
          this.corkedRequestsFree = new CorkedRequest(this);
        }

        WritableState.prototype.getBuffer = function writableStateGetBuffer() {
          var current = this.bufferedRequest;
          var out = [];
          while (current) {
            out.push(current);
            current = current.next;
          }
          return out;
        };
        function Writable(options) {

          // Writable ctor is applied to Duplexes, though they're not
          // instanceof Writable, they're instanceof Readable.
          if (!(this instanceof Writable) && !(this instanceof Duplex)) return new Writable(options);

          this._writableState = new WritableState(options, this);

          // legacy.
          this.writable = true;

          if (options) {
            if (typeof options.write === 'function') this._write = options.write;

            if (typeof options.writev === 'function') this._writev = options.writev;
          }

          EventEmitter.call(this);
        }

        // Otherwise people can pipe Writable streams, which is just wrong.
        Writable.prototype.pipe = function () {
          this.emit('error', new Error('Cannot pipe, not readable'));
        };

        function writeAfterEnd(stream, cb) {
          var er = new Error('write after end');
          // TODO: defer error events consistently everywhere, not just the cb
          stream.emit('error', er);
          nextTick(cb, er);
        }

        // If we get something that is not a buffer, string, null, or undefined,
        // and we're not in objectMode, then that's an error.
        // Otherwise stream chunks are all considered to be of length=1, and the
        // watermarks determine how many objects to keep in the buffer, rather than
        // how many bytes or characters.
        function validChunk(stream, state, chunk, cb) {
          var valid = true;
          var er = false;
          // Always throw error if a null is written
          // if we are not in object mode then throw
          // if it is not a buffer, string, or undefined.
          if (chunk === null) {
            er = new TypeError('May not write null values to stream');
          } else if (!Buffer$1.isBuffer(chunk) && typeof chunk !== 'string' && chunk !== undefined && !state.objectMode) {
            er = new TypeError('Invalid non-string/buffer chunk');
          }
          if (er) {
            stream.emit('error', er);
            nextTick(cb, er);
            valid = false;
          }
          return valid;
        }

        Writable.prototype.write = function (chunk, encoding, cb) {
          var state = this._writableState;
          var ret = false;

          if (typeof encoding === 'function') {
            cb = encoding;
            encoding = null;
          }

          if (Buffer$1.isBuffer(chunk)) encoding = 'buffer';else if (!encoding) encoding = state.defaultEncoding;

          if (typeof cb !== 'function') cb = nop;

          if (state.ended) writeAfterEnd(this, cb);else if (validChunk(this, state, chunk, cb)) {
            state.pendingcb++;
            ret = writeOrBuffer(this, state, chunk, encoding, cb);
          }

          return ret;
        };

        Writable.prototype.cork = function () {
          var state = this._writableState;

          state.corked++;
        };

        Writable.prototype.uncork = function () {
          var state = this._writableState;

          if (state.corked) {
            state.corked--;

            if (!state.writing && !state.corked && !state.finished && !state.bufferProcessing && state.bufferedRequest) clearBuffer(this, state);
          }
        };

        Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
          // node::ParseEncoding() requires lower case.
          if (typeof encoding === 'string') encoding = encoding.toLowerCase();
          if (!(['hex', 'utf8', 'utf-8', 'ascii', 'binary', 'base64', 'ucs2', 'ucs-2', 'utf16le', 'utf-16le', 'raw'].indexOf((encoding + '').toLowerCase()) > -1)) throw new TypeError('Unknown encoding: ' + encoding);
          this._writableState.defaultEncoding = encoding;
          return this;
        };

        function decodeChunk(state, chunk, encoding) {
          if (!state.objectMode && state.decodeStrings !== false && typeof chunk === 'string') {
            chunk = Buffer$1.from(chunk, encoding);
          }
          return chunk;
        }

        // if we're already writing something, then just put this
        // in the queue, and wait our turn.  Otherwise, call _write
        // If we return false, then we need a drain event, so set that flag.
        function writeOrBuffer(stream, state, chunk, encoding, cb) {
          chunk = decodeChunk(state, chunk, encoding);

          if (Buffer$1.isBuffer(chunk)) encoding = 'buffer';
          var len = state.objectMode ? 1 : chunk.length;

          state.length += len;

          var ret = state.length < state.highWaterMark;
          // we must ensure that previous needDrain will not be reset to false.
          if (!ret) state.needDrain = true;

          if (state.writing || state.corked) {
            var last = state.lastBufferedRequest;
            state.lastBufferedRequest = new WriteReq(chunk, encoding, cb);
            if (last) {
              last.next = state.lastBufferedRequest;
            } else {
              state.bufferedRequest = state.lastBufferedRequest;
            }
            state.bufferedRequestCount += 1;
          } else {
            doWrite(stream, state, false, len, chunk, encoding, cb);
          }

          return ret;
        }

        function doWrite(stream, state, writev, len, chunk, encoding, cb) {
          state.writelen = len;
          state.writecb = cb;
          state.writing = true;
          state.sync = true;
          if (writev) stream._writev(chunk, state.onwrite);else stream._write(chunk, encoding, state.onwrite);
          state.sync = false;
        }

        function onwriteError(stream, state, sync, er, cb) {
          --state.pendingcb;
          if (sync) nextTick(cb, er);else cb(er);

          stream._writableState.errorEmitted = true;
          stream.emit('error', er);
        }

        function onwriteStateUpdate(state) {
          state.writing = false;
          state.writecb = null;
          state.length -= state.writelen;
          state.writelen = 0;
        }

        function onwrite(stream, er) {
          var state = stream._writableState;
          var sync = state.sync;
          var cb = state.writecb;

          onwriteStateUpdate(state);

          if (er) onwriteError(stream, state, sync, er, cb);else {
            // Check if we're actually ready to finish, but don't emit yet
            var finished = needFinish(state);

            if (!finished && !state.corked && !state.bufferProcessing && state.bufferedRequest) {
              clearBuffer(stream, state);
            }

            if (sync) {
              /*<replacement>*/
                nextTick(afterWrite, stream, state, finished, cb);
              /*</replacement>*/
            } else {
                afterWrite(stream, state, finished, cb);
              }
          }
        }

        function afterWrite(stream, state, finished, cb) {
          if (!finished) onwriteDrain(stream, state);
          state.pendingcb--;
          cb();
          finishMaybe(stream, state);
        }

        // Must force callback to be called on nextTick, so that we don't
        // emit 'drain' before the write() consumer gets the 'false' return
        // value, and has a chance to attach a 'drain' listener.
        function onwriteDrain(stream, state) {
          if (state.length === 0 && state.needDrain) {
            state.needDrain = false;
            stream.emit('drain');
          }
        }

        // if there's something in the buffer waiting, then process it
        function clearBuffer(stream, state) {
          state.bufferProcessing = true;
          var entry = state.bufferedRequest;

          if (stream._writev && entry && entry.next) {
            // Fast case, write everything using _writev()
            var l = state.bufferedRequestCount;
            var buffer = new Array(l);
            var holder = state.corkedRequestsFree;
            holder.entry = entry;

            var count = 0;
            while (entry) {
              buffer[count] = entry;
              entry = entry.next;
              count += 1;
            }

            doWrite(stream, state, true, state.length, buffer, '', holder.finish);

            // doWrite is almost always async, defer these to save a bit of time
            // as the hot path ends with doWrite
            state.pendingcb++;
            state.lastBufferedRequest = null;
            if (holder.next) {
              state.corkedRequestsFree = holder.next;
              holder.next = null;
            } else {
              state.corkedRequestsFree = new CorkedRequest(state);
            }
          } else {
            // Slow case, write chunks one-by-one
            while (entry) {
              var chunk = entry.chunk;
              var encoding = entry.encoding;
              var cb = entry.callback;
              var len = state.objectMode ? 1 : chunk.length;

              doWrite(stream, state, false, len, chunk, encoding, cb);
              entry = entry.next;
              // if we didn't call the onwrite immediately, then
              // it means that we need to wait until it does.
              // also, that means that the chunk and cb are currently
              // being processed, so move the buffer counter past them.
              if (state.writing) {
                break;
              }
            }

            if (entry === null) state.lastBufferedRequest = null;
          }

          state.bufferedRequestCount = 0;
          state.bufferedRequest = entry;
          state.bufferProcessing = false;
        }

        Writable.prototype._write = function (chunk, encoding, cb) {
          cb(new Error('not implemented'));
        };

        Writable.prototype._writev = null;

        Writable.prototype.end = function (chunk, encoding, cb) {
          var state = this._writableState;

          if (typeof chunk === 'function') {
            cb = chunk;
            chunk = null;
            encoding = null;
          } else if (typeof encoding === 'function') {
            cb = encoding;
            encoding = null;
          }

          if (chunk !== null && chunk !== undefined) this.write(chunk, encoding);

          // .end() fully uncorks
          if (state.corked) {
            state.corked = 1;
            this.uncork();
          }

          // ignore unnecessary end() calls.
          if (!state.ending && !state.finished) endWritable(this, state, cb);
        };

        function needFinish(state) {
          return state.ending && state.length === 0 && state.bufferedRequest === null && !state.finished && !state.writing;
        }

        function prefinish(stream, state) {
          if (!state.prefinished) {
            state.prefinished = true;
            stream.emit('prefinish');
          }
        }

        function finishMaybe(stream, state) {
          var need = needFinish(state);
          if (need) {
            if (state.pendingcb === 0) {
              prefinish(stream, state);
              state.finished = true;
              stream.emit('finish');
            } else {
              prefinish(stream, state);
            }
          }
          return need;
        }

        function endWritable(stream, state, cb) {
          state.ending = true;
          finishMaybe(stream, state);
          if (cb) {
            if (state.finished) nextTick(cb);else stream.once('finish', cb);
          }
          state.ended = true;
          stream.writable = false;
        }

        // It seems a linked list but it is not
        // there will be only 2 of these for each stream
        function CorkedRequest(state) {
          var _this = this;

          this.next = null;
          this.entry = null;

          this.finish = function (err) {
            var entry = _this.entry;
            _this.entry = null;
            while (entry) {
              var cb = entry.callback;
              state.pendingcb--;
              cb(err);
              entry = entry.next;
            }
            if (state.corkedRequestsFree) {
              state.corkedRequestsFree.next = _this;
            } else {
              state.corkedRequestsFree = _this;
            }
          };
        }

        inherits$1(Duplex, Readable);

        var keys = Object.keys(Writable.prototype);
        for (var v = 0; v < keys.length; v++) {
          var method = keys[v];
          if (!Duplex.prototype[method]) Duplex.prototype[method] = Writable.prototype[method];
        }
        function Duplex(options) {
          if (!(this instanceof Duplex)) return new Duplex(options);

          Readable.call(this, options);
          Writable.call(this, options);

          if (options && options.readable === false) this.readable = false;

          if (options && options.writable === false) this.writable = false;

          this.allowHalfOpen = true;
          if (options && options.allowHalfOpen === false) this.allowHalfOpen = false;

          this.once('end', onend);
        }

        // the no-half-open enforcer
        function onend() {
          // if we allow half-open state, or if the writable side ended,
          // then we're ok.
          if (this.allowHalfOpen || this._writableState.ended) return;

          // no more data can be written.
          // But allow more writes to happen in this tick.
          nextTick(onEndNT, this);
        }

        function onEndNT(self) {
          self.end();
        }

        // a transform stream is a readable/writable stream where you do
        inherits$1(Transform, Duplex);

        function TransformState(stream) {
          this.afterTransform = function (er, data) {
            return afterTransform(stream, er, data);
          };

          this.needTransform = false;
          this.transforming = false;
          this.writecb = null;
          this.writechunk = null;
          this.writeencoding = null;
        }

        function afterTransform(stream, er, data) {
          var ts = stream._transformState;
          ts.transforming = false;

          var cb = ts.writecb;

          if (!cb) return stream.emit('error', new Error('no writecb in Transform class'));

          ts.writechunk = null;
          ts.writecb = null;

          if (data !== null && data !== undefined) stream.push(data);

          cb(er);

          var rs = stream._readableState;
          rs.reading = false;
          if (rs.needReadable || rs.length < rs.highWaterMark) {
            stream._read(rs.highWaterMark);
          }
        }
        function Transform(options) {
          if (!(this instanceof Transform)) return new Transform(options);

          Duplex.call(this, options);

          this._transformState = new TransformState(this);

          // when the writable side finishes, then flush out anything remaining.
          var stream = this;

          // start out asking for a readable event once data is transformed.
          this._readableState.needReadable = true;

          // we have implemented the _read method, and done the other things
          // that Readable wants before the first _read call, so unset the
          // sync guard flag.
          this._readableState.sync = false;

          if (options) {
            if (typeof options.transform === 'function') this._transform = options.transform;

            if (typeof options.flush === 'function') this._flush = options.flush;
          }

          this.once('prefinish', function () {
            if (typeof this._flush === 'function') this._flush(function (er) {
              done(stream, er);
            });else done(stream);
          });
        }

        Transform.prototype.push = function (chunk, encoding) {
          this._transformState.needTransform = false;
          return Duplex.prototype.push.call(this, chunk, encoding);
        };

        // This is the part where you do stuff!
        // override this function in implementation classes.
        // 'chunk' is an input chunk.
        //
        // Call `push(newChunk)` to pass along transformed output
        // to the readable side.  You may call 'push' zero or more times.
        //
        // Call `cb(err)` when you are done with this chunk.  If you pass
        // an error, then that'll put the hurt on the whole operation.  If you
        // never call cb(), then you'll never get another chunk.
        Transform.prototype._transform = function (chunk, encoding, cb) {
          throw new Error('Not implemented');
        };

        Transform.prototype._write = function (chunk, encoding, cb) {
          var ts = this._transformState;
          ts.writecb = cb;
          ts.writechunk = chunk;
          ts.writeencoding = encoding;
          if (!ts.transforming) {
            var rs = this._readableState;
            if (ts.needTransform || rs.needReadable || rs.length < rs.highWaterMark) this._read(rs.highWaterMark);
          }
        };

        // Doesn't matter what the args are here.
        // _transform does all the work.
        // That we got here means that the readable side wants more data.
        Transform.prototype._read = function (n) {
          var ts = this._transformState;

          if (ts.writechunk !== null && ts.writecb && !ts.transforming) {
            ts.transforming = true;
            this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
          } else {
            // mark that we need a transform, so that any data that comes in
            // will get processed, now that we've asked for it.
            ts.needTransform = true;
          }
        };

        function done(stream, er) {
          if (er) return stream.emit('error', er);

          // if there's nothing in the write buffer, then that means
          // that nothing more will ever be provided
          var ws = stream._writableState;
          var ts = stream._transformState;

          if (ws.length) throw new Error('Calling transform done when ws.length != 0');

          if (ts.transforming) throw new Error('Calling transform done when still transforming');

          return stream.push(null);
        }

        inherits$1(PassThrough, Transform);
        function PassThrough(options) {
          if (!(this instanceof PassThrough)) return new PassThrough(options);

          Transform.call(this, options);
        }

        PassThrough.prototype._transform = function (chunk, encoding, cb) {
          cb(null, chunk);
        };

        inherits$1(Stream, EventEmitter);
        Stream.Readable = Readable;
        Stream.Writable = Writable;
        Stream.Duplex = Duplex;
        Stream.Transform = Transform;
        Stream.PassThrough = PassThrough;

        // Backwards-compat with node 0.4.x
        Stream.Stream = Stream;

        // old-style streams.  Note that the pipe method (the only relevant
        // part of this class) is overridden in the Readable class.

        function Stream() {
          EventEmitter.call(this);
        }

        Stream.prototype.pipe = function(dest, options) {
          var source = this;

          function ondata(chunk) {
            if (dest.writable) {
              if (false === dest.write(chunk) && source.pause) {
                source.pause();
              }
            }
          }

          source.on('data', ondata);

          function ondrain() {
            if (source.readable && source.resume) {
              source.resume();
            }
          }

          dest.on('drain', ondrain);

          // If the 'end' option is not supplied, dest.end() will be called when
          // source gets the 'end' or 'close' events.  Only dest.end() once.
          if (!dest._isStdio && (!options || options.end !== false)) {
            source.on('end', onend);
            source.on('close', onclose);
          }

          var didOnEnd = false;
          function onend() {
            if (didOnEnd) return;
            didOnEnd = true;

            dest.end();
          }


          function onclose() {
            if (didOnEnd) return;
            didOnEnd = true;

            if (typeof dest.destroy === 'function') dest.destroy();
          }

          // don't leave dangling pipes when there are errors.
          function onerror(er) {
            cleanup();
            if (EventEmitter.listenerCount(this, 'error') === 0) {
              throw er; // Unhandled stream error in pipe.
            }
          }

          source.on('error', onerror);
          dest.on('error', onerror);

          // remove all the event listeners that were added.
          function cleanup() {
            source.removeListener('data', ondata);
            dest.removeListener('drain', ondrain);

            source.removeListener('end', onend);
            source.removeListener('close', onclose);

            source.removeListener('error', onerror);
            dest.removeListener('error', onerror);

            source.removeListener('end', cleanup);
            source.removeListener('close', cleanup);

            dest.removeListener('close', cleanup);
          }

          source.on('end', cleanup);
          source.on('close', cleanup);

          dest.on('close', cleanup);

          dest.emit('pipe', source);

          // Allow for unix-like usage: A.pipe(B).pipe(C)
          return dest;
        };

        var fs = {};

        /*
        PDFAbstractReference - abstract class for PDF reference
        */

        class PDFAbstractReference {
          toString() {
            throw new Error('Must be implemented by subclasses');
          }
        }

        /*
        PDFNameTree - represents a name tree object
        */

        class PDFNameTree {

          constructor() {
            this._items = {};
          }

          add(key, val) {
            return this._items[key] = val;
          }

          get(key) {
            return this._items[key];
          }

          toString() {
            // Needs to be sorted by key
            const sortedKeys = (Object.keys(this._items)).sort((a, b) => a.localeCompare(b));

            const out = ['<<'];
            if (sortedKeys.length > 1) {
              const first = sortedKeys[0], last = sortedKeys[sortedKeys.length - 1];
              out.push(`  /Limits ${PDFObject.convert([new String(first), new String(last)])}`);
            }
            out.push('  /Names [');
            for (let key of sortedKeys) {
              out.push(`    ${PDFObject.convert(new String(key))} ${PDFObject.convert(this._items[key])}`);
            }
            out.push(']');
            out.push('>>');
            return out.join('\n');
          }
        }

        const pad = (str, length) => (Array(length + 1).join('0') + str).slice(-length);

        const escapableRe = /[\n\r\t\b\f\(\)\\]/g;
        const escapable = {
          '\n': '\\n',
          '\r': '\\r',
          '\t': '\\t',
          '\b': '\\b',
          '\f': '\\f',
          '\\': '\\\\',
          '(': '\\(',
          ')': '\\)'
        };

        // Convert little endian UTF-16 to big endian
        const swapBytes = function(buff) {
          const l = buff.length;
          if (l & 0x01) {
            throw new Error('Buffer length must be even');
          } else {
            for (let i = 0, end = l - 1; i < end; i += 2) {
              const a = buff[i];
              buff[i] = buff[i + 1];
              buff[i + 1] = a;
            }
          }

          return buff;
        };

        class PDFObject {
          static convert(object, encryptFn = null) {
            // String literals are converted to the PDF name type
            if (typeof object === 'string') {
              return `/${object}`;

              // String objects are converted to PDF strings (UTF-16)
            } else if (object instanceof String) {
              let string = object;
              // Detect if this is a unicode string
              let isUnicode = false;
              for (let i = 0, end = string.length; i < end; i++) {
                if (string.charCodeAt(i) > 0x7f) {
                  isUnicode = true;
                  break;
                }
              }

              // If so, encode it as big endian UTF-16
              let stringBuffer;
              if (isUnicode) {
                stringBuffer = swapBytes(Buffer.from(`\ufeff${string}`, 'utf16le'));
              } else {
                stringBuffer = Buffer.from(string.valueOf(), 'ascii');
              }

              // Encrypt the string when necessary
              if (encryptFn) {
                string = encryptFn(stringBuffer).toString('binary');
              } else {
                string = stringBuffer.toString('binary');
              }

              // Escape characters as required by the spec
              string = string.replace(escapableRe, c => escapable[c]);

              return `(${string})`;

              // Buffers are converted to PDF hex strings
            } else if (isBuffer(object)) {
              return `<${object.toString('hex')}>`;
            } else if (object instanceof PDFAbstractReference || object instanceof PDFNameTree) {
              return object.toString();
            } else if (object instanceof Date) {
              let string =
                `D:${pad(object.getUTCFullYear(), 4)}` +
                pad(object.getUTCMonth() + 1, 2) +
                pad(object.getUTCDate(), 2) +
                pad(object.getUTCHours(), 2) +
                pad(object.getUTCMinutes(), 2) +
                pad(object.getUTCSeconds(), 2) +
                'Z';

              // Encrypt the string when necessary
              if (encryptFn) {
                string = encryptFn(new Buffer(string, 'ascii')).toString('binary');

                // Escape characters as required by the spec
                string = string.replace(escapableRe, c => escapable[c]);
              }

              return `(${string})`;
            } else if (Array.isArray(object)) {
              const items = object.map(e => PDFObject.convert(e, encryptFn)).join(' ');
              return `[${items}]`;
            } else if ({}.toString.call(object) === '[object Object]') {
              const out = ['<<'];
              for (let key in object) {
                const val = object[key];
                out.push(`/${key} ${PDFObject.convert(val, encryptFn)}`);
              }

              out.push('>>');
              return out.join('\n');
            } else if (typeof object === 'number') {
              return PDFObject.number(object);
            } else {
              return `${object}`;
            }
          }

          static number(n) {
            if (n > -1e21 && n < 1e21) {
              return Math.round(n * 1e6) / 1e6;
            }

            throw new Error(`unsupported number: ${n}`);
          }
        }

        // shim for using process in browser
        // based off https://github.com/defunctzombie/node-process/blob/master/browser.js

        function defaultSetTimout$1() {
            throw new Error('setTimeout has not been defined');
        }
        function defaultClearTimeout$1 () {
            throw new Error('clearTimeout has not been defined');
        }
        var cachedSetTimeout$1 = defaultSetTimout$1;
        var cachedClearTimeout$1 = defaultClearTimeout$1;
        if (typeof global$1$1.setTimeout === 'function') {
            cachedSetTimeout$1 = setTimeout;
        }
        if (typeof global$1$1.clearTimeout === 'function') {
            cachedClearTimeout$1 = clearTimeout;
        }

        function runTimeout$1(fun) {
            if (cachedSetTimeout$1 === setTimeout) {
                //normal enviroments in sane situations
                return setTimeout(fun, 0);
            }
            // if setTimeout wasn't available but was latter defined
            if ((cachedSetTimeout$1 === defaultSetTimout$1 || !cachedSetTimeout$1) && setTimeout) {
                cachedSetTimeout$1 = setTimeout;
                return setTimeout(fun, 0);
            }
            try {
                // when when somebody has screwed with setTimeout but no I.E. maddness
                return cachedSetTimeout$1(fun, 0);
            } catch(e){
                try {
                    // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
                    return cachedSetTimeout$1.call(null, fun, 0);
                } catch(e){
                    // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
                    return cachedSetTimeout$1.call(this, fun, 0);
                }
            }


        }
        function runClearTimeout$1(marker) {
            if (cachedClearTimeout$1 === clearTimeout) {
                //normal enviroments in sane situations
                return clearTimeout(marker);
            }
            // if clearTimeout wasn't available but was latter defined
            if ((cachedClearTimeout$1 === defaultClearTimeout$1 || !cachedClearTimeout$1) && clearTimeout) {
                cachedClearTimeout$1 = clearTimeout;
                return clearTimeout(marker);
            }
            try {
                // when when somebody has screwed with setTimeout but no I.E. maddness
                return cachedClearTimeout$1(marker);
            } catch (e){
                try {
                    // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
                    return cachedClearTimeout$1.call(null, marker);
                } catch (e){
                    // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
                    // Some versions of I.E. have different rules for clearTimeout vs setTimeout
                    return cachedClearTimeout$1.call(this, marker);
                }
            }



        }
        var queue$1 = [];
        var draining$1 = false;
        var currentQueue$1;
        var queueIndex$1 = -1;

        function cleanUpNextTick$1() {
            if (!draining$1 || !currentQueue$1) {
                return;
            }
            draining$1 = false;
            if (currentQueue$1.length) {
                queue$1 = currentQueue$1.concat(queue$1);
            } else {
                queueIndex$1 = -1;
            }
            if (queue$1.length) {
                drainQueue$1();
            }
        }

        function drainQueue$1() {
            if (draining$1) {
                return;
            }
            var timeout = runTimeout$1(cleanUpNextTick$1);
            draining$1 = true;

            var len = queue$1.length;
            while(len) {
                currentQueue$1 = queue$1;
                queue$1 = [];
                while (++queueIndex$1 < len) {
                    if (currentQueue$1) {
                        currentQueue$1[queueIndex$1].run();
                    }
                }
                queueIndex$1 = -1;
                len = queue$1.length;
            }
            currentQueue$1 = null;
            draining$1 = false;
            runClearTimeout$1(timeout);
        }
        function nextTick$1(fun) {
            var args = new Array(arguments.length - 1);
            if (arguments.length > 1) {
                for (var i = 1; i < arguments.length; i++) {
                    args[i - 1] = arguments[i];
                }
            }
            queue$1.push(new Item$1(fun, args));
            if (queue$1.length === 1 && !draining$1) {
                runTimeout$1(drainQueue$1);
            }
        }
        // v8 likes predictible objects
        function Item$1(fun, array) {
            this.fun = fun;
            this.array = array;
        }
        Item$1.prototype.run = function () {
            this.fun.apply(null, this.array);
        };

        // from https://github.com/kumavis/browser-process-hrtime/blob/master/index.js
        var performance$1 = global$1$1.performance || {};
        var performanceNow$1 =
          performance$1.now        ||
          performance$1.mozNow     ||
          performance$1.msNow      ||
          performance$1.oNow       ||
          performance$1.webkitNow  ||
          function(){ return (new Date()).getTime() };

        var msg = {
          2:      'need dictionary',     /* Z_NEED_DICT       2  */
          1:      'stream end',          /* Z_STREAM_END      1  */
          0:      '',                    /* Z_OK              0  */
          '-1':   'file error',          /* Z_ERRNO         (-1) */
          '-2':   'stream error',        /* Z_STREAM_ERROR  (-2) */
          '-3':   'data error',          /* Z_DATA_ERROR    (-3) */
          '-4':   'insufficient memory', /* Z_MEM_ERROR     (-4) */
          '-5':   'buffer error',        /* Z_BUF_ERROR     (-5) */
          '-6':   'incompatible version' /* Z_VERSION_ERROR (-6) */
        };

        function ZStream() {
          /* next input byte */
          this.input = null; // JS specific, because we have no pointers
          this.next_in = 0;
          /* number of bytes available at input */
          this.avail_in = 0;
          /* total number of input bytes read so far */
          this.total_in = 0;
          /* next output byte should be put there */
          this.output = null; // JS specific, because we have no pointers
          this.next_out = 0;
          /* remaining free space at output */
          this.avail_out = 0;
          /* total number of bytes output so far */
          this.total_out = 0;
          /* last error message, NULL if no error */
          this.msg = ''/*Z_NULL*/;
          /* not visible by applications */
          this.state = null;
          /* best guess about the data type: binary or text */
          this.data_type = 2/*Z_UNKNOWN*/;
          /* adler32 value of the uncompressed data */
          this.adler = 0;
        }

        function arraySet(dest, src, src_offs, len, dest_offs) {
          if (src.subarray && dest.subarray) {
            dest.set(src.subarray(src_offs, src_offs + len), dest_offs);
            return;
          }
          // Fallback to ordinary array
          for (var i = 0; i < len; i++) {
            dest[dest_offs + i] = src[src_offs + i];
          }
        }


        var Buf8 = Uint8Array;
        var Buf16 = Uint16Array;
        var Buf32 = Int32Array;
        // Enable/Disable typed arrays use, for testing
        //

        /* Public constants ==========================================================*/
        /* ===========================================================================*/


        //var Z_FILTERED          = 1;
        //var Z_HUFFMAN_ONLY      = 2;
        //var Z_RLE               = 3;
        var Z_FIXED = 4;
        //var Z_DEFAULT_STRATEGY  = 0;

        /* Possible values of the data_type field (though see inflate()) */
        var Z_BINARY = 0;
        var Z_TEXT = 1;
        //var Z_ASCII             = 1; // = Z_TEXT
        var Z_UNKNOWN = 2;

        /*============================================================================*/


        function zero(buf) {
          var len = buf.length;
          while (--len >= 0) {
            buf[len] = 0;
          }
        }

        // From zutil.h

        var STORED_BLOCK = 0;
        var STATIC_TREES = 1;
        var DYN_TREES = 2;
        /* The three kinds of block type */

        var MIN_MATCH = 3;
        var MAX_MATCH = 258;
        /* The minimum and maximum match lengths */

        // From deflate.h
        /* ===========================================================================
         * Internal compression state.
         */

        var LENGTH_CODES = 29;
        /* number of length codes, not counting the special END_BLOCK code */

        var LITERALS = 256;
        /* number of literal bytes 0..255 */

        var L_CODES = LITERALS + 1 + LENGTH_CODES;
        /* number of Literal or Length codes, including the END_BLOCK code */

        var D_CODES = 30;
        /* number of distance codes */

        var BL_CODES = 19;
        /* number of codes used to transfer the bit lengths */

        var HEAP_SIZE = 2 * L_CODES + 1;
        /* maximum heap size */

        var MAX_BITS = 15;
        /* All codes must not exceed MAX_BITS bits */

        var Buf_size = 16;
        /* size of bit buffer in bi_buf */


        /* ===========================================================================
         * Constants
         */

        var MAX_BL_BITS = 7;
        /* Bit length codes must not exceed MAX_BL_BITS bits */

        var END_BLOCK = 256;
        /* end of block literal code */

        var REP_3_6 = 16;
        /* repeat previous bit length 3-6 times (2 bits of repeat count) */

        var REPZ_3_10 = 17;
        /* repeat a zero length 3-10 times  (3 bits of repeat count) */

        var REPZ_11_138 = 18;
        /* repeat a zero length 11-138 times  (7 bits of repeat count) */

        /* eslint-disable comma-spacing,array-bracket-spacing */
        var extra_lbits = /* extra bits for each length code */ [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0];

        var extra_dbits = /* extra bits for each distance code */ [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13];

        var extra_blbits = /* extra bits for each bit length code */ [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 7];

        var bl_order = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];
        /* eslint-enable comma-spacing,array-bracket-spacing */

        /* The lengths of the bit length codes are sent in order of decreasing
         * probability, to avoid transmitting the lengths for unused bit length codes.
         */

        /* ===========================================================================
         * Local data. These are initialized only once.
         */

        // We pre-fill arrays with 0 to avoid uninitialized gaps

        var DIST_CODE_LEN = 512; /* see definition of array dist_code below */

        // !!!! Use flat array insdead of structure, Freq = i*2, Len = i*2+1
        var static_ltree = new Array((L_CODES + 2) * 2);
        zero(static_ltree);
        /* The static literal tree. Since the bit lengths are imposed, there is no
         * need for the L_CODES extra codes used during heap construction. However
         * The codes 286 and 287 are needed to build a canonical tree (see _tr_init
         * below).
         */

        var static_dtree = new Array(D_CODES * 2);
        zero(static_dtree);
        /* The static distance tree. (Actually a trivial tree since all codes use
         * 5 bits.)
         */

        var _dist_code = new Array(DIST_CODE_LEN);
        zero(_dist_code);
        /* Distance codes. The first 256 values correspond to the distances
         * 3 .. 258, the last 256 values correspond to the top 8 bits of
         * the 15 bit distances.
         */

        var _length_code = new Array(MAX_MATCH - MIN_MATCH + 1);
        zero(_length_code);
        /* length code for each normalized match length (0 == MIN_MATCH) */

        var base_length = new Array(LENGTH_CODES);
        zero(base_length);
        /* First normalized length for each code (0 = MIN_MATCH) */

        var base_dist = new Array(D_CODES);
        zero(base_dist);
        /* First normalized distance for each code (0 = distance of 1) */


        function StaticTreeDesc(static_tree, extra_bits, extra_base, elems, max_length) {

          this.static_tree = static_tree; /* static tree or NULL */
          this.extra_bits = extra_bits; /* extra bits for each code or NULL */
          this.extra_base = extra_base; /* base index for extra_bits */
          this.elems = elems; /* max number of elements in the tree */
          this.max_length = max_length; /* max bit length for the codes */

          // show if `static_tree` has data or dummy - needed for monomorphic objects
          this.has_stree = static_tree && static_tree.length;
        }


        var static_l_desc;
        var static_d_desc;
        var static_bl_desc;


        function TreeDesc(dyn_tree, stat_desc) {
          this.dyn_tree = dyn_tree; /* the dynamic tree */
          this.max_code = 0; /* largest code with non zero frequency */
          this.stat_desc = stat_desc; /* the corresponding static tree */
        }



        function d_code(dist) {
          return dist < 256 ? _dist_code[dist] : _dist_code[256 + (dist >>> 7)];
        }


        /* ===========================================================================
         * Output a short LSB first on the stream.
         * IN assertion: there is enough room in pendingBuf.
         */
        function put_short(s, w) {
          //    put_byte(s, (uch)((w) & 0xff));
          //    put_byte(s, (uch)((ush)(w) >> 8));
          s.pending_buf[s.pending++] = (w) & 0xff;
          s.pending_buf[s.pending++] = (w >>> 8) & 0xff;
        }


        /* ===========================================================================
         * Send a value on a given number of bits.
         * IN assertion: length <= 16 and value fits in length bits.
         */
        function send_bits(s, value, length) {
          if (s.bi_valid > (Buf_size - length)) {
            s.bi_buf |= (value << s.bi_valid) & 0xffff;
            put_short(s, s.bi_buf);
            s.bi_buf = value >> (Buf_size - s.bi_valid);
            s.bi_valid += length - Buf_size;
          } else {
            s.bi_buf |= (value << s.bi_valid) & 0xffff;
            s.bi_valid += length;
          }
        }


        function send_code(s, c, tree) {
          send_bits(s, tree[c * 2] /*.Code*/ , tree[c * 2 + 1] /*.Len*/ );
        }


        /* ===========================================================================
         * Reverse the first len bits of a code, using straightforward code (a faster
         * method would use a table)
         * IN assertion: 1 <= len <= 15
         */
        function bi_reverse(code, len) {
          var res = 0;
          do {
            res |= code & 1;
            code >>>= 1;
            res <<= 1;
          } while (--len > 0);
          return res >>> 1;
        }


        /* ===========================================================================
         * Flush the bit buffer, keeping at most 7 bits in it.
         */
        function bi_flush(s) {
          if (s.bi_valid === 16) {
            put_short(s, s.bi_buf);
            s.bi_buf = 0;
            s.bi_valid = 0;

          } else if (s.bi_valid >= 8) {
            s.pending_buf[s.pending++] = s.bi_buf & 0xff;
            s.bi_buf >>= 8;
            s.bi_valid -= 8;
          }
        }


        /* ===========================================================================
         * Compute the optimal bit lengths for a tree and update the total bit length
         * for the current block.
         * IN assertion: the fields freq and dad are set, heap[heap_max] and
         *    above are the tree nodes sorted by increasing frequency.
         * OUT assertions: the field len is set to the optimal bit length, the
         *     array bl_count contains the frequencies for each bit length.
         *     The length opt_len is updated; static_len is also updated if stree is
         *     not null.
         */
        function gen_bitlen(s, desc) {
        //    deflate_state *s;
        //    tree_desc *desc;    /* the tree descriptor */
          var tree = desc.dyn_tree;
          var max_code = desc.max_code;
          var stree = desc.stat_desc.static_tree;
          var has_stree = desc.stat_desc.has_stree;
          var extra = desc.stat_desc.extra_bits;
          var base = desc.stat_desc.extra_base;
          var max_length = desc.stat_desc.max_length;
          var h; /* heap index */
          var n, m; /* iterate over the tree elements */
          var bits; /* bit length */
          var xbits; /* extra bits */
          var f; /* frequency */
          var overflow = 0; /* number of elements with bit length too large */

          for (bits = 0; bits <= MAX_BITS; bits++) {
            s.bl_count[bits] = 0;
          }

          /* In a first pass, compute the optimal bit lengths (which may
           * overflow in the case of the bit length tree).
           */
          tree[s.heap[s.heap_max] * 2 + 1] /*.Len*/ = 0; /* root of the heap */

          for (h = s.heap_max + 1; h < HEAP_SIZE; h++) {
            n = s.heap[h];
            bits = tree[tree[n * 2 + 1] /*.Dad*/ * 2 + 1] /*.Len*/ + 1;
            if (bits > max_length) {
              bits = max_length;
              overflow++;
            }
            tree[n * 2 + 1] /*.Len*/ = bits;
            /* We overwrite tree[n].Dad which is no longer needed */

            if (n > max_code) {
              continue;
            } /* not a leaf node */

            s.bl_count[bits]++;
            xbits = 0;
            if (n >= base) {
              xbits = extra[n - base];
            }
            f = tree[n * 2] /*.Freq*/ ;
            s.opt_len += f * (bits + xbits);
            if (has_stree) {
              s.static_len += f * (stree[n * 2 + 1] /*.Len*/ + xbits);
            }
          }
          if (overflow === 0) {
            return;
          }

          // Trace((stderr,"\nbit length overflow\n"));
          /* This happens for example on obj2 and pic of the Calgary corpus */

          /* Find the first bit length which could increase: */
          do {
            bits = max_length - 1;
            while (s.bl_count[bits] === 0) {
              bits--;
            }
            s.bl_count[bits]--; /* move one leaf down the tree */
            s.bl_count[bits + 1] += 2; /* move one overflow item as its brother */
            s.bl_count[max_length]--;
            /* The brother of the overflow item also moves one step up,
             * but this does not affect bl_count[max_length]
             */
            overflow -= 2;
          } while (overflow > 0);

          /* Now recompute all bit lengths, scanning in increasing frequency.
           * h is still equal to HEAP_SIZE. (It is simpler to reconstruct all
           * lengths instead of fixing only the wrong ones. This idea is taken
           * from 'ar' written by Haruhiko Okumura.)
           */
          for (bits = max_length; bits !== 0; bits--) {
            n = s.bl_count[bits];
            while (n !== 0) {
              m = s.heap[--h];
              if (m > max_code) {
                continue;
              }
              if (tree[m * 2 + 1] /*.Len*/ !== bits) {
                // Trace((stderr,"code %d bits %d->%d\n", m, tree[m].Len, bits));
                s.opt_len += (bits - tree[m * 2 + 1] /*.Len*/ ) * tree[m * 2] /*.Freq*/ ;
                tree[m * 2 + 1] /*.Len*/ = bits;
              }
              n--;
            }
          }
        }


        /* ===========================================================================
         * Generate the codes for a given tree and bit counts (which need not be
         * optimal).
         * IN assertion: the array bl_count contains the bit length statistics for
         * the given tree and the field len is set for all tree elements.
         * OUT assertion: the field code is set for all tree elements of non
         *     zero code length.
         */
        function gen_codes(tree, max_code, bl_count) {
        //    ct_data *tree;             /* the tree to decorate */
        //    int max_code;              /* largest code with non zero frequency */
        //    ushf *bl_count;            /* number of codes at each bit length */

          var next_code = new Array(MAX_BITS + 1); /* next code value for each bit length */
          var code = 0; /* running code value */
          var bits; /* bit index */
          var n; /* code index */

          /* The distribution counts are first used to generate the code values
           * without bit reversal.
           */
          for (bits = 1; bits <= MAX_BITS; bits++) {
            next_code[bits] = code = (code + bl_count[bits - 1]) << 1;
          }
          /* Check that the bit counts in bl_count are consistent. The last code
           * must be all ones.
           */
          //Assert (code + bl_count[MAX_BITS]-1 == (1<<MAX_BITS)-1,
          //        "inconsistent bit counts");
          //Tracev((stderr,"\ngen_codes: max_code %d ", max_code));

          for (n = 0; n <= max_code; n++) {
            var len = tree[n * 2 + 1] /*.Len*/ ;
            if (len === 0) {
              continue;
            }
            /* Now reverse the bits */
            tree[n * 2] /*.Code*/ = bi_reverse(next_code[len]++, len);

            //Tracecv(tree != static_ltree, (stderr,"\nn %3d %c l %2d c %4x (%x) ",
            //     n, (isgraph(n) ? n : ' '), len, tree[n].Code, next_code[len]-1));
          }
        }


        /* ===========================================================================
         * Initialize the various 'constant' tables.
         */
        function tr_static_init() {
          var n; /* iterates over tree elements */
          var bits; /* bit counter */
          var length; /* length value */
          var code; /* code value */
          var dist; /* distance index */
          var bl_count = new Array(MAX_BITS + 1);
          /* number of codes at each bit length for an optimal tree */

          // do check in _tr_init()
          //if (static_init_done) return;

          /* For some embedded targets, global variables are not initialized: */
          /*#ifdef NO_INIT_GLOBAL_POINTERS
            static_l_desc.static_tree = static_ltree;
            static_l_desc.extra_bits = extra_lbits;
            static_d_desc.static_tree = static_dtree;
            static_d_desc.extra_bits = extra_dbits;
            static_bl_desc.extra_bits = extra_blbits;
          #endif*/

          /* Initialize the mapping length (0..255) -> length code (0..28) */
          length = 0;
          for (code = 0; code < LENGTH_CODES - 1; code++) {
            base_length[code] = length;
            for (n = 0; n < (1 << extra_lbits[code]); n++) {
              _length_code[length++] = code;
            }
          }
          //Assert (length == 256, "tr_static_init: length != 256");
          /* Note that the length 255 (match length 258) can be represented
           * in two different ways: code 284 + 5 bits or code 285, so we
           * overwrite length_code[255] to use the best encoding:
           */
          _length_code[length - 1] = code;

          /* Initialize the mapping dist (0..32K) -> dist code (0..29) */
          dist = 0;
          for (code = 0; code < 16; code++) {
            base_dist[code] = dist;
            for (n = 0; n < (1 << extra_dbits[code]); n++) {
              _dist_code[dist++] = code;
            }
          }
          //Assert (dist == 256, "tr_static_init: dist != 256");
          dist >>= 7; /* from now on, all distances are divided by 128 */
          for (; code < D_CODES; code++) {
            base_dist[code] = dist << 7;
            for (n = 0; n < (1 << (extra_dbits[code] - 7)); n++) {
              _dist_code[256 + dist++] = code;
            }
          }
          //Assert (dist == 256, "tr_static_init: 256+dist != 512");

          /* Construct the codes of the static literal tree */
          for (bits = 0; bits <= MAX_BITS; bits++) {
            bl_count[bits] = 0;
          }

          n = 0;
          while (n <= 143) {
            static_ltree[n * 2 + 1] /*.Len*/ = 8;
            n++;
            bl_count[8]++;
          }
          while (n <= 255) {
            static_ltree[n * 2 + 1] /*.Len*/ = 9;
            n++;
            bl_count[9]++;
          }
          while (n <= 279) {
            static_ltree[n * 2 + 1] /*.Len*/ = 7;
            n++;
            bl_count[7]++;
          }
          while (n <= 287) {
            static_ltree[n * 2 + 1] /*.Len*/ = 8;
            n++;
            bl_count[8]++;
          }
          /* Codes 286 and 287 do not exist, but we must include them in the
           * tree construction to get a canonical Huffman tree (longest code
           * all ones)
           */
          gen_codes(static_ltree, L_CODES + 1, bl_count);

          /* The static distance tree is trivial: */
          for (n = 0; n < D_CODES; n++) {
            static_dtree[n * 2 + 1] /*.Len*/ = 5;
            static_dtree[n * 2] /*.Code*/ = bi_reverse(n, 5);
          }

          // Now data ready and we can init static trees
          static_l_desc = new StaticTreeDesc(static_ltree, extra_lbits, LITERALS + 1, L_CODES, MAX_BITS);
          static_d_desc = new StaticTreeDesc(static_dtree, extra_dbits, 0, D_CODES, MAX_BITS);
          static_bl_desc = new StaticTreeDesc(new Array(0), extra_blbits, 0, BL_CODES, MAX_BL_BITS);

          //static_init_done = true;
        }


        /* ===========================================================================
         * Initialize a new block.
         */
        function init_block(s) {
          var n; /* iterates over tree elements */

          /* Initialize the trees. */
          for (n = 0; n < L_CODES; n++) {
            s.dyn_ltree[n * 2] /*.Freq*/ = 0;
          }
          for (n = 0; n < D_CODES; n++) {
            s.dyn_dtree[n * 2] /*.Freq*/ = 0;
          }
          for (n = 0; n < BL_CODES; n++) {
            s.bl_tree[n * 2] /*.Freq*/ = 0;
          }

          s.dyn_ltree[END_BLOCK * 2] /*.Freq*/ = 1;
          s.opt_len = s.static_len = 0;
          s.last_lit = s.matches = 0;
        }


        /* ===========================================================================
         * Flush the bit buffer and align the output on a byte boundary
         */
        function bi_windup(s) {
          if (s.bi_valid > 8) {
            put_short(s, s.bi_buf);
          } else if (s.bi_valid > 0) {
            //put_byte(s, (Byte)s->bi_buf);
            s.pending_buf[s.pending++] = s.bi_buf;
          }
          s.bi_buf = 0;
          s.bi_valid = 0;
        }

        /* ===========================================================================
         * Copy a stored block, storing first the length and its
         * one's complement if requested.
         */
        function copy_block(s, buf, len, header) {
        //DeflateState *s;
        //charf    *buf;    /* the input data */
        //unsigned len;     /* its length */
        //int      header;  /* true if block header must be written */

          bi_windup(s); /* align on byte boundary */

          if (header) {
            put_short(s, len);
            put_short(s, ~len);
          }
          //  while (len--) {
          //    put_byte(s, *buf++);
          //  }
          arraySet(s.pending_buf, s.window, buf, len, s.pending);
          s.pending += len;
        }

        /* ===========================================================================
         * Compares to subtrees, using the tree depth as tie breaker when
         * the subtrees have equal frequency. This minimizes the worst case length.
         */
        function smaller(tree, n, m, depth) {
          var _n2 = n * 2;
          var _m2 = m * 2;
          return (tree[_n2] /*.Freq*/ < tree[_m2] /*.Freq*/ ||
            (tree[_n2] /*.Freq*/ === tree[_m2] /*.Freq*/ && depth[n] <= depth[m]));
        }

        /* ===========================================================================
         * Restore the heap property by moving down the tree starting at node k,
         * exchanging a node with the smallest of its two sons if necessary, stopping
         * when the heap property is re-established (each father smaller than its
         * two sons).
         */
        function pqdownheap(s, tree, k)
        //    deflate_state *s;
        //    ct_data *tree;  /* the tree to restore */
        //    int k;               /* node to move down */
        {
          var v = s.heap[k];
          var j = k << 1; /* left son of k */
          while (j <= s.heap_len) {
            /* Set j to the smallest of the two sons: */
            if (j < s.heap_len &&
              smaller(tree, s.heap[j + 1], s.heap[j], s.depth)) {
              j++;
            }
            /* Exit if v is smaller than both sons */
            if (smaller(tree, v, s.heap[j], s.depth)) {
              break;
            }

            /* Exchange v with the smallest son */
            s.heap[k] = s.heap[j];
            k = j;

            /* And continue down the tree, setting j to the left son of k */
            j <<= 1;
          }
          s.heap[k] = v;
        }


        // inlined manually
        // var SMALLEST = 1;

        /* ===========================================================================
         * Send the block data compressed using the given Huffman trees
         */
        function compress_block(s, ltree, dtree)
        //    deflate_state *s;
        //    const ct_data *ltree; /* literal tree */
        //    const ct_data *dtree; /* distance tree */
        {
          var dist; /* distance of matched string */
          var lc; /* match length or unmatched char (if dist == 0) */
          var lx = 0; /* running index in l_buf */
          var code; /* the code to send */
          var extra; /* number of extra bits to send */

          if (s.last_lit !== 0) {
            do {
              dist = (s.pending_buf[s.d_buf + lx * 2] << 8) | (s.pending_buf[s.d_buf + lx * 2 + 1]);
              lc = s.pending_buf[s.l_buf + lx];
              lx++;

              if (dist === 0) {
                send_code(s, lc, ltree); /* send a literal byte */
                //Tracecv(isgraph(lc), (stderr," '%c' ", lc));
              } else {
                /* Here, lc is the match length - MIN_MATCH */
                code = _length_code[lc];
                send_code(s, code + LITERALS + 1, ltree); /* send the length code */
                extra = extra_lbits[code];
                if (extra !== 0) {
                  lc -= base_length[code];
                  send_bits(s, lc, extra); /* send the extra length bits */
                }
                dist--; /* dist is now the match distance - 1 */
                code = d_code(dist);
                //Assert (code < D_CODES, "bad d_code");

                send_code(s, code, dtree); /* send the distance code */
                extra = extra_dbits[code];
                if (extra !== 0) {
                  dist -= base_dist[code];
                  send_bits(s, dist, extra); /* send the extra distance bits */
                }
              } /* literal or match pair ? */

              /* Check that the overlay between pending_buf and d_buf+l_buf is ok: */
              //Assert((uInt)(s->pending) < s->lit_bufsize + 2*lx,
              //       "pendingBuf overflow");

            } while (lx < s.last_lit);
          }

          send_code(s, END_BLOCK, ltree);
        }


        /* ===========================================================================
         * Construct one Huffman tree and assigns the code bit strings and lengths.
         * Update the total bit length for the current block.
         * IN assertion: the field freq is set for all tree elements.
         * OUT assertions: the fields len and code are set to the optimal bit length
         *     and corresponding code. The length opt_len is updated; static_len is
         *     also updated if stree is not null. The field max_code is set.
         */
        function build_tree(s, desc)
        //    deflate_state *s;
        //    tree_desc *desc; /* the tree descriptor */
        {
          var tree = desc.dyn_tree;
          var stree = desc.stat_desc.static_tree;
          var has_stree = desc.stat_desc.has_stree;
          var elems = desc.stat_desc.elems;
          var n, m; /* iterate over heap elements */
          var max_code = -1; /* largest code with non zero frequency */
          var node; /* new node being created */

          /* Construct the initial heap, with least frequent element in
           * heap[SMALLEST]. The sons of heap[n] are heap[2*n] and heap[2*n+1].
           * heap[0] is not used.
           */
          s.heap_len = 0;
          s.heap_max = HEAP_SIZE;

          for (n = 0; n < elems; n++) {
            if (tree[n * 2] /*.Freq*/ !== 0) {
              s.heap[++s.heap_len] = max_code = n;
              s.depth[n] = 0;

            } else {
              tree[n * 2 + 1] /*.Len*/ = 0;
            }
          }

          /* The pkzip format requires that at least one distance code exists,
           * and that at least one bit should be sent even if there is only one
           * possible code. So to avoid special checks later on we force at least
           * two codes of non zero frequency.
           */
          while (s.heap_len < 2) {
            node = s.heap[++s.heap_len] = (max_code < 2 ? ++max_code : 0);
            tree[node * 2] /*.Freq*/ = 1;
            s.depth[node] = 0;
            s.opt_len--;

            if (has_stree) {
              s.static_len -= stree[node * 2 + 1] /*.Len*/ ;
            }
            /* node is 0 or 1 so it does not have extra bits */
          }
          desc.max_code = max_code;

          /* The elements heap[heap_len/2+1 .. heap_len] are leaves of the tree,
           * establish sub-heaps of increasing lengths:
           */
          for (n = (s.heap_len >> 1 /*int /2*/ ); n >= 1; n--) {
            pqdownheap(s, tree, n);
          }

          /* Construct the Huffman tree by repeatedly combining the least two
           * frequent nodes.
           */
          node = elems; /* next internal node of the tree */
          do {
            //pqremove(s, tree, n);  /* n = node of least frequency */
            /*** pqremove ***/
            n = s.heap[1 /*SMALLEST*/ ];
            s.heap[1 /*SMALLEST*/ ] = s.heap[s.heap_len--];
            pqdownheap(s, tree, 1 /*SMALLEST*/ );
            /***/

            m = s.heap[1 /*SMALLEST*/ ]; /* m = node of next least frequency */

            s.heap[--s.heap_max] = n; /* keep the nodes sorted by frequency */
            s.heap[--s.heap_max] = m;

            /* Create a new node father of n and m */
            tree[node * 2] /*.Freq*/ = tree[n * 2] /*.Freq*/ + tree[m * 2] /*.Freq*/ ;
            s.depth[node] = (s.depth[n] >= s.depth[m] ? s.depth[n] : s.depth[m]) + 1;
            tree[n * 2 + 1] /*.Dad*/ = tree[m * 2 + 1] /*.Dad*/ = node;

            /* and insert the new node in the heap */
            s.heap[1 /*SMALLEST*/ ] = node++;
            pqdownheap(s, tree, 1 /*SMALLEST*/ );

          } while (s.heap_len >= 2);

          s.heap[--s.heap_max] = s.heap[1 /*SMALLEST*/ ];

          /* At this point, the fields freq and dad are set. We can now
           * generate the bit lengths.
           */
          gen_bitlen(s, desc);

          /* The field len is now set, we can generate the bit codes */
          gen_codes(tree, max_code, s.bl_count);
        }


        /* ===========================================================================
         * Scan a literal or distance tree to determine the frequencies of the codes
         * in the bit length tree.
         */
        function scan_tree(s, tree, max_code)
        //    deflate_state *s;
        //    ct_data *tree;   /* the tree to be scanned */
        //    int max_code;    /* and its largest code of non zero frequency */
        {
          var n; /* iterates over all tree elements */
          var prevlen = -1; /* last emitted length */
          var curlen; /* length of current code */

          var nextlen = tree[0 * 2 + 1] /*.Len*/ ; /* length of next code */

          var count = 0; /* repeat count of the current code */
          var max_count = 7; /* max repeat count */
          var min_count = 4; /* min repeat count */

          if (nextlen === 0) {
            max_count = 138;
            min_count = 3;
          }
          tree[(max_code + 1) * 2 + 1] /*.Len*/ = 0xffff; /* guard */

          for (n = 0; n <= max_code; n++) {
            curlen = nextlen;
            nextlen = tree[(n + 1) * 2 + 1] /*.Len*/ ;

            if (++count < max_count && curlen === nextlen) {
              continue;

            } else if (count < min_count) {
              s.bl_tree[curlen * 2] /*.Freq*/ += count;

            } else if (curlen !== 0) {

              if (curlen !== prevlen) {
                s.bl_tree[curlen * 2] /*.Freq*/ ++;
              }
              s.bl_tree[REP_3_6 * 2] /*.Freq*/ ++;

            } else if (count <= 10) {
              s.bl_tree[REPZ_3_10 * 2] /*.Freq*/ ++;

            } else {
              s.bl_tree[REPZ_11_138 * 2] /*.Freq*/ ++;
            }

            count = 0;
            prevlen = curlen;

            if (nextlen === 0) {
              max_count = 138;
              min_count = 3;

            } else if (curlen === nextlen) {
              max_count = 6;
              min_count = 3;

            } else {
              max_count = 7;
              min_count = 4;
            }
          }
        }


        /* ===========================================================================
         * Send a literal or distance tree in compressed form, using the codes in
         * bl_tree.
         */
        function send_tree(s, tree, max_code)
        //    deflate_state *s;
        //    ct_data *tree; /* the tree to be scanned */
        //    int max_code;       /* and its largest code of non zero frequency */
        {
          var n; /* iterates over all tree elements */
          var prevlen = -1; /* last emitted length */
          var curlen; /* length of current code */

          var nextlen = tree[0 * 2 + 1] /*.Len*/ ; /* length of next code */

          var count = 0; /* repeat count of the current code */
          var max_count = 7; /* max repeat count */
          var min_count = 4; /* min repeat count */

          /* tree[max_code+1].Len = -1; */
          /* guard already set */
          if (nextlen === 0) {
            max_count = 138;
            min_count = 3;
          }

          for (n = 0; n <= max_code; n++) {
            curlen = nextlen;
            nextlen = tree[(n + 1) * 2 + 1] /*.Len*/ ;

            if (++count < max_count && curlen === nextlen) {
              continue;

            } else if (count < min_count) {
              do {
                send_code(s, curlen, s.bl_tree);
              } while (--count !== 0);

            } else if (curlen !== 0) {
              if (curlen !== prevlen) {
                send_code(s, curlen, s.bl_tree);
                count--;
              }
              //Assert(count >= 3 && count <= 6, " 3_6?");
              send_code(s, REP_3_6, s.bl_tree);
              send_bits(s, count - 3, 2);

            } else if (count <= 10) {
              send_code(s, REPZ_3_10, s.bl_tree);
              send_bits(s, count - 3, 3);

            } else {
              send_code(s, REPZ_11_138, s.bl_tree);
              send_bits(s, count - 11, 7);
            }

            count = 0;
            prevlen = curlen;
            if (nextlen === 0) {
              max_count = 138;
              min_count = 3;

            } else if (curlen === nextlen) {
              max_count = 6;
              min_count = 3;

            } else {
              max_count = 7;
              min_count = 4;
            }
          }
        }


        /* ===========================================================================
         * Construct the Huffman tree for the bit lengths and return the index in
         * bl_order of the last bit length code to send.
         */
        function build_bl_tree(s) {
          var max_blindex; /* index of last bit length code of non zero freq */

          /* Determine the bit length frequencies for literal and distance trees */
          scan_tree(s, s.dyn_ltree, s.l_desc.max_code);
          scan_tree(s, s.dyn_dtree, s.d_desc.max_code);

          /* Build the bit length tree: */
          build_tree(s, s.bl_desc);
          /* opt_len now includes the length of the tree representations, except
           * the lengths of the bit lengths codes and the 5+5+4 bits for the counts.
           */

          /* Determine the number of bit length codes to send. The pkzip format
           * requires that at least 4 bit length codes be sent. (appnote.txt says
           * 3 but the actual value used is 4.)
           */
          for (max_blindex = BL_CODES - 1; max_blindex >= 3; max_blindex--) {
            if (s.bl_tree[bl_order[max_blindex] * 2 + 1] /*.Len*/ !== 0) {
              break;
            }
          }
          /* Update opt_len to include the bit length tree and counts */
          s.opt_len += 3 * (max_blindex + 1) + 5 + 5 + 4;
          //Tracev((stderr, "\ndyn trees: dyn %ld, stat %ld",
          //        s->opt_len, s->static_len));

          return max_blindex;
        }


        /* ===========================================================================
         * Send the header for a block using dynamic Huffman trees: the counts, the
         * lengths of the bit length codes, the literal tree and the distance tree.
         * IN assertion: lcodes >= 257, dcodes >= 1, blcodes >= 4.
         */
        function send_all_trees(s, lcodes, dcodes, blcodes)
        //    deflate_state *s;
        //    int lcodes, dcodes, blcodes; /* number of codes for each tree */
        {
          var rank; /* index in bl_order */

          //Assert (lcodes >= 257 && dcodes >= 1 && blcodes >= 4, "not enough codes");
          //Assert (lcodes <= L_CODES && dcodes <= D_CODES && blcodes <= BL_CODES,
          //        "too many codes");
          //Tracev((stderr, "\nbl counts: "));
          send_bits(s, lcodes - 257, 5); /* not +255 as stated in appnote.txt */
          send_bits(s, dcodes - 1, 5);
          send_bits(s, blcodes - 4, 4); /* not -3 as stated in appnote.txt */
          for (rank = 0; rank < blcodes; rank++) {
            //Tracev((stderr, "\nbl code %2d ", bl_order[rank]));
            send_bits(s, s.bl_tree[bl_order[rank] * 2 + 1] /*.Len*/ , 3);
          }
          //Tracev((stderr, "\nbl tree: sent %ld", s->bits_sent));

          send_tree(s, s.dyn_ltree, lcodes - 1); /* literal tree */
          //Tracev((stderr, "\nlit tree: sent %ld", s->bits_sent));

          send_tree(s, s.dyn_dtree, dcodes - 1); /* distance tree */
          //Tracev((stderr, "\ndist tree: sent %ld", s->bits_sent));
        }


        /* ===========================================================================
         * Check if the data type is TEXT or BINARY, using the following algorithm:
         * - TEXT if the two conditions below are satisfied:
         *    a) There are no non-portable control characters belonging to the
         *       "black list" (0..6, 14..25, 28..31).
         *    b) There is at least one printable character belonging to the
         *       "white list" (9 {TAB}, 10 {LF}, 13 {CR}, 32..255).
         * - BINARY otherwise.
         * - The following partially-portable control characters form a
         *   "gray list" that is ignored in this detection algorithm:
         *   (7 {BEL}, 8 {BS}, 11 {VT}, 12 {FF}, 26 {SUB}, 27 {ESC}).
         * IN assertion: the fields Freq of dyn_ltree are set.
         */
        function detect_data_type(s) {
          /* black_mask is the bit mask of black-listed bytes
           * set bits 0..6, 14..25, and 28..31
           * 0xf3ffc07f = binary 11110011111111111100000001111111
           */
          var black_mask = 0xf3ffc07f;
          var n;

          /* Check for non-textual ("black-listed") bytes. */
          for (n = 0; n <= 31; n++, black_mask >>>= 1) {
            if ((black_mask & 1) && (s.dyn_ltree[n * 2] /*.Freq*/ !== 0)) {
              return Z_BINARY;
            }
          }

          /* Check for textual ("white-listed") bytes. */
          if (s.dyn_ltree[9 * 2] /*.Freq*/ !== 0 || s.dyn_ltree[10 * 2] /*.Freq*/ !== 0 ||
            s.dyn_ltree[13 * 2] /*.Freq*/ !== 0) {
            return Z_TEXT;
          }
          for (n = 32; n < LITERALS; n++) {
            if (s.dyn_ltree[n * 2] /*.Freq*/ !== 0) {
              return Z_TEXT;
            }
          }

          /* There are no "black-listed" or "white-listed" bytes:
           * this stream either is empty or has tolerated ("gray-listed") bytes only.
           */
          return Z_BINARY;
        }


        var static_init_done = false;

        /* ===========================================================================
         * Initialize the tree data structures for a new zlib stream.
         */
        function _tr_init(s) {

          if (!static_init_done) {
            tr_static_init();
            static_init_done = true;
          }

          s.l_desc = new TreeDesc(s.dyn_ltree, static_l_desc);
          s.d_desc = new TreeDesc(s.dyn_dtree, static_d_desc);
          s.bl_desc = new TreeDesc(s.bl_tree, static_bl_desc);

          s.bi_buf = 0;
          s.bi_valid = 0;

          /* Initialize the first block of the first file: */
          init_block(s);
        }


        /* ===========================================================================
         * Send a stored block
         */
        function _tr_stored_block(s, buf, stored_len, last)
        //DeflateState *s;
        //charf *buf;       /* input block */
        //ulg stored_len;   /* length of input block */
        //int last;         /* one if this is the last block for a file */
        {
          send_bits(s, (STORED_BLOCK << 1) + (last ? 1 : 0), 3); /* send block type */
          copy_block(s, buf, stored_len, true); /* with header */
        }


        /* ===========================================================================
         * Send one empty static block to give enough lookahead for inflate.
         * This takes 10 bits, of which 7 may remain in the bit buffer.
         */
        function _tr_align(s) {
          send_bits(s, STATIC_TREES << 1, 3);
          send_code(s, END_BLOCK, static_ltree);
          bi_flush(s);
        }


        /* ===========================================================================
         * Determine the best encoding for the current block: dynamic trees, static
         * trees or store, and output the encoded block to the zip file.
         */
        function _tr_flush_block(s, buf, stored_len, last)
        //DeflateState *s;
        //charf *buf;       /* input block, or NULL if too old */
        //ulg stored_len;   /* length of input block */
        //int last;         /* one if this is the last block for a file */
        {
          var opt_lenb, static_lenb; /* opt_len and static_len in bytes */
          var max_blindex = 0; /* index of last bit length code of non zero freq */

          /* Build the Huffman trees unless a stored block is forced */
          if (s.level > 0) {

            /* Check if the file is binary or text */
            if (s.strm.data_type === Z_UNKNOWN) {
              s.strm.data_type = detect_data_type(s);
            }

            /* Construct the literal and distance trees */
            build_tree(s, s.l_desc);
            // Tracev((stderr, "\nlit data: dyn %ld, stat %ld", s->opt_len,
            //        s->static_len));

            build_tree(s, s.d_desc);
            // Tracev((stderr, "\ndist data: dyn %ld, stat %ld", s->opt_len,
            //        s->static_len));
            /* At this point, opt_len and static_len are the total bit lengths of
             * the compressed block data, excluding the tree representations.
             */

            /* Build the bit length tree for the above two trees, and get the index
             * in bl_order of the last bit length code to send.
             */
            max_blindex = build_bl_tree(s);

            /* Determine the best encoding. Compute the block lengths in bytes. */
            opt_lenb = (s.opt_len + 3 + 7) >>> 3;
            static_lenb = (s.static_len + 3 + 7) >>> 3;

            // Tracev((stderr, "\nopt %lu(%lu) stat %lu(%lu) stored %lu lit %u ",
            //        opt_lenb, s->opt_len, static_lenb, s->static_len, stored_len,
            //        s->last_lit));

            if (static_lenb <= opt_lenb) {
              opt_lenb = static_lenb;
            }

          } else {
            // Assert(buf != (char*)0, "lost buf");
            opt_lenb = static_lenb = stored_len + 5; /* force a stored block */
          }

          if ((stored_len + 4 <= opt_lenb) && (buf !== -1)) {
            /* 4: two words for the lengths */

            /* The test buf != NULL is only necessary if LIT_BUFSIZE > WSIZE.
             * Otherwise we can't have processed more than WSIZE input bytes since
             * the last block flush, because compression would have been
             * successful. If LIT_BUFSIZE <= WSIZE, it is never too late to
             * transform a block into a stored block.
             */
            _tr_stored_block(s, buf, stored_len, last);

          } else if (s.strategy === Z_FIXED || static_lenb === opt_lenb) {

            send_bits(s, (STATIC_TREES << 1) + (last ? 1 : 0), 3);
            compress_block(s, static_ltree, static_dtree);

          } else {
            send_bits(s, (DYN_TREES << 1) + (last ? 1 : 0), 3);
            send_all_trees(s, s.l_desc.max_code + 1, s.d_desc.max_code + 1, max_blindex + 1);
            compress_block(s, s.dyn_ltree, s.dyn_dtree);
          }
          // Assert (s->compressed_len == s->bits_sent, "bad compressed size");
          /* The above check is made mod 2^32, for files larger than 512 MB
           * and uLong implemented on 32 bits.
           */
          init_block(s);

          if (last) {
            bi_windup(s);
          }
          // Tracev((stderr,"\ncomprlen %lu(%lu) ", s->compressed_len>>3,
          //       s->compressed_len-7*last));
        }

        /* ===========================================================================
         * Save the match info and tally the frequency counts. Return true if
         * the current block must be flushed.
         */
        function _tr_tally(s, dist, lc)
        //    deflate_state *s;
        //    unsigned dist;  /* distance of matched string */
        //    unsigned lc;    /* match length-MIN_MATCH or unmatched char (if dist==0) */
        {
          //var out_length, in_length, dcode;

          s.pending_buf[s.d_buf + s.last_lit * 2] = (dist >>> 8) & 0xff;
          s.pending_buf[s.d_buf + s.last_lit * 2 + 1] = dist & 0xff;

          s.pending_buf[s.l_buf + s.last_lit] = lc & 0xff;
          s.last_lit++;

          if (dist === 0) {
            /* lc is the unmatched char */
            s.dyn_ltree[lc * 2] /*.Freq*/ ++;
          } else {
            s.matches++;
            /* Here, lc is the match length - MIN_MATCH */
            dist--; /* dist = match distance - 1 */
            //Assert((ush)dist < (ush)MAX_DIST(s) &&
            //       (ush)lc <= (ush)(MAX_MATCH-MIN_MATCH) &&
            //       (ush)d_code(dist) < (ush)D_CODES,  "_tr_tally: bad match");

            s.dyn_ltree[(_length_code[lc] + LITERALS + 1) * 2] /*.Freq*/ ++;
            s.dyn_dtree[d_code(dist) * 2] /*.Freq*/ ++;
          }

          // (!) This block is disabled in zlib defailts,
          // don't enable it for binary compatibility

          //#ifdef TRUNCATE_BLOCK
          //  /* Try to guess if it is profitable to stop the current block here */
          //  if ((s.last_lit & 0x1fff) === 0 && s.level > 2) {
          //    /* Compute an upper bound for the compressed length */
          //    out_length = s.last_lit*8;
          //    in_length = s.strstart - s.block_start;
          //
          //    for (dcode = 0; dcode < D_CODES; dcode++) {
          //      out_length += s.dyn_dtree[dcode*2]/*.Freq*/ * (5 + extra_dbits[dcode]);
          //    }
          //    out_length >>>= 3;
          //    //Tracev((stderr,"\nlast_lit %u, in %ld, out ~%ld(%ld%%) ",
          //    //       s->last_lit, in_length, out_length,
          //    //       100L - out_length*100L/in_length));
          //    if (s.matches < (s.last_lit>>1)/*int /2*/ && out_length < (in_length>>1)/*int /2*/) {
          //      return true;
          //    }
          //  }
          //#endif

          return (s.last_lit === s.lit_bufsize - 1);
          /* We avoid equality with lit_bufsize because of wraparound at 64K
           * on 16 bit machines and because stored blocks are restricted to
           * 64K-1 bytes.
           */
        }

        // Note: adler32 takes 12% for level 0 and 2% for level 6.
        // It doesn't worth to make additional optimizationa as in original.
        // Small size is preferable.

        function adler32(adler, buf, len, pos) {
          var s1 = (adler & 0xffff) |0,
              s2 = ((adler >>> 16) & 0xffff) |0,
              n = 0;

          while (len !== 0) {
            // Set limit ~ twice less than 5552, to keep
            // s2 in 31-bits, because we force signed ints.
            // in other case %= will fail.
            n = len > 2000 ? 2000 : len;
            len -= n;

            do {
              s1 = (s1 + buf[pos++]) |0;
              s2 = (s2 + s1) |0;
            } while (--n);

            s1 %= 65521;
            s2 %= 65521;
          }

          return (s1 | (s2 << 16)) |0;
        }

        // Note: we can't get significant speed boost here.
        // So write code to minimize size - no pregenerated tables
        // and array tools dependencies.


        // Use ordinary array, since untyped makes no boost here
        function makeTable() {
          var c, table = [];

          for (var n = 0; n < 256; n++) {
            c = n;
            for (var k = 0; k < 8; k++) {
              c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
            }
            table[n] = c;
          }

          return table;
        }

        // Create table on load. Just 255 signed longs. Not a problem.
        var crcTable = makeTable();


        function crc32(crc, buf, len, pos) {
          var t = crcTable,
              end = pos + len;

          crc ^= -1;

          for (var i = pos; i < end; i++) {
            crc = (crc >>> 8) ^ t[(crc ^ buf[i]) & 0xFF];
          }

          return (crc ^ (-1)); // >>> 0;
        }

        /* Public constants ==========================================================*/
        /* ===========================================================================*/


        /* Allowed flush values; see deflate() and inflate() below for details */
        var Z_NO_FLUSH = 0;
        var Z_PARTIAL_FLUSH = 1;
        //var Z_SYNC_FLUSH    = 2;
        var Z_FULL_FLUSH = 3;
        var Z_FINISH = 4;
        var Z_BLOCK = 5;
        //var Z_TREES         = 6;


        /* Return codes for the compression/decompression functions. Negative values
         * are errors, positive values are used for special but normal events.
         */
        var Z_OK = 0;
        var Z_STREAM_END = 1;
        //var Z_NEED_DICT     = 2;
        //var Z_ERRNO         = -1;
        var Z_STREAM_ERROR = -2;
        var Z_DATA_ERROR = -3;
        //var Z_MEM_ERROR     = -4;
        var Z_BUF_ERROR = -5;
        //var Z_VERSION_ERROR = -6;


        /* compression levels */
        //var Z_NO_COMPRESSION      = 0;
        //var Z_BEST_SPEED          = 1;
        //var Z_BEST_COMPRESSION    = 9;
        var Z_DEFAULT_COMPRESSION = -1;


        var Z_FILTERED = 1;
        var Z_HUFFMAN_ONLY = 2;
        var Z_RLE = 3;
        var Z_FIXED$1 = 4;

        /* Possible values of the data_type field (though see inflate()) */
        //var Z_BINARY              = 0;
        //var Z_TEXT                = 1;
        //var Z_ASCII               = 1; // = Z_TEXT
        var Z_UNKNOWN$1 = 2;


        /* The deflate compression method */
        var Z_DEFLATED = 8;

        /*============================================================================*/


        var MAX_MEM_LEVEL = 9;


        var LENGTH_CODES$1 = 29;
        /* number of length codes, not counting the special END_BLOCK code */
        var LITERALS$1 = 256;
        /* number of literal bytes 0..255 */
        var L_CODES$1 = LITERALS$1 + 1 + LENGTH_CODES$1;
        /* number of Literal or Length codes, including the END_BLOCK code */
        var D_CODES$1 = 30;
        /* number of distance codes */
        var BL_CODES$1 = 19;
        /* number of codes used to transfer the bit lengths */
        var HEAP_SIZE$1 = 2 * L_CODES$1 + 1;
        /* maximum heap size */
        var MAX_BITS$1 = 15;
        /* All codes must not exceed MAX_BITS bits */

        var MIN_MATCH$1 = 3;
        var MAX_MATCH$1 = 258;
        var MIN_LOOKAHEAD = (MAX_MATCH$1 + MIN_MATCH$1 + 1);

        var PRESET_DICT = 0x20;

        var INIT_STATE = 42;
        var EXTRA_STATE = 69;
        var NAME_STATE = 73;
        var COMMENT_STATE = 91;
        var HCRC_STATE = 103;
        var BUSY_STATE = 113;
        var FINISH_STATE = 666;

        var BS_NEED_MORE = 1; /* block not completed, need more input or more output */
        var BS_BLOCK_DONE = 2; /* block flush performed */
        var BS_FINISH_STARTED = 3; /* finish started, need only more output at next deflate */
        var BS_FINISH_DONE = 4; /* finish done, accept no more input or output */

        var OS_CODE = 0x03; // Unix :) . Don't detect, use this default.

        function err(strm, errorCode) {
          strm.msg = msg[errorCode];
          return errorCode;
        }

        function rank(f) {
          return ((f) << 1) - ((f) > 4 ? 9 : 0);
        }

        function zero$1(buf) {
          var len = buf.length;
          while (--len >= 0) {
            buf[len] = 0;
          }
        }


        /* =========================================================================
         * Flush as much pending output as possible. All deflate() output goes
         * through this function so some applications may wish to modify it
         * to avoid allocating a large strm->output buffer and copying into it.
         * (See also read_buf()).
         */
        function flush_pending(strm) {
          var s = strm.state;

          //_tr_flush_bits(s);
          var len = s.pending;
          if (len > strm.avail_out) {
            len = strm.avail_out;
          }
          if (len === 0) {
            return;
          }

          arraySet(strm.output, s.pending_buf, s.pending_out, len, strm.next_out);
          strm.next_out += len;
          s.pending_out += len;
          strm.total_out += len;
          strm.avail_out -= len;
          s.pending -= len;
          if (s.pending === 0) {
            s.pending_out = 0;
          }
        }


        function flush_block_only(s, last) {
          _tr_flush_block(s, (s.block_start >= 0 ? s.block_start : -1), s.strstart - s.block_start, last);
          s.block_start = s.strstart;
          flush_pending(s.strm);
        }


        function put_byte(s, b) {
          s.pending_buf[s.pending++] = b;
        }


        /* =========================================================================
         * Put a short in the pending buffer. The 16-bit value is put in MSB order.
         * IN assertion: the stream state is correct and there is enough room in
         * pending_buf.
         */
        function putShortMSB(s, b) {
          //  put_byte(s, (Byte)(b >> 8));
          //  put_byte(s, (Byte)(b & 0xff));
          s.pending_buf[s.pending++] = (b >>> 8) & 0xff;
          s.pending_buf[s.pending++] = b & 0xff;
        }


        /* ===========================================================================
         * Read a new buffer from the current input stream, update the adler32
         * and total number of bytes read.  All deflate() input goes through
         * this function so some applications may wish to modify it to avoid
         * allocating a large strm->input buffer and copying from it.
         * (See also flush_pending()).
         */
        function read_buf(strm, buf, start, size) {
          var len = strm.avail_in;

          if (len > size) {
            len = size;
          }
          if (len === 0) {
            return 0;
          }

          strm.avail_in -= len;

          // zmemcpy(buf, strm->next_in, len);
          arraySet(buf, strm.input, strm.next_in, len, start);
          if (strm.state.wrap === 1) {
            strm.adler = adler32(strm.adler, buf, len, start);
          } else if (strm.state.wrap === 2) {
            strm.adler = crc32(strm.adler, buf, len, start);
          }

          strm.next_in += len;
          strm.total_in += len;

          return len;
        }


        /* ===========================================================================
         * Set match_start to the longest match starting at the given string and
         * return its length. Matches shorter or equal to prev_length are discarded,
         * in which case the result is equal to prev_length and match_start is
         * garbage.
         * IN assertions: cur_match is the head of the hash chain for the current
         *   string (strstart) and its distance is <= MAX_DIST, and prev_length >= 1
         * OUT assertion: the match length is not greater than s->lookahead.
         */
        function longest_match(s, cur_match) {
          var chain_length = s.max_chain_length; /* max hash chain length */
          var scan = s.strstart; /* current string */
          var match; /* matched string */
          var len; /* length of current match */
          var best_len = s.prev_length; /* best match length so far */
          var nice_match = s.nice_match; /* stop if match long enough */
          var limit = (s.strstart > (s.w_size - MIN_LOOKAHEAD)) ?
            s.strstart - (s.w_size - MIN_LOOKAHEAD) : 0 /*NIL*/ ;

          var _win = s.window; // shortcut

          var wmask = s.w_mask;
          var prev = s.prev;

          /* Stop when cur_match becomes <= limit. To simplify the code,
           * we prevent matches with the string of window index 0.
           */

          var strend = s.strstart + MAX_MATCH$1;
          var scan_end1 = _win[scan + best_len - 1];
          var scan_end = _win[scan + best_len];

          /* The code is optimized for HASH_BITS >= 8 and MAX_MATCH-2 multiple of 16.
           * It is easy to get rid of this optimization if necessary.
           */
          // Assert(s->hash_bits >= 8 && MAX_MATCH == 258, "Code too clever");

          /* Do not waste too much time if we already have a good match: */
          if (s.prev_length >= s.good_match) {
            chain_length >>= 2;
          }
          /* Do not look for matches beyond the end of the input. This is necessary
           * to make deflate deterministic.
           */
          if (nice_match > s.lookahead) {
            nice_match = s.lookahead;
          }

          // Assert((ulg)s->strstart <= s->window_size-MIN_LOOKAHEAD, "need lookahead");

          do {
            // Assert(cur_match < s->strstart, "no future");
            match = cur_match;

            /* Skip to next match if the match length cannot increase
             * or if the match length is less than 2.  Note that the checks below
             * for insufficient lookahead only occur occasionally for performance
             * reasons.  Therefore uninitialized memory will be accessed, and
             * conditional jumps will be made that depend on those values.
             * However the length of the match is limited to the lookahead, so
             * the output of deflate is not affected by the uninitialized values.
             */

            if (_win[match + best_len] !== scan_end ||
              _win[match + best_len - 1] !== scan_end1 ||
              _win[match] !== _win[scan] ||
              _win[++match] !== _win[scan + 1]) {
              continue;
            }

            /* The check at best_len-1 can be removed because it will be made
             * again later. (This heuristic is not always a win.)
             * It is not necessary to compare scan[2] and match[2] since they
             * are always equal when the other bytes match, given that
             * the hash keys are equal and that HASH_BITS >= 8.
             */
            scan += 2;
            match++;
            // Assert(*scan == *match, "match[2]?");

            /* We check for insufficient lookahead only every 8th comparison;
             * the 256th check will be made at strstart+258.
             */
            do {
              /*jshint noempty:false*/
            } while (_win[++scan] === _win[++match] && _win[++scan] === _win[++match] &&
              _win[++scan] === _win[++match] && _win[++scan] === _win[++match] &&
              _win[++scan] === _win[++match] && _win[++scan] === _win[++match] &&
              _win[++scan] === _win[++match] && _win[++scan] === _win[++match] &&
              scan < strend);

            // Assert(scan <= s->window+(unsigned)(s->window_size-1), "wild scan");

            len = MAX_MATCH$1 - (strend - scan);
            scan = strend - MAX_MATCH$1;

            if (len > best_len) {
              s.match_start = cur_match;
              best_len = len;
              if (len >= nice_match) {
                break;
              }
              scan_end1 = _win[scan + best_len - 1];
              scan_end = _win[scan + best_len];
            }
          } while ((cur_match = prev[cur_match & wmask]) > limit && --chain_length !== 0);

          if (best_len <= s.lookahead) {
            return best_len;
          }
          return s.lookahead;
        }


        /* ===========================================================================
         * Fill the window when the lookahead becomes insufficient.
         * Updates strstart and lookahead.
         *
         * IN assertion: lookahead < MIN_LOOKAHEAD
         * OUT assertions: strstart <= window_size-MIN_LOOKAHEAD
         *    At least one byte has been read, or avail_in == 0; reads are
         *    performed for at least two bytes (required for the zip translate_eol
         *    option -- not supported here).
         */
        function fill_window(s) {
          var _w_size = s.w_size;
          var p, n, m, more, str;

          //Assert(s->lookahead < MIN_LOOKAHEAD, "already enough lookahead");

          do {
            more = s.window_size - s.lookahead - s.strstart;

            // JS ints have 32 bit, block below not needed
            /* Deal with !@#$% 64K limit: */
            //if (sizeof(int) <= 2) {
            //    if (more == 0 && s->strstart == 0 && s->lookahead == 0) {
            //        more = wsize;
            //
            //  } else if (more == (unsigned)(-1)) {
            //        /* Very unlikely, but possible on 16 bit machine if
            //         * strstart == 0 && lookahead == 1 (input done a byte at time)
            //         */
            //        more--;
            //    }
            //}


            /* If the window is almost full and there is insufficient lookahead,
             * move the upper half to the lower one to make room in the upper half.
             */
            if (s.strstart >= _w_size + (_w_size - MIN_LOOKAHEAD)) {

              arraySet(s.window, s.window, _w_size, _w_size, 0);
              s.match_start -= _w_size;
              s.strstart -= _w_size;
              /* we now have strstart >= MAX_DIST */
              s.block_start -= _w_size;

              /* Slide the hash table (could be avoided with 32 bit values
               at the expense of memory usage). We slide even when level == 0
               to keep the hash table consistent if we switch back to level > 0
               later. (Using level 0 permanently is not an optimal usage of
               zlib, so we don't care about this pathological case.)
               */

              n = s.hash_size;
              p = n;
              do {
                m = s.head[--p];
                s.head[p] = (m >= _w_size ? m - _w_size : 0);
              } while (--n);

              n = _w_size;
              p = n;
              do {
                m = s.prev[--p];
                s.prev[p] = (m >= _w_size ? m - _w_size : 0);
                /* If n is not on any hash chain, prev[n] is garbage but
                 * its value will never be used.
                 */
              } while (--n);

              more += _w_size;
            }
            if (s.strm.avail_in === 0) {
              break;
            }

            /* If there was no sliding:
             *    strstart <= WSIZE+MAX_DIST-1 && lookahead <= MIN_LOOKAHEAD - 1 &&
             *    more == window_size - lookahead - strstart
             * => more >= window_size - (MIN_LOOKAHEAD-1 + WSIZE + MAX_DIST-1)
             * => more >= window_size - 2*WSIZE + 2
             * In the BIG_MEM or MMAP case (not yet supported),
             *   window_size == input_size + MIN_LOOKAHEAD  &&
             *   strstart + s->lookahead <= input_size => more >= MIN_LOOKAHEAD.
             * Otherwise, window_size == 2*WSIZE so more >= 2.
             * If there was sliding, more >= WSIZE. So in all cases, more >= 2.
             */
            //Assert(more >= 2, "more < 2");
            n = read_buf(s.strm, s.window, s.strstart + s.lookahead, more);
            s.lookahead += n;

            /* Initialize the hash value now that we have some input: */
            if (s.lookahead + s.insert >= MIN_MATCH$1) {
              str = s.strstart - s.insert;
              s.ins_h = s.window[str];

              /* UPDATE_HASH(s, s->ins_h, s->window[str + 1]); */
              s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[str + 1]) & s.hash_mask;
              //#if MIN_MATCH != 3
              //        Call update_hash() MIN_MATCH-3 more times
              //#endif
              while (s.insert) {
                /* UPDATE_HASH(s, s->ins_h, s->window[str + MIN_MATCH-1]); */
                s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[str + MIN_MATCH$1 - 1]) & s.hash_mask;

                s.prev[str & s.w_mask] = s.head[s.ins_h];
                s.head[s.ins_h] = str;
                str++;
                s.insert--;
                if (s.lookahead + s.insert < MIN_MATCH$1) {
                  break;
                }
              }
            }
            /* If the whole input has less than MIN_MATCH bytes, ins_h is garbage,
             * but this is not important since only literal bytes will be emitted.
             */

          } while (s.lookahead < MIN_LOOKAHEAD && s.strm.avail_in !== 0);

          /* If the WIN_INIT bytes after the end of the current data have never been
           * written, then zero those bytes in order to avoid memory check reports of
           * the use of uninitialized (or uninitialised as Julian writes) bytes by
           * the longest match routines.  Update the high water mark for the next
           * time through here.  WIN_INIT is set to MAX_MATCH since the longest match
           * routines allow scanning to strstart + MAX_MATCH, ignoring lookahead.
           */
          //  if (s.high_water < s.window_size) {
          //    var curr = s.strstart + s.lookahead;
          //    var init = 0;
          //
          //    if (s.high_water < curr) {
          //      /* Previous high water mark below current data -- zero WIN_INIT
          //       * bytes or up to end of window, whichever is less.
          //       */
          //      init = s.window_size - curr;
          //      if (init > WIN_INIT)
          //        init = WIN_INIT;
          //      zmemzero(s->window + curr, (unsigned)init);
          //      s->high_water = curr + init;
          //    }
          //    else if (s->high_water < (ulg)curr + WIN_INIT) {
          //      /* High water mark at or above current data, but below current data
          //       * plus WIN_INIT -- zero out to current data plus WIN_INIT, or up
          //       * to end of window, whichever is less.
          //       */
          //      init = (ulg)curr + WIN_INIT - s->high_water;
          //      if (init > s->window_size - s->high_water)
          //        init = s->window_size - s->high_water;
          //      zmemzero(s->window + s->high_water, (unsigned)init);
          //      s->high_water += init;
          //    }
          //  }
          //
          //  Assert((ulg)s->strstart <= s->window_size - MIN_LOOKAHEAD,
          //    "not enough room for search");
        }

        /* ===========================================================================
         * Copy without compression as much as possible from the input stream, return
         * the current block state.
         * This function does not insert new strings in the dictionary since
         * uncompressible data is probably not useful. This function is used
         * only for the level=0 compression option.
         * NOTE: this function should be optimized to avoid extra copying from
         * window to pending_buf.
         */
        function deflate_stored(s, flush) {
          /* Stored blocks are limited to 0xffff bytes, pending_buf is limited
           * to pending_buf_size, and each stored block has a 5 byte header:
           */
          var max_block_size = 0xffff;

          if (max_block_size > s.pending_buf_size - 5) {
            max_block_size = s.pending_buf_size - 5;
          }

          /* Copy as much as possible from input to output: */
          for (;;) {
            /* Fill the window as much as possible: */
            if (s.lookahead <= 1) {

              //Assert(s->strstart < s->w_size+MAX_DIST(s) ||
              //  s->block_start >= (long)s->w_size, "slide too late");
              //      if (!(s.strstart < s.w_size + (s.w_size - MIN_LOOKAHEAD) ||
              //        s.block_start >= s.w_size)) {
              //        throw  new Error("slide too late");
              //      }

              fill_window(s);
              if (s.lookahead === 0 && flush === Z_NO_FLUSH) {
                return BS_NEED_MORE;
              }

              if (s.lookahead === 0) {
                break;
              }
              /* flush the current block */
            }
            //Assert(s->block_start >= 0L, "block gone");
            //    if (s.block_start < 0) throw new Error("block gone");

            s.strstart += s.lookahead;
            s.lookahead = 0;

            /* Emit a stored block if pending_buf will be full: */
            var max_start = s.block_start + max_block_size;

            if (s.strstart === 0 || s.strstart >= max_start) {
              /* strstart == 0 is possible when wraparound on 16-bit machine */
              s.lookahead = s.strstart - max_start;
              s.strstart = max_start;
              /*** FLUSH_BLOCK(s, 0); ***/
              flush_block_only(s, false);
              if (s.strm.avail_out === 0) {
                return BS_NEED_MORE;
              }
              /***/


            }
            /* Flush if we may have to slide, otherwise block_start may become
             * negative and the data will be gone:
             */
            if (s.strstart - s.block_start >= (s.w_size - MIN_LOOKAHEAD)) {
              /*** FLUSH_BLOCK(s, 0); ***/
              flush_block_only(s, false);
              if (s.strm.avail_out === 0) {
                return BS_NEED_MORE;
              }
              /***/
            }
          }

          s.insert = 0;

          if (flush === Z_FINISH) {
            /*** FLUSH_BLOCK(s, 1); ***/
            flush_block_only(s, true);
            if (s.strm.avail_out === 0) {
              return BS_FINISH_STARTED;
            }
            /***/
            return BS_FINISH_DONE;
          }

          if (s.strstart > s.block_start) {
            /*** FLUSH_BLOCK(s, 0); ***/
            flush_block_only(s, false);
            if (s.strm.avail_out === 0) {
              return BS_NEED_MORE;
            }
            /***/
          }

          return BS_NEED_MORE;
        }

        /* ===========================================================================
         * Compress as much as possible from the input stream, return the current
         * block state.
         * This function does not perform lazy evaluation of matches and inserts
         * new strings in the dictionary only for unmatched strings or for short
         * matches. It is used only for the fast compression options.
         */
        function deflate_fast(s, flush) {
          var hash_head; /* head of the hash chain */
          var bflush; /* set if current block must be flushed */

          for (;;) {
            /* Make sure that we always have enough lookahead, except
             * at the end of the input file. We need MAX_MATCH bytes
             * for the next match, plus MIN_MATCH bytes to insert the
             * string following the next match.
             */
            if (s.lookahead < MIN_LOOKAHEAD) {
              fill_window(s);
              if (s.lookahead < MIN_LOOKAHEAD && flush === Z_NO_FLUSH) {
                return BS_NEED_MORE;
              }
              if (s.lookahead === 0) {
                break; /* flush the current block */
              }
            }

            /* Insert the string window[strstart .. strstart+2] in the
             * dictionary, and set hash_head to the head of the hash chain:
             */
            hash_head = 0 /*NIL*/ ;
            if (s.lookahead >= MIN_MATCH$1) {
              /*** INSERT_STRING(s, s.strstart, hash_head); ***/
              s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[s.strstart + MIN_MATCH$1 - 1]) & s.hash_mask;
              hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
              s.head[s.ins_h] = s.strstart;
              /***/
            }

            /* Find the longest match, discarding those <= prev_length.
             * At this point we have always match_length < MIN_MATCH
             */
            if (hash_head !== 0 /*NIL*/ && ((s.strstart - hash_head) <= (s.w_size - MIN_LOOKAHEAD))) {
              /* To simplify the code, we prevent matches with the string
               * of window index 0 (in particular we have to avoid a match
               * of the string with itself at the start of the input file).
               */
              s.match_length = longest_match(s, hash_head);
              /* longest_match() sets match_start */
            }
            if (s.match_length >= MIN_MATCH$1) {
              // check_match(s, s.strstart, s.match_start, s.match_length); // for debug only

              /*** _tr_tally_dist(s, s.strstart - s.match_start,
                             s.match_length - MIN_MATCH, bflush); ***/
              bflush = _tr_tally(s, s.strstart - s.match_start, s.match_length - MIN_MATCH$1);

              s.lookahead -= s.match_length;

              /* Insert new strings in the hash table only if the match length
               * is not too large. This saves time but degrades compression.
               */
              if (s.match_length <= s.max_lazy_match /*max_insert_length*/ && s.lookahead >= MIN_MATCH$1) {
                s.match_length--; /* string at strstart already in table */
                do {
                  s.strstart++;
                  /*** INSERT_STRING(s, s.strstart, hash_head); ***/
                  s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[s.strstart + MIN_MATCH$1 - 1]) & s.hash_mask;
                  hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
                  s.head[s.ins_h] = s.strstart;
                  /***/
                  /* strstart never exceeds WSIZE-MAX_MATCH, so there are
                   * always MIN_MATCH bytes ahead.
                   */
                } while (--s.match_length !== 0);
                s.strstart++;
              } else {
                s.strstart += s.match_length;
                s.match_length = 0;
                s.ins_h = s.window[s.strstart];
                /* UPDATE_HASH(s, s.ins_h, s.window[s.strstart+1]); */
                s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[s.strstart + 1]) & s.hash_mask;

                //#if MIN_MATCH != 3
                //                Call UPDATE_HASH() MIN_MATCH-3 more times
                //#endif
                /* If lookahead < MIN_MATCH, ins_h is garbage, but it does not
                 * matter since it will be recomputed at next deflate call.
                 */
              }
            } else {
              /* No match, output a literal byte */
              //Tracevv((stderr,"%c", s.window[s.strstart]));
              /*** _tr_tally_lit(s, s.window[s.strstart], bflush); ***/
              bflush = _tr_tally(s, 0, s.window[s.strstart]);

              s.lookahead--;
              s.strstart++;
            }
            if (bflush) {
              /*** FLUSH_BLOCK(s, 0); ***/
              flush_block_only(s, false);
              if (s.strm.avail_out === 0) {
                return BS_NEED_MORE;
              }
              /***/
            }
          }
          s.insert = ((s.strstart < (MIN_MATCH$1 - 1)) ? s.strstart : MIN_MATCH$1 - 1);
          if (flush === Z_FINISH) {
            /*** FLUSH_BLOCK(s, 1); ***/
            flush_block_only(s, true);
            if (s.strm.avail_out === 0) {
              return BS_FINISH_STARTED;
            }
            /***/
            return BS_FINISH_DONE;
          }
          if (s.last_lit) {
            /*** FLUSH_BLOCK(s, 0); ***/
            flush_block_only(s, false);
            if (s.strm.avail_out === 0) {
              return BS_NEED_MORE;
            }
            /***/
          }
          return BS_BLOCK_DONE;
        }

        /* ===========================================================================
         * Same as above, but achieves better compression. We use a lazy
         * evaluation for matches: a match is finally adopted only if there is
         * no better match at the next window position.
         */
        function deflate_slow(s, flush) {
          var hash_head; /* head of hash chain */
          var bflush; /* set if current block must be flushed */

          var max_insert;

          /* Process the input block. */
          for (;;) {
            /* Make sure that we always have enough lookahead, except
             * at the end of the input file. We need MAX_MATCH bytes
             * for the next match, plus MIN_MATCH bytes to insert the
             * string following the next match.
             */
            if (s.lookahead < MIN_LOOKAHEAD) {
              fill_window(s);
              if (s.lookahead < MIN_LOOKAHEAD && flush === Z_NO_FLUSH) {
                return BS_NEED_MORE;
              }
              if (s.lookahead === 0) {
                break;
              } /* flush the current block */
            }

            /* Insert the string window[strstart .. strstart+2] in the
             * dictionary, and set hash_head to the head of the hash chain:
             */
            hash_head = 0 /*NIL*/ ;
            if (s.lookahead >= MIN_MATCH$1) {
              /*** INSERT_STRING(s, s.strstart, hash_head); ***/
              s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[s.strstart + MIN_MATCH$1 - 1]) & s.hash_mask;
              hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
              s.head[s.ins_h] = s.strstart;
              /***/
            }

            /* Find the longest match, discarding those <= prev_length.
             */
            s.prev_length = s.match_length;
            s.prev_match = s.match_start;
            s.match_length = MIN_MATCH$1 - 1;

            if (hash_head !== 0 /*NIL*/ && s.prev_length < s.max_lazy_match &&
              s.strstart - hash_head <= (s.w_size - MIN_LOOKAHEAD) /*MAX_DIST(s)*/ ) {
              /* To simplify the code, we prevent matches with the string
               * of window index 0 (in particular we have to avoid a match
               * of the string with itself at the start of the input file).
               */
              s.match_length = longest_match(s, hash_head);
              /* longest_match() sets match_start */

              if (s.match_length <= 5 &&
                (s.strategy === Z_FILTERED || (s.match_length === MIN_MATCH$1 && s.strstart - s.match_start > 4096 /*TOO_FAR*/ ))) {

                /* If prev_match is also MIN_MATCH, match_start is garbage
                 * but we will ignore the current match anyway.
                 */
                s.match_length = MIN_MATCH$1 - 1;
              }
            }
            /* If there was a match at the previous step and the current
             * match is not better, output the previous match:
             */
            if (s.prev_length >= MIN_MATCH$1 && s.match_length <= s.prev_length) {
              max_insert = s.strstart + s.lookahead - MIN_MATCH$1;
              /* Do not insert strings in hash table beyond this. */

              //check_match(s, s.strstart-1, s.prev_match, s.prev_length);

              /***_tr_tally_dist(s, s.strstart - 1 - s.prev_match,
                             s.prev_length - MIN_MATCH, bflush);***/
              bflush = _tr_tally(s, s.strstart - 1 - s.prev_match, s.prev_length - MIN_MATCH$1);
              /* Insert in hash table all strings up to the end of the match.
               * strstart-1 and strstart are already inserted. If there is not
               * enough lookahead, the last two strings are not inserted in
               * the hash table.
               */
              s.lookahead -= s.prev_length - 1;
              s.prev_length -= 2;
              do {
                if (++s.strstart <= max_insert) {
                  /*** INSERT_STRING(s, s.strstart, hash_head); ***/
                  s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[s.strstart + MIN_MATCH$1 - 1]) & s.hash_mask;
                  hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
                  s.head[s.ins_h] = s.strstart;
                  /***/
                }
              } while (--s.prev_length !== 0);
              s.match_available = 0;
              s.match_length = MIN_MATCH$1 - 1;
              s.strstart++;

              if (bflush) {
                /*** FLUSH_BLOCK(s, 0); ***/
                flush_block_only(s, false);
                if (s.strm.avail_out === 0) {
                  return BS_NEED_MORE;
                }
                /***/
              }

            } else if (s.match_available) {
              /* If there was no match at the previous position, output a
               * single literal. If there was a match but the current match
               * is longer, truncate the previous match to a single literal.
               */
              //Tracevv((stderr,"%c", s->window[s->strstart-1]));
              /*** _tr_tally_lit(s, s.window[s.strstart-1], bflush); ***/
              bflush = _tr_tally(s, 0, s.window[s.strstart - 1]);

              if (bflush) {
                /*** FLUSH_BLOCK_ONLY(s, 0) ***/
                flush_block_only(s, false);
                /***/
              }
              s.strstart++;
              s.lookahead--;
              if (s.strm.avail_out === 0) {
                return BS_NEED_MORE;
              }
            } else {
              /* There is no previous match to compare with, wait for
               * the next step to decide.
               */
              s.match_available = 1;
              s.strstart++;
              s.lookahead--;
            }
          }
          //Assert (flush != Z_NO_FLUSH, "no flush?");
          if (s.match_available) {
            //Tracevv((stderr,"%c", s->window[s->strstart-1]));
            /*** _tr_tally_lit(s, s.window[s.strstart-1], bflush); ***/
            bflush = _tr_tally(s, 0, s.window[s.strstart - 1]);

            s.match_available = 0;
          }
          s.insert = s.strstart < MIN_MATCH$1 - 1 ? s.strstart : MIN_MATCH$1 - 1;
          if (flush === Z_FINISH) {
            /*** FLUSH_BLOCK(s, 1); ***/
            flush_block_only(s, true);
            if (s.strm.avail_out === 0) {
              return BS_FINISH_STARTED;
            }
            /***/
            return BS_FINISH_DONE;
          }
          if (s.last_lit) {
            /*** FLUSH_BLOCK(s, 0); ***/
            flush_block_only(s, false);
            if (s.strm.avail_out === 0) {
              return BS_NEED_MORE;
            }
            /***/
          }

          return BS_BLOCK_DONE;
        }


        /* ===========================================================================
         * For Z_RLE, simply look for runs of bytes, generate matches only of distance
         * one.  Do not maintain a hash table.  (It will be regenerated if this run of
         * deflate switches away from Z_RLE.)
         */
        function deflate_rle(s, flush) {
          var bflush; /* set if current block must be flushed */
          var prev; /* byte at distance one to match */
          var scan, strend; /* scan goes up to strend for length of run */

          var _win = s.window;

          for (;;) {
            /* Make sure that we always have enough lookahead, except
             * at the end of the input file. We need MAX_MATCH bytes
             * for the longest run, plus one for the unrolled loop.
             */
            if (s.lookahead <= MAX_MATCH$1) {
              fill_window(s);
              if (s.lookahead <= MAX_MATCH$1 && flush === Z_NO_FLUSH) {
                return BS_NEED_MORE;
              }
              if (s.lookahead === 0) {
                break;
              } /* flush the current block */
            }

            /* See how many times the previous byte repeats */
            s.match_length = 0;
            if (s.lookahead >= MIN_MATCH$1 && s.strstart > 0) {
              scan = s.strstart - 1;
              prev = _win[scan];
              if (prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan]) {
                strend = s.strstart + MAX_MATCH$1;
                do {
                  /*jshint noempty:false*/
                } while (prev === _win[++scan] && prev === _win[++scan] &&
                  prev === _win[++scan] && prev === _win[++scan] &&
                  prev === _win[++scan] && prev === _win[++scan] &&
                  prev === _win[++scan] && prev === _win[++scan] &&
                  scan < strend);
                s.match_length = MAX_MATCH$1 - (strend - scan);
                if (s.match_length > s.lookahead) {
                  s.match_length = s.lookahead;
                }
              }
              //Assert(scan <= s->window+(uInt)(s->window_size-1), "wild scan");
            }

            /* Emit match if have run of MIN_MATCH or longer, else emit literal */
            if (s.match_length >= MIN_MATCH$1) {
              //check_match(s, s.strstart, s.strstart - 1, s.match_length);

              /*** _tr_tally_dist(s, 1, s.match_length - MIN_MATCH, bflush); ***/
              bflush = _tr_tally(s, 1, s.match_length - MIN_MATCH$1);

              s.lookahead -= s.match_length;
              s.strstart += s.match_length;
              s.match_length = 0;
            } else {
              /* No match, output a literal byte */
              //Tracevv((stderr,"%c", s->window[s->strstart]));
              /*** _tr_tally_lit(s, s.window[s.strstart], bflush); ***/
              bflush = _tr_tally(s, 0, s.window[s.strstart]);

              s.lookahead--;
              s.strstart++;
            }
            if (bflush) {
              /*** FLUSH_BLOCK(s, 0); ***/
              flush_block_only(s, false);
              if (s.strm.avail_out === 0) {
                return BS_NEED_MORE;
              }
              /***/
            }
          }
          s.insert = 0;
          if (flush === Z_FINISH) {
            /*** FLUSH_BLOCK(s, 1); ***/
            flush_block_only(s, true);
            if (s.strm.avail_out === 0) {
              return BS_FINISH_STARTED;
            }
            /***/
            return BS_FINISH_DONE;
          }
          if (s.last_lit) {
            /*** FLUSH_BLOCK(s, 0); ***/
            flush_block_only(s, false);
            if (s.strm.avail_out === 0) {
              return BS_NEED_MORE;
            }
            /***/
          }
          return BS_BLOCK_DONE;
        }

        /* ===========================================================================
         * For Z_HUFFMAN_ONLY, do not look for matches.  Do not maintain a hash table.
         * (It will be regenerated if this run of deflate switches away from Huffman.)
         */
        function deflate_huff(s, flush) {
          var bflush; /* set if current block must be flushed */

          for (;;) {
            /* Make sure that we have a literal to write. */
            if (s.lookahead === 0) {
              fill_window(s);
              if (s.lookahead === 0) {
                if (flush === Z_NO_FLUSH) {
                  return BS_NEED_MORE;
                }
                break; /* flush the current block */
              }
            }

            /* Output a literal byte */
            s.match_length = 0;
            //Tracevv((stderr,"%c", s->window[s->strstart]));
            /*** _tr_tally_lit(s, s.window[s.strstart], bflush); ***/
            bflush = _tr_tally(s, 0, s.window[s.strstart]);
            s.lookahead--;
            s.strstart++;
            if (bflush) {
              /*** FLUSH_BLOCK(s, 0); ***/
              flush_block_only(s, false);
              if (s.strm.avail_out === 0) {
                return BS_NEED_MORE;
              }
              /***/
            }
          }
          s.insert = 0;
          if (flush === Z_FINISH) {
            /*** FLUSH_BLOCK(s, 1); ***/
            flush_block_only(s, true);
            if (s.strm.avail_out === 0) {
              return BS_FINISH_STARTED;
            }
            /***/
            return BS_FINISH_DONE;
          }
          if (s.last_lit) {
            /*** FLUSH_BLOCK(s, 0); ***/
            flush_block_only(s, false);
            if (s.strm.avail_out === 0) {
              return BS_NEED_MORE;
            }
            /***/
          }
          return BS_BLOCK_DONE;
        }

        /* Values for max_lazy_match, good_match and max_chain_length, depending on
         * the desired pack level (0..9). The values given below have been tuned to
         * exclude worst case performance for pathological files. Better values may be
         * found for specific files.
         */
        function Config(good_length, max_lazy, nice_length, max_chain, func) {
          this.good_length = good_length;
          this.max_lazy = max_lazy;
          this.nice_length = nice_length;
          this.max_chain = max_chain;
          this.func = func;
        }

        var configuration_table;

        configuration_table = [
          /*      good lazy nice chain */
          new Config(0, 0, 0, 0, deflate_stored), /* 0 store only */
          new Config(4, 4, 8, 4, deflate_fast), /* 1 max speed, no lazy matches */
          new Config(4, 5, 16, 8, deflate_fast), /* 2 */
          new Config(4, 6, 32, 32, deflate_fast), /* 3 */

          new Config(4, 4, 16, 16, deflate_slow), /* 4 lazy matches */
          new Config(8, 16, 32, 32, deflate_slow), /* 5 */
          new Config(8, 16, 128, 128, deflate_slow), /* 6 */
          new Config(8, 32, 128, 256, deflate_slow), /* 7 */
          new Config(32, 128, 258, 1024, deflate_slow), /* 8 */
          new Config(32, 258, 258, 4096, deflate_slow) /* 9 max compression */
        ];


        /* ===========================================================================
         * Initialize the "longest match" routines for a new zlib stream
         */
        function lm_init(s) {
          s.window_size = 2 * s.w_size;

          /*** CLEAR_HASH(s); ***/
          zero$1(s.head); // Fill with NIL (= 0);

          /* Set the default configuration parameters:
           */
          s.max_lazy_match = configuration_table[s.level].max_lazy;
          s.good_match = configuration_table[s.level].good_length;
          s.nice_match = configuration_table[s.level].nice_length;
          s.max_chain_length = configuration_table[s.level].max_chain;

          s.strstart = 0;
          s.block_start = 0;
          s.lookahead = 0;
          s.insert = 0;
          s.match_length = s.prev_length = MIN_MATCH$1 - 1;
          s.match_available = 0;
          s.ins_h = 0;
        }


        function DeflateState() {
          this.strm = null; /* pointer back to this zlib stream */
          this.status = 0; /* as the name implies */
          this.pending_buf = null; /* output still pending */
          this.pending_buf_size = 0; /* size of pending_buf */
          this.pending_out = 0; /* next pending byte to output to the stream */
          this.pending = 0; /* nb of bytes in the pending buffer */
          this.wrap = 0; /* bit 0 true for zlib, bit 1 true for gzip */
          this.gzhead = null; /* gzip header information to write */
          this.gzindex = 0; /* where in extra, name, or comment */
          this.method = Z_DEFLATED; /* can only be DEFLATED */
          this.last_flush = -1; /* value of flush param for previous deflate call */

          this.w_size = 0; /* LZ77 window size (32K by default) */
          this.w_bits = 0; /* log2(w_size)  (8..16) */
          this.w_mask = 0; /* w_size - 1 */

          this.window = null;
          /* Sliding window. Input bytes are read into the second half of the window,
           * and move to the first half later to keep a dictionary of at least wSize
           * bytes. With this organization, matches are limited to a distance of
           * wSize-MAX_MATCH bytes, but this ensures that IO is always
           * performed with a length multiple of the block size.
           */

          this.window_size = 0;
          /* Actual size of window: 2*wSize, except when the user input buffer
           * is directly used as sliding window.
           */

          this.prev = null;
          /* Link to older string with same hash index. To limit the size of this
           * array to 64K, this link is maintained only for the last 32K strings.
           * An index in this array is thus a window index modulo 32K.
           */

          this.head = null; /* Heads of the hash chains or NIL. */

          this.ins_h = 0; /* hash index of string to be inserted */
          this.hash_size = 0; /* number of elements in hash table */
          this.hash_bits = 0; /* log2(hash_size) */
          this.hash_mask = 0; /* hash_size-1 */

          this.hash_shift = 0;
          /* Number of bits by which ins_h must be shifted at each input
           * step. It must be such that after MIN_MATCH steps, the oldest
           * byte no longer takes part in the hash key, that is:
           *   hash_shift * MIN_MATCH >= hash_bits
           */

          this.block_start = 0;
          /* Window position at the beginning of the current output block. Gets
           * negative when the window is moved backwards.
           */

          this.match_length = 0; /* length of best match */
          this.prev_match = 0; /* previous match */
          this.match_available = 0; /* set if previous match exists */
          this.strstart = 0; /* start of string to insert */
          this.match_start = 0; /* start of matching string */
          this.lookahead = 0; /* number of valid bytes ahead in window */

          this.prev_length = 0;
          /* Length of the best match at previous step. Matches not greater than this
           * are discarded. This is used in the lazy match evaluation.
           */

          this.max_chain_length = 0;
          /* To speed up deflation, hash chains are never searched beyond this
           * length.  A higher limit improves compression ratio but degrades the
           * speed.
           */

          this.max_lazy_match = 0;
          /* Attempt to find a better match only when the current match is strictly
           * smaller than this value. This mechanism is used only for compression
           * levels >= 4.
           */
          // That's alias to max_lazy_match, don't use directly
          //this.max_insert_length = 0;
          /* Insert new strings in the hash table only if the match length is not
           * greater than this length. This saves time but degrades compression.
           * max_insert_length is used only for compression levels <= 3.
           */

          this.level = 0; /* compression level (1..9) */
          this.strategy = 0; /* favor or force Huffman coding*/

          this.good_match = 0;
          /* Use a faster search when the previous match is longer than this */

          this.nice_match = 0; /* Stop searching when current match exceeds this */

          /* used by c: */

          /* Didn't use ct_data typedef below to suppress compiler warning */

          // struct ct_data_s dyn_ltree[HEAP_SIZE];   /* literal and length tree */
          // struct ct_data_s dyn_dtree[2*D_CODES+1]; /* distance tree */
          // struct ct_data_s bl_tree[2*BL_CODES+1];  /* Huffman tree for bit lengths */

          // Use flat array of DOUBLE size, with interleaved fata,
          // because JS does not support effective
          this.dyn_ltree = new Buf16(HEAP_SIZE$1 * 2);
          this.dyn_dtree = new Buf16((2 * D_CODES$1 + 1) * 2);
          this.bl_tree = new Buf16((2 * BL_CODES$1 + 1) * 2);
          zero$1(this.dyn_ltree);
          zero$1(this.dyn_dtree);
          zero$1(this.bl_tree);

          this.l_desc = null; /* desc. for literal tree */
          this.d_desc = null; /* desc. for distance tree */
          this.bl_desc = null; /* desc. for bit length tree */

          //ush bl_count[MAX_BITS+1];
          this.bl_count = new Buf16(MAX_BITS$1 + 1);
          /* number of codes at each bit length for an optimal tree */

          //int heap[2*L_CODES+1];      /* heap used to build the Huffman trees */
          this.heap = new Buf16(2 * L_CODES$1 + 1); /* heap used to build the Huffman trees */
          zero$1(this.heap);

          this.heap_len = 0; /* number of elements in the heap */
          this.heap_max = 0; /* element of largest frequency */
          /* The sons of heap[n] are heap[2*n] and heap[2*n+1]. heap[0] is not used.
           * The same heap array is used to build all
           */

          this.depth = new Buf16(2 * L_CODES$1 + 1); //uch depth[2*L_CODES+1];
          zero$1(this.depth);
          /* Depth of each subtree used as tie breaker for trees of equal frequency
           */

          this.l_buf = 0; /* buffer index for literals or lengths */

          this.lit_bufsize = 0;
          /* Size of match buffer for literals/lengths.  There are 4 reasons for
           * limiting lit_bufsize to 64K:
           *   - frequencies can be kept in 16 bit counters
           *   - if compression is not successful for the first block, all input
           *     data is still in the window so we can still emit a stored block even
           *     when input comes from standard input.  (This can also be done for
           *     all blocks if lit_bufsize is not greater than 32K.)
           *   - if compression is not successful for a file smaller than 64K, we can
           *     even emit a stored file instead of a stored block (saving 5 bytes).
           *     This is applicable only for zip (not gzip or zlib).
           *   - creating new Huffman trees less frequently may not provide fast
           *     adaptation to changes in the input data statistics. (Take for
           *     example a binary file with poorly compressible code followed by
           *     a highly compressible string table.) Smaller buffer sizes give
           *     fast adaptation but have of course the overhead of transmitting
           *     trees more frequently.
           *   - I can't count above 4
           */

          this.last_lit = 0; /* running index in l_buf */

          this.d_buf = 0;
          /* Buffer index for distances. To simplify the code, d_buf and l_buf have
           * the same number of elements. To use different lengths, an extra flag
           * array would be necessary.
           */

          this.opt_len = 0; /* bit length of current block with optimal trees */
          this.static_len = 0; /* bit length of current block with static trees */
          this.matches = 0; /* number of string matches in current block */
          this.insert = 0; /* bytes at end of window left to insert */


          this.bi_buf = 0;
          /* Output buffer. bits are inserted starting at the bottom (least
           * significant bits).
           */
          this.bi_valid = 0;
          /* Number of valid bits in bi_buf.  All bits above the last valid bit
           * are always zero.
           */

          // Used for window memory init. We safely ignore it for JS. That makes
          // sense only for pointers and memory check tools.
          //this.high_water = 0;
          /* High water mark offset in window for initialized bytes -- bytes above
           * this are set to zero in order to avoid memory check warnings when
           * longest match routines access bytes past the input.  This is then
           * updated to the new high water mark.
           */
        }


        function deflateResetKeep(strm) {
          var s;

          if (!strm || !strm.state) {
            return err(strm, Z_STREAM_ERROR);
          }

          strm.total_in = strm.total_out = 0;
          strm.data_type = Z_UNKNOWN$1;

          s = strm.state;
          s.pending = 0;
          s.pending_out = 0;

          if (s.wrap < 0) {
            s.wrap = -s.wrap;
            /* was made negative by deflate(..., Z_FINISH); */
          }
          s.status = (s.wrap ? INIT_STATE : BUSY_STATE);
          strm.adler = (s.wrap === 2) ?
            0 // crc32(0, Z_NULL, 0)
            :
            1; // adler32(0, Z_NULL, 0)
          s.last_flush = Z_NO_FLUSH;
          _tr_init(s);
          return Z_OK;
        }


        function deflateReset(strm) {
          var ret = deflateResetKeep(strm);
          if (ret === Z_OK) {
            lm_init(strm.state);
          }
          return ret;
        }


        function deflateInit2(strm, level, method, windowBits, memLevel, strategy) {
          if (!strm) { // === Z_NULL
            return Z_STREAM_ERROR;
          }
          var wrap = 1;

          if (level === Z_DEFAULT_COMPRESSION) {
            level = 6;
          }

          if (windowBits < 0) { /* suppress zlib wrapper */
            wrap = 0;
            windowBits = -windowBits;
          } else if (windowBits > 15) {
            wrap = 2; /* write gzip wrapper instead */
            windowBits -= 16;
          }


          if (memLevel < 1 || memLevel > MAX_MEM_LEVEL || method !== Z_DEFLATED ||
            windowBits < 8 || windowBits > 15 || level < 0 || level > 9 ||
            strategy < 0 || strategy > Z_FIXED$1) {
            return err(strm, Z_STREAM_ERROR);
          }


          if (windowBits === 8) {
            windowBits = 9;
          }
          /* until 256-byte window bug fixed */

          var s = new DeflateState();

          strm.state = s;
          s.strm = strm;

          s.wrap = wrap;
          s.gzhead = null;
          s.w_bits = windowBits;
          s.w_size = 1 << s.w_bits;
          s.w_mask = s.w_size - 1;

          s.hash_bits = memLevel + 7;
          s.hash_size = 1 << s.hash_bits;
          s.hash_mask = s.hash_size - 1;
          s.hash_shift = ~~((s.hash_bits + MIN_MATCH$1 - 1) / MIN_MATCH$1);

          s.window = new Buf8(s.w_size * 2);
          s.head = new Buf16(s.hash_size);
          s.prev = new Buf16(s.w_size);

          // Don't need mem init magic for JS.
          //s.high_water = 0;  /* nothing written to s->window yet */

          s.lit_bufsize = 1 << (memLevel + 6); /* 16K elements by default */

          s.pending_buf_size = s.lit_bufsize * 4;

          //overlay = (ushf *) ZALLOC(strm, s->lit_bufsize, sizeof(ush)+2);
          //s->pending_buf = (uchf *) overlay;
          s.pending_buf = new Buf8(s.pending_buf_size);

          // It is offset from `s.pending_buf` (size is `s.lit_bufsize * 2`)
          //s->d_buf = overlay + s->lit_bufsize/sizeof(ush);
          s.d_buf = 1 * s.lit_bufsize;

          //s->l_buf = s->pending_buf + (1+sizeof(ush))*s->lit_bufsize;
          s.l_buf = (1 + 2) * s.lit_bufsize;

          s.level = level;
          s.strategy = strategy;
          s.method = method;

          return deflateReset(strm);
        }


        function deflate(strm, flush) {
          var old_flush, s;
          var beg, val; // for gzip header write only

          if (!strm || !strm.state ||
            flush > Z_BLOCK || flush < 0) {
            return strm ? err(strm, Z_STREAM_ERROR) : Z_STREAM_ERROR;
          }

          s = strm.state;

          if (!strm.output ||
            (!strm.input && strm.avail_in !== 0) ||
            (s.status === FINISH_STATE && flush !== Z_FINISH)) {
            return err(strm, (strm.avail_out === 0) ? Z_BUF_ERROR : Z_STREAM_ERROR);
          }

          s.strm = strm; /* just in case */
          old_flush = s.last_flush;
          s.last_flush = flush;

          /* Write the header */
          if (s.status === INIT_STATE) {
            if (s.wrap === 2) {
              // GZIP header
              strm.adler = 0; //crc32(0L, Z_NULL, 0);
              put_byte(s, 31);
              put_byte(s, 139);
              put_byte(s, 8);
              if (!s.gzhead) { // s->gzhead == Z_NULL
                put_byte(s, 0);
                put_byte(s, 0);
                put_byte(s, 0);
                put_byte(s, 0);
                put_byte(s, 0);
                put_byte(s, s.level === 9 ? 2 :
                  (s.strategy >= Z_HUFFMAN_ONLY || s.level < 2 ?
                    4 : 0));
                put_byte(s, OS_CODE);
                s.status = BUSY_STATE;
              } else {
                put_byte(s, (s.gzhead.text ? 1 : 0) +
                  (s.gzhead.hcrc ? 2 : 0) +
                  (!s.gzhead.extra ? 0 : 4) +
                  (!s.gzhead.name ? 0 : 8) +
                  (!s.gzhead.comment ? 0 : 16)
                );
                put_byte(s, s.gzhead.time & 0xff);
                put_byte(s, (s.gzhead.time >> 8) & 0xff);
                put_byte(s, (s.gzhead.time >> 16) & 0xff);
                put_byte(s, (s.gzhead.time >> 24) & 0xff);
                put_byte(s, s.level === 9 ? 2 :
                  (s.strategy >= Z_HUFFMAN_ONLY || s.level < 2 ?
                    4 : 0));
                put_byte(s, s.gzhead.os & 0xff);
                if (s.gzhead.extra && s.gzhead.extra.length) {
                  put_byte(s, s.gzhead.extra.length & 0xff);
                  put_byte(s, (s.gzhead.extra.length >> 8) & 0xff);
                }
                if (s.gzhead.hcrc) {
                  strm.adler = crc32(strm.adler, s.pending_buf, s.pending, 0);
                }
                s.gzindex = 0;
                s.status = EXTRA_STATE;
              }
            } else // DEFLATE header
            {
              var header = (Z_DEFLATED + ((s.w_bits - 8) << 4)) << 8;
              var level_flags = -1;

              if (s.strategy >= Z_HUFFMAN_ONLY || s.level < 2) {
                level_flags = 0;
              } else if (s.level < 6) {
                level_flags = 1;
              } else if (s.level === 6) {
                level_flags = 2;
              } else {
                level_flags = 3;
              }
              header |= (level_flags << 6);
              if (s.strstart !== 0) {
                header |= PRESET_DICT;
              }
              header += 31 - (header % 31);

              s.status = BUSY_STATE;
              putShortMSB(s, header);

              /* Save the adler32 of the preset dictionary: */
              if (s.strstart !== 0) {
                putShortMSB(s, strm.adler >>> 16);
                putShortMSB(s, strm.adler & 0xffff);
              }
              strm.adler = 1; // adler32(0L, Z_NULL, 0);
            }
          }

          //#ifdef GZIP
          if (s.status === EXTRA_STATE) {
            if (s.gzhead.extra /* != Z_NULL*/ ) {
              beg = s.pending; /* start of bytes to update crc */

              while (s.gzindex < (s.gzhead.extra.length & 0xffff)) {
                if (s.pending === s.pending_buf_size) {
                  if (s.gzhead.hcrc && s.pending > beg) {
                    strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
                  }
                  flush_pending(strm);
                  beg = s.pending;
                  if (s.pending === s.pending_buf_size) {
                    break;
                  }
                }
                put_byte(s, s.gzhead.extra[s.gzindex] & 0xff);
                s.gzindex++;
              }
              if (s.gzhead.hcrc && s.pending > beg) {
                strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
              }
              if (s.gzindex === s.gzhead.extra.length) {
                s.gzindex = 0;
                s.status = NAME_STATE;
              }
            } else {
              s.status = NAME_STATE;
            }
          }
          if (s.status === NAME_STATE) {
            if (s.gzhead.name /* != Z_NULL*/ ) {
              beg = s.pending; /* start of bytes to update crc */
              //int val;

              do {
                if (s.pending === s.pending_buf_size) {
                  if (s.gzhead.hcrc && s.pending > beg) {
                    strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
                  }
                  flush_pending(strm);
                  beg = s.pending;
                  if (s.pending === s.pending_buf_size) {
                    val = 1;
                    break;
                  }
                }
                // JS specific: little magic to add zero terminator to end of string
                if (s.gzindex < s.gzhead.name.length) {
                  val = s.gzhead.name.charCodeAt(s.gzindex++) & 0xff;
                } else {
                  val = 0;
                }
                put_byte(s, val);
              } while (val !== 0);

              if (s.gzhead.hcrc && s.pending > beg) {
                strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
              }
              if (val === 0) {
                s.gzindex = 0;
                s.status = COMMENT_STATE;
              }
            } else {
              s.status = COMMENT_STATE;
            }
          }
          if (s.status === COMMENT_STATE) {
            if (s.gzhead.comment /* != Z_NULL*/ ) {
              beg = s.pending; /* start of bytes to update crc */
              //int val;

              do {
                if (s.pending === s.pending_buf_size) {
                  if (s.gzhead.hcrc && s.pending > beg) {
                    strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
                  }
                  flush_pending(strm);
                  beg = s.pending;
                  if (s.pending === s.pending_buf_size) {
                    val = 1;
                    break;
                  }
                }
                // JS specific: little magic to add zero terminator to end of string
                if (s.gzindex < s.gzhead.comment.length) {
                  val = s.gzhead.comment.charCodeAt(s.gzindex++) & 0xff;
                } else {
                  val = 0;
                }
                put_byte(s, val);
              } while (val !== 0);

              if (s.gzhead.hcrc && s.pending > beg) {
                strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
              }
              if (val === 0) {
                s.status = HCRC_STATE;
              }
            } else {
              s.status = HCRC_STATE;
            }
          }
          if (s.status === HCRC_STATE) {
            if (s.gzhead.hcrc) {
              if (s.pending + 2 > s.pending_buf_size) {
                flush_pending(strm);
              }
              if (s.pending + 2 <= s.pending_buf_size) {
                put_byte(s, strm.adler & 0xff);
                put_byte(s, (strm.adler >> 8) & 0xff);
                strm.adler = 0; //crc32(0L, Z_NULL, 0);
                s.status = BUSY_STATE;
              }
            } else {
              s.status = BUSY_STATE;
            }
          }
          //#endif

          /* Flush as much pending output as possible */
          if (s.pending !== 0) {
            flush_pending(strm);
            if (strm.avail_out === 0) {
              /* Since avail_out is 0, deflate will be called again with
               * more output space, but possibly with both pending and
               * avail_in equal to zero. There won't be anything to do,
               * but this is not an error situation so make sure we
               * return OK instead of BUF_ERROR at next call of deflate:
               */
              s.last_flush = -1;
              return Z_OK;
            }

            /* Make sure there is something to do and avoid duplicate consecutive
             * flushes. For repeated and useless calls with Z_FINISH, we keep
             * returning Z_STREAM_END instead of Z_BUF_ERROR.
             */
          } else if (strm.avail_in === 0 && rank(flush) <= rank(old_flush) &&
            flush !== Z_FINISH) {
            return err(strm, Z_BUF_ERROR);
          }

          /* User must not provide more input after the first FINISH: */
          if (s.status === FINISH_STATE && strm.avail_in !== 0) {
            return err(strm, Z_BUF_ERROR);
          }

          /* Start a new block or continue the current one.
           */
          if (strm.avail_in !== 0 || s.lookahead !== 0 ||
            (flush !== Z_NO_FLUSH && s.status !== FINISH_STATE)) {
            var bstate = (s.strategy === Z_HUFFMAN_ONLY) ? deflate_huff(s, flush) :
              (s.strategy === Z_RLE ? deflate_rle(s, flush) :
                configuration_table[s.level].func(s, flush));

            if (bstate === BS_FINISH_STARTED || bstate === BS_FINISH_DONE) {
              s.status = FINISH_STATE;
            }
            if (bstate === BS_NEED_MORE || bstate === BS_FINISH_STARTED) {
              if (strm.avail_out === 0) {
                s.last_flush = -1;
                /* avoid BUF_ERROR next call, see above */
              }
              return Z_OK;
              /* If flush != Z_NO_FLUSH && avail_out == 0, the next call
               * of deflate should use the same flush parameter to make sure
               * that the flush is complete. So we don't have to output an
               * empty block here, this will be done at next call. This also
               * ensures that for a very small output buffer, we emit at most
               * one empty block.
               */
            }
            if (bstate === BS_BLOCK_DONE) {
              if (flush === Z_PARTIAL_FLUSH) {
                _tr_align(s);
              } else if (flush !== Z_BLOCK) { /* FULL_FLUSH or SYNC_FLUSH */

                _tr_stored_block(s, 0, 0, false);
                /* For a full flush, this empty block will be recognized
                 * as a special marker by inflate_sync().
                 */
                if (flush === Z_FULL_FLUSH) {
                  /*** CLEAR_HASH(s); ***/
                  /* forget history */
                  zero$1(s.head); // Fill with NIL (= 0);

                  if (s.lookahead === 0) {
                    s.strstart = 0;
                    s.block_start = 0;
                    s.insert = 0;
                  }
                }
              }
              flush_pending(strm);
              if (strm.avail_out === 0) {
                s.last_flush = -1; /* avoid BUF_ERROR at next call, see above */
                return Z_OK;
              }
            }
          }
          //Assert(strm->avail_out > 0, "bug2");
          //if (strm.avail_out <= 0) { throw new Error("bug2");}

          if (flush !== Z_FINISH) {
            return Z_OK;
          }
          if (s.wrap <= 0) {
            return Z_STREAM_END;
          }

          /* Write the trailer */
          if (s.wrap === 2) {
            put_byte(s, strm.adler & 0xff);
            put_byte(s, (strm.adler >> 8) & 0xff);
            put_byte(s, (strm.adler >> 16) & 0xff);
            put_byte(s, (strm.adler >> 24) & 0xff);
            put_byte(s, strm.total_in & 0xff);
            put_byte(s, (strm.total_in >> 8) & 0xff);
            put_byte(s, (strm.total_in >> 16) & 0xff);
            put_byte(s, (strm.total_in >> 24) & 0xff);
          } else {
            putShortMSB(s, strm.adler >>> 16);
            putShortMSB(s, strm.adler & 0xffff);
          }

          flush_pending(strm);
          /* If avail_out is zero, the application will call deflate again
           * to flush the rest.
           */
          if (s.wrap > 0) {
            s.wrap = -s.wrap;
          }
          /* write the trailer only once! */
          return s.pending !== 0 ? Z_OK : Z_STREAM_END;
        }

        function deflateEnd(strm) {
          var status;

          if (!strm /*== Z_NULL*/ || !strm.state /*== Z_NULL*/ ) {
            return Z_STREAM_ERROR;
          }

          status = strm.state.status;
          if (status !== INIT_STATE &&
            status !== EXTRA_STATE &&
            status !== NAME_STATE &&
            status !== COMMENT_STATE &&
            status !== HCRC_STATE &&
            status !== BUSY_STATE &&
            status !== FINISH_STATE
          ) {
            return err(strm, Z_STREAM_ERROR);
          }

          strm.state = null;

          return status === BUSY_STATE ? err(strm, Z_DATA_ERROR) : Z_OK;
        }

        /* Not implemented
        exports.deflateBound = deflateBound;
        exports.deflateCopy = deflateCopy;
        exports.deflateParams = deflateParams;
        exports.deflatePending = deflatePending;
        exports.deflatePrime = deflatePrime;
        exports.deflateTune = deflateTune;
        */

        // See state defs from inflate.js
        var BAD = 30;       /* got a data error -- remain here until reset */
        var TYPE = 12;      /* i: waiting for type bits, including last-flag bit */

        /*
           Decode literal, length, and distance codes and write out the resulting
           literal and match bytes until either not enough input or output is
           available, an end-of-block is encountered, or a data error is encountered.
           When large enough input and output buffers are supplied to inflate(), for
           example, a 16K input buffer and a 64K output buffer, more than 95% of the
           inflate execution time is spent in this routine.

           Entry assumptions:

                state.mode === LEN
                strm.avail_in >= 6
                strm.avail_out >= 258
                start >= strm.avail_out
                state.bits < 8

           On return, state.mode is one of:

                LEN -- ran out of enough output space or enough available input
                TYPE -- reached end of block code, inflate() to interpret next block
                BAD -- error in block data

           Notes:

            - The maximum input bits used by a length/distance pair is 15 bits for the
              length code, 5 bits for the length extra, 15 bits for the distance code,
              and 13 bits for the distance extra.  This totals 48 bits, or six bytes.
              Therefore if strm.avail_in >= 6, then there is enough input to avoid
              checking for available input while decoding.

            - The maximum bytes that a single length/distance pair can output is 258
              bytes, which is the maximum length that can be coded.  inflate_fast()
              requires strm.avail_out >= 258 for each loop to avoid checking for
              output space.
         */
        function inflate_fast(strm, start) {
          var state;
          var _in;                    /* local strm.input */
          var last;                   /* have enough input while in < last */
          var _out;                   /* local strm.output */
          var beg;                    /* inflate()'s initial strm.output */
          var end;                    /* while out < end, enough space available */
        //#ifdef INFLATE_STRICT
          var dmax;                   /* maximum distance from zlib header */
        //#endif
          var wsize;                  /* window size or zero if not using window */
          var whave;                  /* valid bytes in the window */
          var wnext;                  /* window write index */
          // Use `s_window` instead `window`, avoid conflict with instrumentation tools
          var s_window;               /* allocated sliding window, if wsize != 0 */
          var hold;                   /* local strm.hold */
          var bits;                   /* local strm.bits */
          var lcode;                  /* local strm.lencode */
          var dcode;                  /* local strm.distcode */
          var lmask;                  /* mask for first level of length codes */
          var dmask;                  /* mask for first level of distance codes */
          var here;                   /* retrieved table entry */
          var op;                     /* code bits, operation, extra bits, or */
                                      /*  window position, window bytes to copy */
          var len;                    /* match length, unused bytes */
          var dist;                   /* match distance */
          var from;                   /* where to copy match from */
          var from_source;


          var input, output; // JS specific, because we have no pointers

          /* copy state to local variables */
          state = strm.state;
          //here = state.here;
          _in = strm.next_in;
          input = strm.input;
          last = _in + (strm.avail_in - 5);
          _out = strm.next_out;
          output = strm.output;
          beg = _out - (start - strm.avail_out);
          end = _out + (strm.avail_out - 257);
        //#ifdef INFLATE_STRICT
          dmax = state.dmax;
        //#endif
          wsize = state.wsize;
          whave = state.whave;
          wnext = state.wnext;
          s_window = state.window;
          hold = state.hold;
          bits = state.bits;
          lcode = state.lencode;
          dcode = state.distcode;
          lmask = (1 << state.lenbits) - 1;
          dmask = (1 << state.distbits) - 1;


          /* decode literals and length/distances until end-of-block or not enough
             input data or output space */

          top:
          do {
            if (bits < 15) {
              hold += input[_in++] << bits;
              bits += 8;
              hold += input[_in++] << bits;
              bits += 8;
            }

            here = lcode[hold & lmask];

            dolen:
            for (;;) { // Goto emulation
              op = here >>> 24/*here.bits*/;
              hold >>>= op;
              bits -= op;
              op = (here >>> 16) & 0xff/*here.op*/;
              if (op === 0) {                          /* literal */
                //Tracevv((stderr, here.val >= 0x20 && here.val < 0x7f ?
                //        "inflate:         literal '%c'\n" :
                //        "inflate:         literal 0x%02x\n", here.val));
                output[_out++] = here & 0xffff/*here.val*/;
              }
              else if (op & 16) {                     /* length base */
                len = here & 0xffff/*here.val*/;
                op &= 15;                           /* number of extra bits */
                if (op) {
                  if (bits < op) {
                    hold += input[_in++] << bits;
                    bits += 8;
                  }
                  len += hold & ((1 << op) - 1);
                  hold >>>= op;
                  bits -= op;
                }
                //Tracevv((stderr, "inflate:         length %u\n", len));
                if (bits < 15) {
                  hold += input[_in++] << bits;
                  bits += 8;
                  hold += input[_in++] << bits;
                  bits += 8;
                }
                here = dcode[hold & dmask];

                dodist:
                for (;;) { // goto emulation
                  op = here >>> 24/*here.bits*/;
                  hold >>>= op;
                  bits -= op;
                  op = (here >>> 16) & 0xff/*here.op*/;

                  if (op & 16) {                      /* distance base */
                    dist = here & 0xffff/*here.val*/;
                    op &= 15;                       /* number of extra bits */
                    if (bits < op) {
                      hold += input[_in++] << bits;
                      bits += 8;
                      if (bits < op) {
                        hold += input[_in++] << bits;
                        bits += 8;
                      }
                    }
                    dist += hold & ((1 << op) - 1);
        //#ifdef INFLATE_STRICT
                    if (dist > dmax) {
                      strm.msg = 'invalid distance too far back';
                      state.mode = BAD;
                      break top;
                    }
        //#endif
                    hold >>>= op;
                    bits -= op;
                    //Tracevv((stderr, "inflate:         distance %u\n", dist));
                    op = _out - beg;                /* max distance in output */
                    if (dist > op) {                /* see if copy from window */
                      op = dist - op;               /* distance back in window */
                      if (op > whave) {
                        if (state.sane) {
                          strm.msg = 'invalid distance too far back';
                          state.mode = BAD;
                          break top;
                        }

        // (!) This block is disabled in zlib defailts,
        // don't enable it for binary compatibility
        //#ifdef INFLATE_ALLOW_INVALID_DISTANCE_TOOFAR_ARRR
        //                if (len <= op - whave) {
        //                  do {
        //                    output[_out++] = 0;
        //                  } while (--len);
        //                  continue top;
        //                }
        //                len -= op - whave;
        //                do {
        //                  output[_out++] = 0;
        //                } while (--op > whave);
        //                if (op === 0) {
        //                  from = _out - dist;
        //                  do {
        //                    output[_out++] = output[from++];
        //                  } while (--len);
        //                  continue top;
        //                }
        //#endif
                      }
                      from = 0; // window index
                      from_source = s_window;
                      if (wnext === 0) {           /* very common case */
                        from += wsize - op;
                        if (op < len) {         /* some from window */
                          len -= op;
                          do {
                            output[_out++] = s_window[from++];
                          } while (--op);
                          from = _out - dist;  /* rest from output */
                          from_source = output;
                        }
                      }
                      else if (wnext < op) {      /* wrap around window */
                        from += wsize + wnext - op;
                        op -= wnext;
                        if (op < len) {         /* some from end of window */
                          len -= op;
                          do {
                            output[_out++] = s_window[from++];
                          } while (--op);
                          from = 0;
                          if (wnext < len) {  /* some from start of window */
                            op = wnext;
                            len -= op;
                            do {
                              output[_out++] = s_window[from++];
                            } while (--op);
                            from = _out - dist;      /* rest from output */
                            from_source = output;
                          }
                        }
                      }
                      else {                      /* contiguous in window */
                        from += wnext - op;
                        if (op < len) {         /* some from window */
                          len -= op;
                          do {
                            output[_out++] = s_window[from++];
                          } while (--op);
                          from = _out - dist;  /* rest from output */
                          from_source = output;
                        }
                      }
                      while (len > 2) {
                        output[_out++] = from_source[from++];
                        output[_out++] = from_source[from++];
                        output[_out++] = from_source[from++];
                        len -= 3;
                      }
                      if (len) {
                        output[_out++] = from_source[from++];
                        if (len > 1) {
                          output[_out++] = from_source[from++];
                        }
                      }
                    }
                    else {
                      from = _out - dist;          /* copy direct from output */
                      do {                        /* minimum length is three */
                        output[_out++] = output[from++];
                        output[_out++] = output[from++];
                        output[_out++] = output[from++];
                        len -= 3;
                      } while (len > 2);
                      if (len) {
                        output[_out++] = output[from++];
                        if (len > 1) {
                          output[_out++] = output[from++];
                        }
                      }
                    }
                  }
                  else if ((op & 64) === 0) {          /* 2nd level distance code */
                    here = dcode[(here & 0xffff)/*here.val*/ + (hold & ((1 << op) - 1))];
                    continue dodist;
                  }
                  else {
                    strm.msg = 'invalid distance code';
                    state.mode = BAD;
                    break top;
                  }

                  break; // need to emulate goto via "continue"
                }
              }
              else if ((op & 64) === 0) {              /* 2nd level length code */
                here = lcode[(here & 0xffff)/*here.val*/ + (hold & ((1 << op) - 1))];
                continue dolen;
              }
              else if (op & 32) {                     /* end-of-block */
                //Tracevv((stderr, "inflate:         end of block\n"));
                state.mode = TYPE;
                break top;
              }
              else {
                strm.msg = 'invalid literal/length code';
                state.mode = BAD;
                break top;
              }

              break; // need to emulate goto via "continue"
            }
          } while (_in < last && _out < end);

          /* return unused bytes (on entry, bits < 8, so in won't go too far back) */
          len = bits >> 3;
          _in -= len;
          bits -= len << 3;
          hold &= (1 << bits) - 1;

          /* update state and return */
          strm.next_in = _in;
          strm.next_out = _out;
          strm.avail_in = (_in < last ? 5 + (last - _in) : 5 - (_in - last));
          strm.avail_out = (_out < end ? 257 + (end - _out) : 257 - (_out - end));
          state.hold = hold;
          state.bits = bits;
          return;
        }

        var MAXBITS = 15;
        var ENOUGH_LENS = 852;
        var ENOUGH_DISTS = 592;
        //var ENOUGH = (ENOUGH_LENS+ENOUGH_DISTS);

        var CODES = 0;
        var LENS = 1;
        var DISTS = 2;

        var lbase = [ /* Length codes 257..285 base */
          3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31,
          35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 0, 0
        ];

        var lext = [ /* Length codes 257..285 extra */
          16, 16, 16, 16, 16, 16, 16, 16, 17, 17, 17, 17, 18, 18, 18, 18,
          19, 19, 19, 19, 20, 20, 20, 20, 21, 21, 21, 21, 16, 72, 78
        ];

        var dbase = [ /* Distance codes 0..29 base */
          1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193,
          257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145,
          8193, 12289, 16385, 24577, 0, 0
        ];

        var dext = [ /* Distance codes 0..29 extra */
          16, 16, 16, 16, 17, 17, 18, 18, 19, 19, 20, 20, 21, 21, 22, 22,
          23, 23, 24, 24, 25, 25, 26, 26, 27, 27,
          28, 28, 29, 29, 64, 64
        ];

        function inflate_table(type, lens, lens_index, codes, table, table_index, work, opts) {
          var bits = opts.bits;
          //here = opts.here; /* table entry for duplication */

          var len = 0; /* a code's length in bits */
          var sym = 0; /* index of code symbols */
          var min = 0,
            max = 0; /* minimum and maximum code lengths */
          var root = 0; /* number of index bits for root table */
          var curr = 0; /* number of index bits for current table */
          var drop = 0; /* code bits to drop for sub-table */
          var left = 0; /* number of prefix codes available */
          var used = 0; /* code entries in table used */
          var huff = 0; /* Huffman code */
          var incr; /* for incrementing code, index */
          var fill; /* index for replicating entries */
          var low; /* low bits for current root entry */
          var mask; /* mask for low root bits */
          var next; /* next available space in table */
          var base = null; /* base value table to use */
          var base_index = 0;
          //  var shoextra;    /* extra bits table to use */
          var end; /* use base and extra for symbol > end */
          var count = new Buf16(MAXBITS + 1); //[MAXBITS+1];    /* number of codes of each length */
          var offs = new Buf16(MAXBITS + 1); //[MAXBITS+1];     /* offsets in table for each length */
          var extra = null;
          var extra_index = 0;

          var here_bits, here_op, here_val;

          /*
           Process a set of code lengths to create a canonical Huffman code.  The
           code lengths are lens[0..codes-1].  Each length corresponds to the
           symbols 0..codes-1.  The Huffman code is generated by first sorting the
           symbols by length from short to long, and retaining the symbol order
           for codes with equal lengths.  Then the code starts with all zero bits
           for the first code of the shortest length, and the codes are integer
           increments for the same length, and zeros are appended as the length
           increases.  For the deflate format, these bits are stored backwards
           from their more natural integer increment ordering, and so when the
           decoding tables are built in the large loop below, the integer codes
           are incremented backwards.

           This routine assumes, but does not check, that all of the entries in
           lens[] are in the range 0..MAXBITS.  The caller must assure this.
           1..MAXBITS is interpreted as that code length.  zero means that that
           symbol does not occur in this code.

           The codes are sorted by computing a count of codes for each length,
           creating from that a table of starting indices for each length in the
           sorted table, and then entering the symbols in order in the sorted
           table.  The sorted table is work[], with that space being provided by
           the caller.

           The length counts are used for other purposes as well, i.e. finding
           the minimum and maximum length codes, determining if there are any
           codes at all, checking for a valid set of lengths, and looking ahead
           at length counts to determine sub-table sizes when building the
           decoding tables.
           */

          /* accumulate lengths for codes (assumes lens[] all in 0..MAXBITS) */
          for (len = 0; len <= MAXBITS; len++) {
            count[len] = 0;
          }
          for (sym = 0; sym < codes; sym++) {
            count[lens[lens_index + sym]]++;
          }

          /* bound code lengths, force root to be within code lengths */
          root = bits;
          for (max = MAXBITS; max >= 1; max--) {
            if (count[max] !== 0) {
              break;
            }
          }
          if (root > max) {
            root = max;
          }
          if (max === 0) { /* no symbols to code at all */
            //table.op[opts.table_index] = 64;  //here.op = (var char)64;    /* invalid code marker */
            //table.bits[opts.table_index] = 1;   //here.bits = (var char)1;
            //table.val[opts.table_index++] = 0;   //here.val = (var short)0;
            table[table_index++] = (1 << 24) | (64 << 16) | 0;


            //table.op[opts.table_index] = 64;
            //table.bits[opts.table_index] = 1;
            //table.val[opts.table_index++] = 0;
            table[table_index++] = (1 << 24) | (64 << 16) | 0;

            opts.bits = 1;
            return 0; /* no symbols, but wait for decoding to report error */
          }
          for (min = 1; min < max; min++) {
            if (count[min] !== 0) {
              break;
            }
          }
          if (root < min) {
            root = min;
          }

          /* check for an over-subscribed or incomplete set of lengths */
          left = 1;
          for (len = 1; len <= MAXBITS; len++) {
            left <<= 1;
            left -= count[len];
            if (left < 0) {
              return -1;
            } /* over-subscribed */
          }
          if (left > 0 && (type === CODES || max !== 1)) {
            return -1; /* incomplete set */
          }

          /* generate offsets into symbol table for each length for sorting */
          offs[1] = 0;
          for (len = 1; len < MAXBITS; len++) {
            offs[len + 1] = offs[len] + count[len];
          }

          /* sort symbols by length, by symbol order within each length */
          for (sym = 0; sym < codes; sym++) {
            if (lens[lens_index + sym] !== 0) {
              work[offs[lens[lens_index + sym]]++] = sym;
            }
          }

          /*
           Create and fill in decoding tables.  In this loop, the table being
           filled is at next and has curr index bits.  The code being used is huff
           with length len.  That code is converted to an index by dropping drop
           bits off of the bottom.  For codes where len is less than drop + curr,
           those top drop + curr - len bits are incremented through all values to
           fill the table with replicated entries.

           root is the number of index bits for the root table.  When len exceeds
           root, sub-tables are created pointed to by the root entry with an index
           of the low root bits of huff.  This is saved in low to check for when a
           new sub-table should be started.  drop is zero when the root table is
           being filled, and drop is root when sub-tables are being filled.

           When a new sub-table is needed, it is necessary to look ahead in the
           code lengths to determine what size sub-table is needed.  The length
           counts are used for this, and so count[] is decremented as codes are
           entered in the tables.

           used keeps track of how many table entries have been allocated from the
           provided *table space.  It is checked for LENS and DIST tables against
           the constants ENOUGH_LENS and ENOUGH_DISTS to guard against changes in
           the initial root table size constants.  See the comments in inftrees.h
           for more information.

           sym increments through all symbols, and the loop terminates when
           all codes of length max, i.e. all codes, have been processed.  This
           routine permits incomplete codes, so another loop after this one fills
           in the rest of the decoding tables with invalid code markers.
           */

          /* set up for code type */
          // poor man optimization - use if-else instead of switch,
          // to avoid deopts in old v8
          if (type === CODES) {
            base = extra = work; /* dummy value--not used */
            end = 19;

          } else if (type === LENS) {
            base = lbase;
            base_index -= 257;
            extra = lext;
            extra_index -= 257;
            end = 256;

          } else { /* DISTS */
            base = dbase;
            extra = dext;
            end = -1;
          }

          /* initialize opts for loop */
          huff = 0; /* starting code */
          sym = 0; /* starting code symbol */
          len = min; /* starting code length */
          next = table_index; /* current table to fill in */
          curr = root; /* current table index bits */
          drop = 0; /* current bits to drop from code for index */
          low = -1; /* trigger new sub-table when len > root */
          used = 1 << root; /* use root table entries */
          mask = used - 1; /* mask for comparing low */

          /* check available table space */
          if ((type === LENS && used > ENOUGH_LENS) ||
            (type === DISTS && used > ENOUGH_DISTS)) {
            return 1;
          }
          /* process all codes and make table entries */
          for (;;) {
            /* create table entry */
            here_bits = len - drop;
            if (work[sym] < end) {
              here_op = 0;
              here_val = work[sym];
            } else if (work[sym] > end) {
              here_op = extra[extra_index + work[sym]];
              here_val = base[base_index + work[sym]];
            } else {
              here_op = 32 + 64; /* end of block */
              here_val = 0;
            }

            /* replicate for those indices with low len bits equal to huff */
            incr = 1 << (len - drop);
            fill = 1 << curr;
            min = fill; /* save offset to next table */
            do {
              fill -= incr;
              table[next + (huff >> drop) + fill] = (here_bits << 24) | (here_op << 16) | here_val | 0;
            } while (fill !== 0);

            /* backwards increment the len-bit code huff */
            incr = 1 << (len - 1);
            while (huff & incr) {
              incr >>= 1;
            }
            if (incr !== 0) {
              huff &= incr - 1;
              huff += incr;
            } else {
              huff = 0;
            }

            /* go to next symbol, update count, len */
            sym++;
            if (--count[len] === 0) {
              if (len === max) {
                break;
              }
              len = lens[lens_index + work[sym]];
            }

            /* create new sub-table if needed */
            if (len > root && (huff & mask) !== low) {
              /* if first time, transition to sub-tables */
              if (drop === 0) {
                drop = root;
              }

              /* increment past last table */
              next += min; /* here min is 1 << curr */

              /* determine length of next table */
              curr = len - drop;
              left = 1 << curr;
              while (curr + drop < max) {
                left -= count[curr + drop];
                if (left <= 0) {
                  break;
                }
                curr++;
                left <<= 1;
              }

              /* check for enough space */
              used += 1 << curr;
              if ((type === LENS && used > ENOUGH_LENS) ||
                (type === DISTS && used > ENOUGH_DISTS)) {
                return 1;
              }

              /* point entry in root table to sub-table */
              low = huff & mask;
              /*table.op[low] = curr;
              table.bits[low] = root;
              table.val[low] = next - opts.table_index;*/
              table[low] = (root << 24) | (curr << 16) | (next - table_index) | 0;
            }
          }

          /* fill in remaining table entry if code is incomplete (guaranteed to have
           at most one remaining entry, since if the code is incomplete, the
           maximum code length that was allowed to get this far is one bit) */
          if (huff !== 0) {
            //table.op[next + huff] = 64;            /* invalid code marker */
            //table.bits[next + huff] = len - drop;
            //table.val[next + huff] = 0;
            table[next + huff] = ((len - drop) << 24) | (64 << 16) | 0;
          }

          /* set return parameters */
          //opts.table_index += used;
          opts.bits = root;
          return 0;
        }

        var CODES$1 = 0;
        var LENS$1 = 1;
        var DISTS$1 = 2;

        /* Public constants ==========================================================*/
        /* ===========================================================================*/


        /* Allowed flush values; see deflate() and inflate() below for details */
        //var Z_NO_FLUSH      = 0;
        //var Z_PARTIAL_FLUSH = 1;
        //var Z_SYNC_FLUSH    = 2;
        //var Z_FULL_FLUSH    = 3;
        var Z_FINISH$1 = 4;
        var Z_BLOCK$1 = 5;
        var Z_TREES = 6;


        /* Return codes for the compression/decompression functions. Negative values
         * are errors, positive values are used for special but normal events.
         */
        var Z_OK$1 = 0;
        var Z_STREAM_END$1 = 1;
        var Z_NEED_DICT = 2;
        //var Z_ERRNO         = -1;
        var Z_STREAM_ERROR$1 = -2;
        var Z_DATA_ERROR$1 = -3;
        var Z_MEM_ERROR = -4;
        var Z_BUF_ERROR$1 = -5;
        //var Z_VERSION_ERROR = -6;

        /* The deflate compression method */
        var Z_DEFLATED$1 = 8;


        /* STATES ====================================================================*/
        /* ===========================================================================*/


        var HEAD = 1; /* i: waiting for magic header */
        var FLAGS = 2; /* i: waiting for method and flags (gzip) */
        var TIME = 3; /* i: waiting for modification time (gzip) */
        var OS = 4; /* i: waiting for extra flags and operating system (gzip) */
        var EXLEN = 5; /* i: waiting for extra length (gzip) */
        var EXTRA = 6; /* i: waiting for extra bytes (gzip) */
        var NAME = 7; /* i: waiting for end of file name (gzip) */
        var COMMENT = 8; /* i: waiting for end of comment (gzip) */
        var HCRC = 9; /* i: waiting for header crc (gzip) */
        var DICTID = 10; /* i: waiting for dictionary check value */
        var DICT = 11; /* waiting for inflateSetDictionary() call */
        var TYPE$1 = 12; /* i: waiting for type bits, including last-flag bit */
        var TYPEDO = 13; /* i: same, but skip check to exit inflate on new block */
        var STORED = 14; /* i: waiting for stored size (length and complement) */
        var COPY_ = 15; /* i/o: same as COPY below, but only first time in */
        var COPY = 16; /* i/o: waiting for input or output to copy stored block */
        var TABLE = 17; /* i: waiting for dynamic block table lengths */
        var LENLENS = 18; /* i: waiting for code length code lengths */
        var CODELENS = 19; /* i: waiting for length/lit and distance code lengths */
        var LEN_ = 20; /* i: same as LEN below, but only first time in */
        var LEN = 21; /* i: waiting for length/lit/eob code */
        var LENEXT = 22; /* i: waiting for length extra bits */
        var DIST = 23; /* i: waiting for distance code */
        var DISTEXT = 24; /* i: waiting for distance extra bits */
        var MATCH = 25; /* o: waiting for output space to copy string */
        var LIT = 26; /* o: waiting for output space to write literal */
        var CHECK = 27; /* i: waiting for 32-bit check value */
        var LENGTH = 28; /* i: waiting for 32-bit length (gzip) */
        var DONE = 29; /* finished check, done -- remain here until reset */
        var BAD$1 = 30; /* got a data error -- remain here until reset */
        var MEM = 31; /* got an inflate() memory error -- remain here until reset */
        var SYNC = 32; /* looking for synchronization bytes to restart inflate() */

        /* ===========================================================================*/



        var ENOUGH_LENS$1 = 852;
        var ENOUGH_DISTS$1 = 592;


        function zswap32(q) {
          return (((q >>> 24) & 0xff) +
            ((q >>> 8) & 0xff00) +
            ((q & 0xff00) << 8) +
            ((q & 0xff) << 24));
        }


        function InflateState() {
          this.mode = 0; /* current inflate mode */
          this.last = false; /* true if processing last block */
          this.wrap = 0; /* bit 0 true for zlib, bit 1 true for gzip */
          this.havedict = false; /* true if dictionary provided */
          this.flags = 0; /* gzip header method and flags (0 if zlib) */
          this.dmax = 0; /* zlib header max distance (INFLATE_STRICT) */
          this.check = 0; /* protected copy of check value */
          this.total = 0; /* protected copy of output count */
          // TODO: may be {}
          this.head = null; /* where to save gzip header information */

          /* sliding window */
          this.wbits = 0; /* log base 2 of requested window size */
          this.wsize = 0; /* window size or zero if not using window */
          this.whave = 0; /* valid bytes in the window */
          this.wnext = 0; /* window write index */
          this.window = null; /* allocated sliding window, if needed */

          /* bit accumulator */
          this.hold = 0; /* input bit accumulator */
          this.bits = 0; /* number of bits in "in" */

          /* for string and stored block copying */
          this.length = 0; /* literal or length of data to copy */
          this.offset = 0; /* distance back to copy string from */

          /* for table and code decoding */
          this.extra = 0; /* extra bits needed */

          /* fixed and dynamic code tables */
          this.lencode = null; /* starting table for length/literal codes */
          this.distcode = null; /* starting table for distance codes */
          this.lenbits = 0; /* index bits for lencode */
          this.distbits = 0; /* index bits for distcode */

          /* dynamic table building */
          this.ncode = 0; /* number of code length code lengths */
          this.nlen = 0; /* number of length code lengths */
          this.ndist = 0; /* number of distance code lengths */
          this.have = 0; /* number of code lengths in lens[] */
          this.next = null; /* next available space in codes[] */

          this.lens = new Buf16(320); /* temporary storage for code lengths */
          this.work = new Buf16(288); /* work area for code table building */

          /*
           because we don't have pointers in js, we use lencode and distcode directly
           as buffers so we don't need codes
          */
          //this.codes = new Buf32(ENOUGH);       /* space for code tables */
          this.lendyn = null; /* dynamic table for length/literal codes (JS specific) */
          this.distdyn = null; /* dynamic table for distance codes (JS specific) */
          this.sane = 0; /* if false, allow invalid distance too far */
          this.back = 0; /* bits back of last unprocessed length/lit */
          this.was = 0; /* initial length of match */
        }

        function inflateResetKeep(strm) {
          var state;

          if (!strm || !strm.state) {
            return Z_STREAM_ERROR$1;
          }
          state = strm.state;
          strm.total_in = strm.total_out = state.total = 0;
          strm.msg = ''; /*Z_NULL*/
          if (state.wrap) { /* to support ill-conceived Java test suite */
            strm.adler = state.wrap & 1;
          }
          state.mode = HEAD;
          state.last = 0;
          state.havedict = 0;
          state.dmax = 32768;
          state.head = null /*Z_NULL*/ ;
          state.hold = 0;
          state.bits = 0;
          //state.lencode = state.distcode = state.next = state.codes;
          state.lencode = state.lendyn = new Buf32(ENOUGH_LENS$1);
          state.distcode = state.distdyn = new Buf32(ENOUGH_DISTS$1);

          state.sane = 1;
          state.back = -1;
          //Tracev((stderr, "inflate: reset\n"));
          return Z_OK$1;
        }

        function inflateReset(strm) {
          var state;

          if (!strm || !strm.state) {
            return Z_STREAM_ERROR$1;
          }
          state = strm.state;
          state.wsize = 0;
          state.whave = 0;
          state.wnext = 0;
          return inflateResetKeep(strm);

        }

        function inflateReset2(strm, windowBits) {
          var wrap;
          var state;

          /* get the state */
          if (!strm || !strm.state) {
            return Z_STREAM_ERROR$1;
          }
          state = strm.state;

          /* extract wrap request from windowBits parameter */
          if (windowBits < 0) {
            wrap = 0;
            windowBits = -windowBits;
          } else {
            wrap = (windowBits >> 4) + 1;
            if (windowBits < 48) {
              windowBits &= 15;
            }
          }

          /* set number of window bits, free window if different */
          if (windowBits && (windowBits < 8 || windowBits > 15)) {
            return Z_STREAM_ERROR$1;
          }
          if (state.window !== null && state.wbits !== windowBits) {
            state.window = null;
          }

          /* update state and reset the rest of it */
          state.wrap = wrap;
          state.wbits = windowBits;
          return inflateReset(strm);
        }

        function inflateInit2(strm, windowBits) {
          var ret;
          var state;

          if (!strm) {
            return Z_STREAM_ERROR$1;
          }
          //strm.msg = Z_NULL;                 /* in case we return an error */

          state = new InflateState();

          //if (state === Z_NULL) return Z_MEM_ERROR;
          //Tracev((stderr, "inflate: allocated\n"));
          strm.state = state;
          state.window = null /*Z_NULL*/ ;
          ret = inflateReset2(strm, windowBits);
          if (ret !== Z_OK$1) {
            strm.state = null /*Z_NULL*/ ;
          }
          return ret;
        }


        /*
         Return state with length and distance decoding tables and index sizes set to
         fixed code decoding.  Normally this returns fixed tables from inffixed.h.
         If BUILDFIXED is defined, then instead this routine builds the tables the
         first time it's called, and returns those tables the first time and
         thereafter.  This reduces the size of the code by about 2K bytes, in
         exchange for a little execution time.  However, BUILDFIXED should not be
         used for threaded applications, since the rewriting of the tables and virgin
         may not be thread-safe.
         */
        var virgin = true;

        var lenfix, distfix; // We have no pointers in JS, so keep tables separate

        function fixedtables(state) {
          /* build fixed huffman tables if first call (may not be thread safe) */
          if (virgin) {
            var sym;

            lenfix = new Buf32(512);
            distfix = new Buf32(32);

            /* literal/length table */
            sym = 0;
            while (sym < 144) {
              state.lens[sym++] = 8;
            }
            while (sym < 256) {
              state.lens[sym++] = 9;
            }
            while (sym < 280) {
              state.lens[sym++] = 7;
            }
            while (sym < 288) {
              state.lens[sym++] = 8;
            }

            inflate_table(LENS$1, state.lens, 0, 288, lenfix, 0, state.work, {
              bits: 9
            });

            /* distance table */
            sym = 0;
            while (sym < 32) {
              state.lens[sym++] = 5;
            }

            inflate_table(DISTS$1, state.lens, 0, 32, distfix, 0, state.work, {
              bits: 5
            });

            /* do this just once */
            virgin = false;
          }

          state.lencode = lenfix;
          state.lenbits = 9;
          state.distcode = distfix;
          state.distbits = 5;
        }


        /*
         Update the window with the last wsize (normally 32K) bytes written before
         returning.  If window does not exist yet, create it.  This is only called
         when a window is already in use, or when output has been written during this
         inflate call, but the end of the deflate stream has not been reached yet.
         It is also called to create a window for dictionary data when a dictionary
         is loaded.

         Providing output buffers larger than 32K to inflate() should provide a speed
         advantage, since only the last 32K of output is copied to the sliding window
         upon return from inflate(), and since all distances after the first 32K of
         output will fall in the output data, making match copies simpler and faster.
         The advantage may be dependent on the size of the processor's data caches.
         */
        function updatewindow(strm, src, end, copy) {
          var dist;
          var state = strm.state;

          /* if it hasn't been done already, allocate space for the window */
          if (state.window === null) {
            state.wsize = 1 << state.wbits;
            state.wnext = 0;
            state.whave = 0;

            state.window = new Buf8(state.wsize);
          }

          /* copy state->wsize or less output bytes into the circular window */
          if (copy >= state.wsize) {
            arraySet(state.window, src, end - state.wsize, state.wsize, 0);
            state.wnext = 0;
            state.whave = state.wsize;
          } else {
            dist = state.wsize - state.wnext;
            if (dist > copy) {
              dist = copy;
            }
            //zmemcpy(state->window + state->wnext, end - copy, dist);
            arraySet(state.window, src, end - copy, dist, state.wnext);
            copy -= dist;
            if (copy) {
              //zmemcpy(state->window, end - copy, copy);
              arraySet(state.window, src, end - copy, copy, 0);
              state.wnext = copy;
              state.whave = state.wsize;
            } else {
              state.wnext += dist;
              if (state.wnext === state.wsize) {
                state.wnext = 0;
              }
              if (state.whave < state.wsize) {
                state.whave += dist;
              }
            }
          }
          return 0;
        }

        function inflate(strm, flush) {
          var state;
          var input, output; // input/output buffers
          var next; /* next input INDEX */
          var put; /* next output INDEX */
          var have, left; /* available input and output */
          var hold; /* bit buffer */
          var bits; /* bits in bit buffer */
          var _in, _out; /* save starting available input and output */
          var copy; /* number of stored or match bytes to copy */
          var from; /* where to copy match bytes from */
          var from_source;
          var here = 0; /* current decoding table entry */
          var here_bits, here_op, here_val; // paked "here" denormalized (JS specific)
          //var last;                   /* parent table entry */
          var last_bits, last_op, last_val; // paked "last" denormalized (JS specific)
          var len; /* length to copy for repeats, bits to drop */
          var ret; /* return code */
          var hbuf = new Buf8(4); /* buffer for gzip header crc calculation */
          var opts;

          var n; // temporary var for NEED_BITS

          var order = /* permutation of code lengths */ [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];


          if (!strm || !strm.state || !strm.output ||
            (!strm.input && strm.avail_in !== 0)) {
            return Z_STREAM_ERROR$1;
          }

          state = strm.state;
          if (state.mode === TYPE$1) {
            state.mode = TYPEDO;
          } /* skip check */


          //--- LOAD() ---
          put = strm.next_out;
          output = strm.output;
          left = strm.avail_out;
          next = strm.next_in;
          input = strm.input;
          have = strm.avail_in;
          hold = state.hold;
          bits = state.bits;
          //---

          _in = have;
          _out = left;
          ret = Z_OK$1;

          inf_leave: // goto emulation
            for (;;) {
              switch (state.mode) {
              case HEAD:
                if (state.wrap === 0) {
                  state.mode = TYPEDO;
                  break;
                }
                //=== NEEDBITS(16);
                while (bits < 16) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                //===//
                if ((state.wrap & 2) && hold === 0x8b1f) { /* gzip header */
                  state.check = 0 /*crc32(0L, Z_NULL, 0)*/ ;
                  //=== CRC2(state.check, hold);
                  hbuf[0] = hold & 0xff;
                  hbuf[1] = (hold >>> 8) & 0xff;
                  state.check = crc32(state.check, hbuf, 2, 0);
                  //===//

                  //=== INITBITS();
                  hold = 0;
                  bits = 0;
                  //===//
                  state.mode = FLAGS;
                  break;
                }
                state.flags = 0; /* expect zlib header */
                if (state.head) {
                  state.head.done = false;
                }
                if (!(state.wrap & 1) || /* check if zlib header allowed */
                  (((hold & 0xff) /*BITS(8)*/ << 8) + (hold >> 8)) % 31) {
                  strm.msg = 'incorrect header check';
                  state.mode = BAD$1;
                  break;
                }
                if ((hold & 0x0f) /*BITS(4)*/ !== Z_DEFLATED$1) {
                  strm.msg = 'unknown compression method';
                  state.mode = BAD$1;
                  break;
                }
                //--- DROPBITS(4) ---//
                hold >>>= 4;
                bits -= 4;
                //---//
                len = (hold & 0x0f) /*BITS(4)*/ + 8;
                if (state.wbits === 0) {
                  state.wbits = len;
                } else if (len > state.wbits) {
                  strm.msg = 'invalid window size';
                  state.mode = BAD$1;
                  break;
                }
                state.dmax = 1 << len;
                //Tracev((stderr, "inflate:   zlib header ok\n"));
                strm.adler = state.check = 1 /*adler32(0L, Z_NULL, 0)*/ ;
                state.mode = hold & 0x200 ? DICTID : TYPE$1;
                //=== INITBITS();
                hold = 0;
                bits = 0;
                //===//
                break;
              case FLAGS:
                //=== NEEDBITS(16); */
                while (bits < 16) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                //===//
                state.flags = hold;
                if ((state.flags & 0xff) !== Z_DEFLATED$1) {
                  strm.msg = 'unknown compression method';
                  state.mode = BAD$1;
                  break;
                }
                if (state.flags & 0xe000) {
                  strm.msg = 'unknown header flags set';
                  state.mode = BAD$1;
                  break;
                }
                if (state.head) {
                  state.head.text = ((hold >> 8) & 1);
                }
                if (state.flags & 0x0200) {
                  //=== CRC2(state.check, hold);
                  hbuf[0] = hold & 0xff;
                  hbuf[1] = (hold >>> 8) & 0xff;
                  state.check = crc32(state.check, hbuf, 2, 0);
                  //===//
                }
                //=== INITBITS();
                hold = 0;
                bits = 0;
                //===//
                state.mode = TIME;
                /* falls through */
              case TIME:
                //=== NEEDBITS(32); */
                while (bits < 32) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                //===//
                if (state.head) {
                  state.head.time = hold;
                }
                if (state.flags & 0x0200) {
                  //=== CRC4(state.check, hold)
                  hbuf[0] = hold & 0xff;
                  hbuf[1] = (hold >>> 8) & 0xff;
                  hbuf[2] = (hold >>> 16) & 0xff;
                  hbuf[3] = (hold >>> 24) & 0xff;
                  state.check = crc32(state.check, hbuf, 4, 0);
                  //===
                }
                //=== INITBITS();
                hold = 0;
                bits = 0;
                //===//
                state.mode = OS;
                /* falls through */
              case OS:
                //=== NEEDBITS(16); */
                while (bits < 16) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                //===//
                if (state.head) {
                  state.head.xflags = (hold & 0xff);
                  state.head.os = (hold >> 8);
                }
                if (state.flags & 0x0200) {
                  //=== CRC2(state.check, hold);
                  hbuf[0] = hold & 0xff;
                  hbuf[1] = (hold >>> 8) & 0xff;
                  state.check = crc32(state.check, hbuf, 2, 0);
                  //===//
                }
                //=== INITBITS();
                hold = 0;
                bits = 0;
                //===//
                state.mode = EXLEN;
                /* falls through */
              case EXLEN:
                if (state.flags & 0x0400) {
                  //=== NEEDBITS(16); */
                  while (bits < 16) {
                    if (have === 0) {
                      break inf_leave;
                    }
                    have--;
                    hold += input[next++] << bits;
                    bits += 8;
                  }
                  //===//
                  state.length = hold;
                  if (state.head) {
                    state.head.extra_len = hold;
                  }
                  if (state.flags & 0x0200) {
                    //=== CRC2(state.check, hold);
                    hbuf[0] = hold & 0xff;
                    hbuf[1] = (hold >>> 8) & 0xff;
                    state.check = crc32(state.check, hbuf, 2, 0);
                    //===//
                  }
                  //=== INITBITS();
                  hold = 0;
                  bits = 0;
                  //===//
                } else if (state.head) {
                  state.head.extra = null /*Z_NULL*/ ;
                }
                state.mode = EXTRA;
                /* falls through */
              case EXTRA:
                if (state.flags & 0x0400) {
                  copy = state.length;
                  if (copy > have) {
                    copy = have;
                  }
                  if (copy) {
                    if (state.head) {
                      len = state.head.extra_len - state.length;
                      if (!state.head.extra) {
                        // Use untyped array for more conveniend processing later
                        state.head.extra = new Array(state.head.extra_len);
                      }
                      arraySet(
                        state.head.extra,
                        input,
                        next,
                        // extra field is limited to 65536 bytes
                        // - no need for additional size check
                        copy,
                        /*len + copy > state.head.extra_max - len ? state.head.extra_max : copy,*/
                        len
                      );
                      //zmemcpy(state.head.extra + len, next,
                      //        len + copy > state.head.extra_max ?
                      //        state.head.extra_max - len : copy);
                    }
                    if (state.flags & 0x0200) {
                      state.check = crc32(state.check, input, copy, next);
                    }
                    have -= copy;
                    next += copy;
                    state.length -= copy;
                  }
                  if (state.length) {
                    break inf_leave;
                  }
                }
                state.length = 0;
                state.mode = NAME;
                /* falls through */
              case NAME:
                if (state.flags & 0x0800) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  copy = 0;
                  do {
                    // TODO: 2 or 1 bytes?
                    len = input[next + copy++];
                    /* use constant limit because in js we should not preallocate memory */
                    if (state.head && len &&
                      (state.length < 65536 /*state.head.name_max*/ )) {
                      state.head.name += String.fromCharCode(len);
                    }
                  } while (len && copy < have);

                  if (state.flags & 0x0200) {
                    state.check = crc32(state.check, input, copy, next);
                  }
                  have -= copy;
                  next += copy;
                  if (len) {
                    break inf_leave;
                  }
                } else if (state.head) {
                  state.head.name = null;
                }
                state.length = 0;
                state.mode = COMMENT;
                /* falls through */
              case COMMENT:
                if (state.flags & 0x1000) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  copy = 0;
                  do {
                    len = input[next + copy++];
                    /* use constant limit because in js we should not preallocate memory */
                    if (state.head && len &&
                      (state.length < 65536 /*state.head.comm_max*/ )) {
                      state.head.comment += String.fromCharCode(len);
                    }
                  } while (len && copy < have);
                  if (state.flags & 0x0200) {
                    state.check = crc32(state.check, input, copy, next);
                  }
                  have -= copy;
                  next += copy;
                  if (len) {
                    break inf_leave;
                  }
                } else if (state.head) {
                  state.head.comment = null;
                }
                state.mode = HCRC;
                /* falls through */
              case HCRC:
                if (state.flags & 0x0200) {
                  //=== NEEDBITS(16); */
                  while (bits < 16) {
                    if (have === 0) {
                      break inf_leave;
                    }
                    have--;
                    hold += input[next++] << bits;
                    bits += 8;
                  }
                  //===//
                  if (hold !== (state.check & 0xffff)) {
                    strm.msg = 'header crc mismatch';
                    state.mode = BAD$1;
                    break;
                  }
                  //=== INITBITS();
                  hold = 0;
                  bits = 0;
                  //===//
                }
                if (state.head) {
                  state.head.hcrc = ((state.flags >> 9) & 1);
                  state.head.done = true;
                }
                strm.adler = state.check = 0;
                state.mode = TYPE$1;
                break;
              case DICTID:
                //=== NEEDBITS(32); */
                while (bits < 32) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                //===//
                strm.adler = state.check = zswap32(hold);
                //=== INITBITS();
                hold = 0;
                bits = 0;
                //===//
                state.mode = DICT;
                /* falls through */
              case DICT:
                if (state.havedict === 0) {
                  //--- RESTORE() ---
                  strm.next_out = put;
                  strm.avail_out = left;
                  strm.next_in = next;
                  strm.avail_in = have;
                  state.hold = hold;
                  state.bits = bits;
                  //---
                  return Z_NEED_DICT;
                }
                strm.adler = state.check = 1 /*adler32(0L, Z_NULL, 0)*/ ;
                state.mode = TYPE$1;
                /* falls through */
              case TYPE$1:
                if (flush === Z_BLOCK$1 || flush === Z_TREES) {
                  break inf_leave;
                }
                /* falls through */
              case TYPEDO:
                if (state.last) {
                  //--- BYTEBITS() ---//
                  hold >>>= bits & 7;
                  bits -= bits & 7;
                  //---//
                  state.mode = CHECK;
                  break;
                }
                //=== NEEDBITS(3); */
                while (bits < 3) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                //===//
                state.last = (hold & 0x01) /*BITS(1)*/ ;
                //--- DROPBITS(1) ---//
                hold >>>= 1;
                bits -= 1;
                //---//

                switch ((hold & 0x03) /*BITS(2)*/ ) {
                case 0:
                  /* stored block */
                  //Tracev((stderr, "inflate:     stored block%s\n",
                  //        state.last ? " (last)" : ""));
                  state.mode = STORED;
                  break;
                case 1:
                  /* fixed block */
                  fixedtables(state);
                  //Tracev((stderr, "inflate:     fixed codes block%s\n",
                  //        state.last ? " (last)" : ""));
                  state.mode = LEN_; /* decode codes */
                  if (flush === Z_TREES) {
                    //--- DROPBITS(2) ---//
                    hold >>>= 2;
                    bits -= 2;
                    //---//
                    break inf_leave;
                  }
                  break;
                case 2:
                  /* dynamic block */
                  //Tracev((stderr, "inflate:     dynamic codes block%s\n",
                  //        state.last ? " (last)" : ""));
                  state.mode = TABLE;
                  break;
                case 3:
                  strm.msg = 'invalid block type';
                  state.mode = BAD$1;
                }
                //--- DROPBITS(2) ---//
                hold >>>= 2;
                bits -= 2;
                //---//
                break;
              case STORED:
                //--- BYTEBITS() ---// /* go to byte boundary */
                hold >>>= bits & 7;
                bits -= bits & 7;
                //---//
                //=== NEEDBITS(32); */
                while (bits < 32) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                //===//
                if ((hold & 0xffff) !== ((hold >>> 16) ^ 0xffff)) {
                  strm.msg = 'invalid stored block lengths';
                  state.mode = BAD$1;
                  break;
                }
                state.length = hold & 0xffff;
                //Tracev((stderr, "inflate:       stored length %u\n",
                //        state.length));
                //=== INITBITS();
                hold = 0;
                bits = 0;
                //===//
                state.mode = COPY_;
                if (flush === Z_TREES) {
                  break inf_leave;
                }
                /* falls through */
              case COPY_:
                state.mode = COPY;
                /* falls through */
              case COPY:
                copy = state.length;
                if (copy) {
                  if (copy > have) {
                    copy = have;
                  }
                  if (copy > left) {
                    copy = left;
                  }
                  if (copy === 0) {
                    break inf_leave;
                  }
                  //--- zmemcpy(put, next, copy); ---
                  arraySet(output, input, next, copy, put);
                  //---//
                  have -= copy;
                  next += copy;
                  left -= copy;
                  put += copy;
                  state.length -= copy;
                  break;
                }
                //Tracev((stderr, "inflate:       stored end\n"));
                state.mode = TYPE$1;
                break;
              case TABLE:
                //=== NEEDBITS(14); */
                while (bits < 14) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                //===//
                state.nlen = (hold & 0x1f) /*BITS(5)*/ + 257;
                //--- DROPBITS(5) ---//
                hold >>>= 5;
                bits -= 5;
                //---//
                state.ndist = (hold & 0x1f) /*BITS(5)*/ + 1;
                //--- DROPBITS(5) ---//
                hold >>>= 5;
                bits -= 5;
                //---//
                state.ncode = (hold & 0x0f) /*BITS(4)*/ + 4;
                //--- DROPBITS(4) ---//
                hold >>>= 4;
                bits -= 4;
                //---//
                //#ifndef PKZIP_BUG_WORKAROUND
                if (state.nlen > 286 || state.ndist > 30) {
                  strm.msg = 'too many length or distance symbols';
                  state.mode = BAD$1;
                  break;
                }
                //#endif
                //Tracev((stderr, "inflate:       table sizes ok\n"));
                state.have = 0;
                state.mode = LENLENS;
                /* falls through */
              case LENLENS:
                while (state.have < state.ncode) {
                  //=== NEEDBITS(3);
                  while (bits < 3) {
                    if (have === 0) {
                      break inf_leave;
                    }
                    have--;
                    hold += input[next++] << bits;
                    bits += 8;
                  }
                  //===//
                  state.lens[order[state.have++]] = (hold & 0x07); //BITS(3);
                  //--- DROPBITS(3) ---//
                  hold >>>= 3;
                  bits -= 3;
                  //---//
                }
                while (state.have < 19) {
                  state.lens[order[state.have++]] = 0;
                }
                // We have separate tables & no pointers. 2 commented lines below not needed.
                //state.next = state.codes;
                //state.lencode = state.next;
                // Switch to use dynamic table
                state.lencode = state.lendyn;
                state.lenbits = 7;

                opts = {
                  bits: state.lenbits
                };
                ret = inflate_table(CODES$1, state.lens, 0, 19, state.lencode, 0, state.work, opts);
                state.lenbits = opts.bits;

                if (ret) {
                  strm.msg = 'invalid code lengths set';
                  state.mode = BAD$1;
                  break;
                }
                //Tracev((stderr, "inflate:       code lengths ok\n"));
                state.have = 0;
                state.mode = CODELENS;
                /* falls through */
              case CODELENS:
                while (state.have < state.nlen + state.ndist) {
                  for (;;) {
                    here = state.lencode[hold & ((1 << state.lenbits) - 1)]; /*BITS(state.lenbits)*/
                    here_bits = here >>> 24;
                    here_op = (here >>> 16) & 0xff;
                    here_val = here & 0xffff;

                    if ((here_bits) <= bits) {
                      break;
                    }
                    //--- PULLBYTE() ---//
                    if (have === 0) {
                      break inf_leave;
                    }
                    have--;
                    hold += input[next++] << bits;
                    bits += 8;
                    //---//
                  }
                  if (here_val < 16) {
                    //--- DROPBITS(here.bits) ---//
                    hold >>>= here_bits;
                    bits -= here_bits;
                    //---//
                    state.lens[state.have++] = here_val;
                  } else {
                    if (here_val === 16) {
                      //=== NEEDBITS(here.bits + 2);
                      n = here_bits + 2;
                      while (bits < n) {
                        if (have === 0) {
                          break inf_leave;
                        }
                        have--;
                        hold += input[next++] << bits;
                        bits += 8;
                      }
                      //===//
                      //--- DROPBITS(here.bits) ---//
                      hold >>>= here_bits;
                      bits -= here_bits;
                      //---//
                      if (state.have === 0) {
                        strm.msg = 'invalid bit length repeat';
                        state.mode = BAD$1;
                        break;
                      }
                      len = state.lens[state.have - 1];
                      copy = 3 + (hold & 0x03); //BITS(2);
                      //--- DROPBITS(2) ---//
                      hold >>>= 2;
                      bits -= 2;
                      //---//
                    } else if (here_val === 17) {
                      //=== NEEDBITS(here.bits + 3);
                      n = here_bits + 3;
                      while (bits < n) {
                        if (have === 0) {
                          break inf_leave;
                        }
                        have--;
                        hold += input[next++] << bits;
                        bits += 8;
                      }
                      //===//
                      //--- DROPBITS(here.bits) ---//
                      hold >>>= here_bits;
                      bits -= here_bits;
                      //---//
                      len = 0;
                      copy = 3 + (hold & 0x07); //BITS(3);
                      //--- DROPBITS(3) ---//
                      hold >>>= 3;
                      bits -= 3;
                      //---//
                    } else {
                      //=== NEEDBITS(here.bits + 7);
                      n = here_bits + 7;
                      while (bits < n) {
                        if (have === 0) {
                          break inf_leave;
                        }
                        have--;
                        hold += input[next++] << bits;
                        bits += 8;
                      }
                      //===//
                      //--- DROPBITS(here.bits) ---//
                      hold >>>= here_bits;
                      bits -= here_bits;
                      //---//
                      len = 0;
                      copy = 11 + (hold & 0x7f); //BITS(7);
                      //--- DROPBITS(7) ---//
                      hold >>>= 7;
                      bits -= 7;
                      //---//
                    }
                    if (state.have + copy > state.nlen + state.ndist) {
                      strm.msg = 'invalid bit length repeat';
                      state.mode = BAD$1;
                      break;
                    }
                    while (copy--) {
                      state.lens[state.have++] = len;
                    }
                  }
                }

                /* handle error breaks in while */
                if (state.mode === BAD$1) {
                  break;
                }

                /* check for end-of-block code (better have one) */
                if (state.lens[256] === 0) {
                  strm.msg = 'invalid code -- missing end-of-block';
                  state.mode = BAD$1;
                  break;
                }

                /* build code tables -- note: do not change the lenbits or distbits
                   values here (9 and 6) without reading the comments in inftrees.h
                   concerning the ENOUGH constants, which depend on those values */
                state.lenbits = 9;

                opts = {
                  bits: state.lenbits
                };
                ret = inflate_table(LENS$1, state.lens, 0, state.nlen, state.lencode, 0, state.work, opts);
                // We have separate tables & no pointers. 2 commented lines below not needed.
                // state.next_index = opts.table_index;
                state.lenbits = opts.bits;
                // state.lencode = state.next;

                if (ret) {
                  strm.msg = 'invalid literal/lengths set';
                  state.mode = BAD$1;
                  break;
                }

                state.distbits = 6;
                //state.distcode.copy(state.codes);
                // Switch to use dynamic table
                state.distcode = state.distdyn;
                opts = {
                  bits: state.distbits
                };
                ret = inflate_table(DISTS$1, state.lens, state.nlen, state.ndist, state.distcode, 0, state.work, opts);
                // We have separate tables & no pointers. 2 commented lines below not needed.
                // state.next_index = opts.table_index;
                state.distbits = opts.bits;
                // state.distcode = state.next;

                if (ret) {
                  strm.msg = 'invalid distances set';
                  state.mode = BAD$1;
                  break;
                }
                //Tracev((stderr, 'inflate:       codes ok\n'));
                state.mode = LEN_;
                if (flush === Z_TREES) {
                  break inf_leave;
                }
                /* falls through */
              case LEN_:
                state.mode = LEN;
                /* falls through */
              case LEN:
                if (have >= 6 && left >= 258) {
                  //--- RESTORE() ---
                  strm.next_out = put;
                  strm.avail_out = left;
                  strm.next_in = next;
                  strm.avail_in = have;
                  state.hold = hold;
                  state.bits = bits;
                  //---
                  inflate_fast(strm, _out);
                  //--- LOAD() ---
                  put = strm.next_out;
                  output = strm.output;
                  left = strm.avail_out;
                  next = strm.next_in;
                  input = strm.input;
                  have = strm.avail_in;
                  hold = state.hold;
                  bits = state.bits;
                  //---

                  if (state.mode === TYPE$1) {
                    state.back = -1;
                  }
                  break;
                }
                state.back = 0;
                for (;;) {
                  here = state.lencode[hold & ((1 << state.lenbits) - 1)]; /*BITS(state.lenbits)*/
                  here_bits = here >>> 24;
                  here_op = (here >>> 16) & 0xff;
                  here_val = here & 0xffff;

                  if (here_bits <= bits) {
                    break;
                  }
                  //--- PULLBYTE() ---//
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                  //---//
                }
                if (here_op && (here_op & 0xf0) === 0) {
                  last_bits = here_bits;
                  last_op = here_op;
                  last_val = here_val;
                  for (;;) {
                    here = state.lencode[last_val +
                      ((hold & ((1 << (last_bits + last_op)) - 1)) /*BITS(last.bits + last.op)*/ >> last_bits)];
                    here_bits = here >>> 24;
                    here_op = (here >>> 16) & 0xff;
                    here_val = here & 0xffff;

                    if ((last_bits + here_bits) <= bits) {
                      break;
                    }
                    //--- PULLBYTE() ---//
                    if (have === 0) {
                      break inf_leave;
                    }
                    have--;
                    hold += input[next++] << bits;
                    bits += 8;
                    //---//
                  }
                  //--- DROPBITS(last.bits) ---//
                  hold >>>= last_bits;
                  bits -= last_bits;
                  //---//
                  state.back += last_bits;
                }
                //--- DROPBITS(here.bits) ---//
                hold >>>= here_bits;
                bits -= here_bits;
                //---//
                state.back += here_bits;
                state.length = here_val;
                if (here_op === 0) {
                  //Tracevv((stderr, here.val >= 0x20 && here.val < 0x7f ?
                  //        "inflate:         literal '%c'\n" :
                  //        "inflate:         literal 0x%02x\n", here.val));
                  state.mode = LIT;
                  break;
                }
                if (here_op & 32) {
                  //Tracevv((stderr, "inflate:         end of block\n"));
                  state.back = -1;
                  state.mode = TYPE$1;
                  break;
                }
                if (here_op & 64) {
                  strm.msg = 'invalid literal/length code';
                  state.mode = BAD$1;
                  break;
                }
                state.extra = here_op & 15;
                state.mode = LENEXT;
                /* falls through */
              case LENEXT:
                if (state.extra) {
                  //=== NEEDBITS(state.extra);
                  n = state.extra;
                  while (bits < n) {
                    if (have === 0) {
                      break inf_leave;
                    }
                    have--;
                    hold += input[next++] << bits;
                    bits += 8;
                  }
                  //===//
                  state.length += hold & ((1 << state.extra) - 1) /*BITS(state.extra)*/ ;
                  //--- DROPBITS(state.extra) ---//
                  hold >>>= state.extra;
                  bits -= state.extra;
                  //---//
                  state.back += state.extra;
                }
                //Tracevv((stderr, "inflate:         length %u\n", state.length));
                state.was = state.length;
                state.mode = DIST;
                /* falls through */
              case DIST:
                for (;;) {
                  here = state.distcode[hold & ((1 << state.distbits) - 1)]; /*BITS(state.distbits)*/
                  here_bits = here >>> 24;
                  here_op = (here >>> 16) & 0xff;
                  here_val = here & 0xffff;

                  if ((here_bits) <= bits) {
                    break;
                  }
                  //--- PULLBYTE() ---//
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                  //---//
                }
                if ((here_op & 0xf0) === 0) {
                  last_bits = here_bits;
                  last_op = here_op;
                  last_val = here_val;
                  for (;;) {
                    here = state.distcode[last_val +
                      ((hold & ((1 << (last_bits + last_op)) - 1)) /*BITS(last.bits + last.op)*/ >> last_bits)];
                    here_bits = here >>> 24;
                    here_op = (here >>> 16) & 0xff;
                    here_val = here & 0xffff;

                    if ((last_bits + here_bits) <= bits) {
                      break;
                    }
                    //--- PULLBYTE() ---//
                    if (have === 0) {
                      break inf_leave;
                    }
                    have--;
                    hold += input[next++] << bits;
                    bits += 8;
                    //---//
                  }
                  //--- DROPBITS(last.bits) ---//
                  hold >>>= last_bits;
                  bits -= last_bits;
                  //---//
                  state.back += last_bits;
                }
                //--- DROPBITS(here.bits) ---//
                hold >>>= here_bits;
                bits -= here_bits;
                //---//
                state.back += here_bits;
                if (here_op & 64) {
                  strm.msg = 'invalid distance code';
                  state.mode = BAD$1;
                  break;
                }
                state.offset = here_val;
                state.extra = (here_op) & 15;
                state.mode = DISTEXT;
                /* falls through */
              case DISTEXT:
                if (state.extra) {
                  //=== NEEDBITS(state.extra);
                  n = state.extra;
                  while (bits < n) {
                    if (have === 0) {
                      break inf_leave;
                    }
                    have--;
                    hold += input[next++] << bits;
                    bits += 8;
                  }
                  //===//
                  state.offset += hold & ((1 << state.extra) - 1) /*BITS(state.extra)*/ ;
                  //--- DROPBITS(state.extra) ---//
                  hold >>>= state.extra;
                  bits -= state.extra;
                  //---//
                  state.back += state.extra;
                }
                //#ifdef INFLATE_STRICT
                if (state.offset > state.dmax) {
                  strm.msg = 'invalid distance too far back';
                  state.mode = BAD$1;
                  break;
                }
                //#endif
                //Tracevv((stderr, "inflate:         distance %u\n", state.offset));
                state.mode = MATCH;
                /* falls through */
              case MATCH:
                if (left === 0) {
                  break inf_leave;
                }
                copy = _out - left;
                if (state.offset > copy) { /* copy from window */
                  copy = state.offset - copy;
                  if (copy > state.whave) {
                    if (state.sane) {
                      strm.msg = 'invalid distance too far back';
                      state.mode = BAD$1;
                      break;
                    }
                    // (!) This block is disabled in zlib defailts,
                    // don't enable it for binary compatibility
                    //#ifdef INFLATE_ALLOW_INVALID_DISTANCE_TOOFAR_ARRR
                    //          Trace((stderr, "inflate.c too far\n"));
                    //          copy -= state.whave;
                    //          if (copy > state.length) { copy = state.length; }
                    //          if (copy > left) { copy = left; }
                    //          left -= copy;
                    //          state.length -= copy;
                    //          do {
                    //            output[put++] = 0;
                    //          } while (--copy);
                    //          if (state.length === 0) { state.mode = LEN; }
                    //          break;
                    //#endif
                  }
                  if (copy > state.wnext) {
                    copy -= state.wnext;
                    from = state.wsize - copy;
                  } else {
                    from = state.wnext - copy;
                  }
                  if (copy > state.length) {
                    copy = state.length;
                  }
                  from_source = state.window;
                } else { /* copy from output */
                  from_source = output;
                  from = put - state.offset;
                  copy = state.length;
                }
                if (copy > left) {
                  copy = left;
                }
                left -= copy;
                state.length -= copy;
                do {
                  output[put++] = from_source[from++];
                } while (--copy);
                if (state.length === 0) {
                  state.mode = LEN;
                }
                break;
              case LIT:
                if (left === 0) {
                  break inf_leave;
                }
                output[put++] = state.length;
                left--;
                state.mode = LEN;
                break;
              case CHECK:
                if (state.wrap) {
                  //=== NEEDBITS(32);
                  while (bits < 32) {
                    if (have === 0) {
                      break inf_leave;
                    }
                    have--;
                    // Use '|' insdead of '+' to make sure that result is signed
                    hold |= input[next++] << bits;
                    bits += 8;
                  }
                  //===//
                  _out -= left;
                  strm.total_out += _out;
                  state.total += _out;
                  if (_out) {
                    strm.adler = state.check =
                      /*UPDATE(state.check, put - _out, _out);*/
                      (state.flags ? crc32(state.check, output, _out, put - _out) : adler32(state.check, output, _out, put - _out));

                  }
                  _out = left;
                  // NB: crc32 stored as signed 32-bit int, zswap32 returns signed too
                  if ((state.flags ? hold : zswap32(hold)) !== state.check) {
                    strm.msg = 'incorrect data check';
                    state.mode = BAD$1;
                    break;
                  }
                  //=== INITBITS();
                  hold = 0;
                  bits = 0;
                  //===//
                  //Tracev((stderr, "inflate:   check matches trailer\n"));
                }
                state.mode = LENGTH;
                /* falls through */
              case LENGTH:
                if (state.wrap && state.flags) {
                  //=== NEEDBITS(32);
                  while (bits < 32) {
                    if (have === 0) {
                      break inf_leave;
                    }
                    have--;
                    hold += input[next++] << bits;
                    bits += 8;
                  }
                  //===//
                  if (hold !== (state.total & 0xffffffff)) {
                    strm.msg = 'incorrect length check';
                    state.mode = BAD$1;
                    break;
                  }
                  //=== INITBITS();
                  hold = 0;
                  bits = 0;
                  //===//
                  //Tracev((stderr, "inflate:   length matches trailer\n"));
                }
                state.mode = DONE;
                /* falls through */
              case DONE:
                ret = Z_STREAM_END$1;
                break inf_leave;
              case BAD$1:
                ret = Z_DATA_ERROR$1;
                break inf_leave;
              case MEM:
                return Z_MEM_ERROR;
              case SYNC:
                /* falls through */
              default:
                return Z_STREAM_ERROR$1;
              }
            }

          // inf_leave <- here is real place for "goto inf_leave", emulated via "break inf_leave"

          /*
             Return from inflate(), updating the total counts and the check value.
             If there was no progress during the inflate() call, return a buffer
             error.  Call updatewindow() to create and/or update the window state.
             Note: a memory error from inflate() is non-recoverable.
           */

          //--- RESTORE() ---
          strm.next_out = put;
          strm.avail_out = left;
          strm.next_in = next;
          strm.avail_in = have;
          state.hold = hold;
          state.bits = bits;
          //---

          if (state.wsize || (_out !== strm.avail_out && state.mode < BAD$1 &&
              (state.mode < CHECK || flush !== Z_FINISH$1))) {
            if (updatewindow(strm, strm.output, strm.next_out, _out - strm.avail_out)) ;
          }
          _in -= strm.avail_in;
          _out -= strm.avail_out;
          strm.total_in += _in;
          strm.total_out += _out;
          state.total += _out;
          if (state.wrap && _out) {
            strm.adler = state.check = /*UPDATE(state.check, strm.next_out - _out, _out);*/
              (state.flags ? crc32(state.check, output, _out, strm.next_out - _out) : adler32(state.check, output, _out, strm.next_out - _out));
          }
          strm.data_type = state.bits + (state.last ? 64 : 0) +
            (state.mode === TYPE$1 ? 128 : 0) +
            (state.mode === LEN_ || state.mode === COPY_ ? 256 : 0);
          if (((_in === 0 && _out === 0) || flush === Z_FINISH$1) && ret === Z_OK$1) {
            ret = Z_BUF_ERROR$1;
          }
          return ret;
        }

        function inflateEnd(strm) {

          if (!strm || !strm.state /*|| strm->zfree == (free_func)0*/ ) {
            return Z_STREAM_ERROR$1;
          }

          var state = strm.state;
          if (state.window) {
            state.window = null;
          }
          strm.state = null;
          return Z_OK$1;
        }

        /* Not implemented
        exports.inflateCopy = inflateCopy;
        exports.inflateGetDictionary = inflateGetDictionary;
        exports.inflateMark = inflateMark;
        exports.inflatePrime = inflatePrime;
        exports.inflateSync = inflateSync;
        exports.inflateSyncPoint = inflateSyncPoint;
        exports.inflateUndermine = inflateUndermine;
        */

        // import constants from './constants';


        // zlib modes
        var NONE = 0;
        var DEFLATE = 1;
        var INFLATE = 2;
        var GZIP = 3;
        var GUNZIP = 4;
        var DEFLATERAW = 5;
        var INFLATERAW = 6;
        var UNZIP = 7;
        var Z_NO_FLUSH$1=         0,
          Z_PARTIAL_FLUSH$1=    1,
          Z_SYNC_FLUSH=    2,
          Z_FULL_FLUSH$1=       3,
          Z_FINISH$2=       4,
          Z_BLOCK$2=           5,
          Z_TREES$1=            6,

          /* Return codes for the compression/decompression functions. Negative values
          * are errors, positive values are used for special but normal events.
          */
          Z_OK$2=               0,
          Z_STREAM_END$2=       1,
          Z_NEED_DICT$1=      2,
          Z_ERRNO=       -1,
          Z_STREAM_ERROR$2=   -2,
          Z_DATA_ERROR$2=    -3,
          //Z_MEM_ERROR:     -4,
          Z_BUF_ERROR$2=    -5,
          //Z_VERSION_ERROR: -6,

          /* compression levels */
          Z_NO_COMPRESSION=         0,
          Z_BEST_SPEED=             1,
          Z_BEST_COMPRESSION=       9,
          Z_DEFAULT_COMPRESSION$1=   -1,


          Z_FILTERED$1=               1,
          Z_HUFFMAN_ONLY$1=           2,
          Z_RLE$1=                    3,
          Z_FIXED$2=                  4,
          Z_DEFAULT_STRATEGY=       0,

          /* Possible values of the data_type field (though see inflate()) */
          Z_BINARY$1=                 0,
          Z_TEXT$1=                   1,
          //Z_ASCII:                1, // = Z_TEXT (deprecated)
          Z_UNKNOWN$2=                2,

          /* The deflate compression method */
          Z_DEFLATED$2=               8;
        function Zlib(mode) {
          if (mode < DEFLATE || mode > UNZIP)
            throw new TypeError('Bad argument');

          this.mode = mode;
          this.init_done = false;
          this.write_in_progress = false;
          this.pending_close = false;
          this.windowBits = 0;
          this.level = 0;
          this.memLevel = 0;
          this.strategy = 0;
          this.dictionary = null;
        }

        Zlib.prototype.init = function(windowBits, level, memLevel, strategy, dictionary) {
          this.windowBits = windowBits;
          this.level = level;
          this.memLevel = memLevel;
          this.strategy = strategy;
          // dictionary not supported.

          if (this.mode === GZIP || this.mode === GUNZIP)
            this.windowBits += 16;

          if (this.mode === UNZIP)
            this.windowBits += 32;

          if (this.mode === DEFLATERAW || this.mode === INFLATERAW)
            this.windowBits = -this.windowBits;

          this.strm = new ZStream();
          var status;
          switch (this.mode) {
          case DEFLATE:
          case GZIP:
          case DEFLATERAW:
            status = deflateInit2(
              this.strm,
              this.level,
              Z_DEFLATED$2,
              this.windowBits,
              this.memLevel,
              this.strategy
            );
            break;
          case INFLATE:
          case GUNZIP:
          case INFLATERAW:
          case UNZIP:
            status  = inflateInit2(
              this.strm,
              this.windowBits
            );
            break;
          default:
            throw new Error('Unknown mode ' + this.mode);
          }

          if (status !== Z_OK$2) {
            this._error(status);
            return;
          }

          this.write_in_progress = false;
          this.init_done = true;
        };

        Zlib.prototype.params = function() {
          throw new Error('deflateParams Not supported');
        };

        Zlib.prototype._writeCheck = function() {
          if (!this.init_done)
            throw new Error('write before init');

          if (this.mode === NONE)
            throw new Error('already finalized');

          if (this.write_in_progress)
            throw new Error('write already in progress');

          if (this.pending_close)
            throw new Error('close is pending');
        };

        Zlib.prototype.write = function(flush, input, in_off, in_len, out, out_off, out_len) {
          this._writeCheck();
          this.write_in_progress = true;

          var self = this;
          nextTick$1(function() {
            self.write_in_progress = false;
            var res = self._write(flush, input, in_off, in_len, out, out_off, out_len);
            self.callback(res[0], res[1]);

            if (self.pending_close)
              self.close();
          });

          return this;
        };

        // set method for Node buffers, used by pako
        function bufferSet(data, offset) {
          for (var i = 0; i < data.length; i++) {
            this[offset + i] = data[i];
          }
        }

        Zlib.prototype.writeSync = function(flush, input, in_off, in_len, out, out_off, out_len) {
          this._writeCheck();
          return this._write(flush, input, in_off, in_len, out, out_off, out_len);
        };

        Zlib.prototype._write = function(flush, input, in_off, in_len, out, out_off, out_len) {
          this.write_in_progress = true;

          if (flush !== Z_NO_FLUSH$1 &&
              flush !== Z_PARTIAL_FLUSH$1 &&
              flush !== Z_SYNC_FLUSH &&
              flush !== Z_FULL_FLUSH$1 &&
              flush !== Z_FINISH$2 &&
              flush !== Z_BLOCK$2) {
            throw new Error('Invalid flush value');
          }

          if (input == null) {
            input = new Buffer(0);
            in_len = 0;
            in_off = 0;
          }

          if (out._set)
            out.set = out._set;
          else
            out.set = bufferSet;

          var strm = this.strm;
          strm.avail_in = in_len;
          strm.input = input;
          strm.next_in = in_off;
          strm.avail_out = out_len;
          strm.output = out;
          strm.next_out = out_off;
          var status;
          switch (this.mode) {
          case DEFLATE:
          case GZIP:
          case DEFLATERAW:
            status = deflate(strm, flush);
            break;
          case UNZIP:
          case INFLATE:
          case GUNZIP:
          case INFLATERAW:
            status = inflate(strm, flush);
            break;
          default:
            throw new Error('Unknown mode ' + this.mode);
          }

          if (status !== Z_STREAM_END$2 && status !== Z_OK$2) {
            this._error(status);
          }

          this.write_in_progress = false;
          return [strm.avail_in, strm.avail_out];
        };

        Zlib.prototype.close = function() {
          if (this.write_in_progress) {
            this.pending_close = true;
            return;
          }

          this.pending_close = false;

          if (this.mode === DEFLATE || this.mode === GZIP || this.mode === DEFLATERAW) {
            deflateEnd(this.strm);
          } else {
            inflateEnd(this.strm);
          }

          this.mode = NONE;
        };
        var status;
        Zlib.prototype.reset = function() {
          switch (this.mode) {
          case DEFLATE:
          case DEFLATERAW:
            status = deflateReset(this.strm);
            break;
          case INFLATE:
          case INFLATERAW:
            status = inflateReset(this.strm);
            break;
          }

          if (status !== Z_OK$2) {
            this._error(status);
          }
        };

        Zlib.prototype._error = function(status) {
          this.onerror(msg[status] + ': ' + this.strm.msg, status);

          this.write_in_progress = false;
          if (this.pending_close)
            this.close();
        };

        var _binding = /*#__PURE__*/Object.freeze({
            __proto__: null,
            NONE: NONE,
            DEFLATE: DEFLATE,
            INFLATE: INFLATE,
            GZIP: GZIP,
            GUNZIP: GUNZIP,
            DEFLATERAW: DEFLATERAW,
            INFLATERAW: INFLATERAW,
            UNZIP: UNZIP,
            Z_NO_FLUSH: Z_NO_FLUSH$1,
            Z_PARTIAL_FLUSH: Z_PARTIAL_FLUSH$1,
            Z_SYNC_FLUSH: Z_SYNC_FLUSH,
            Z_FULL_FLUSH: Z_FULL_FLUSH$1,
            Z_FINISH: Z_FINISH$2,
            Z_BLOCK: Z_BLOCK$2,
            Z_TREES: Z_TREES$1,
            Z_OK: Z_OK$2,
            Z_STREAM_END: Z_STREAM_END$2,
            Z_NEED_DICT: Z_NEED_DICT$1,
            Z_ERRNO: Z_ERRNO,
            Z_STREAM_ERROR: Z_STREAM_ERROR$2,
            Z_DATA_ERROR: Z_DATA_ERROR$2,
            Z_BUF_ERROR: Z_BUF_ERROR$2,
            Z_NO_COMPRESSION: Z_NO_COMPRESSION,
            Z_BEST_SPEED: Z_BEST_SPEED,
            Z_BEST_COMPRESSION: Z_BEST_COMPRESSION,
            Z_DEFAULT_COMPRESSION: Z_DEFAULT_COMPRESSION$1,
            Z_FILTERED: Z_FILTERED$1,
            Z_HUFFMAN_ONLY: Z_HUFFMAN_ONLY$1,
            Z_RLE: Z_RLE$1,
            Z_FIXED: Z_FIXED$2,
            Z_DEFAULT_STRATEGY: Z_DEFAULT_STRATEGY,
            Z_BINARY: Z_BINARY$1,
            Z_TEXT: Z_TEXT$1,
            Z_UNKNOWN: Z_UNKNOWN$2,
            Z_DEFLATED: Z_DEFLATED$2,
            Zlib: Zlib
        });

        function assert (a, msg) {
          if (!a) {
            throw new Error(msg);
          }
        }
        var binding = {};
        Object.keys(_binding).forEach(function (key) {
          binding[key] = _binding[key];
        });
        // zlib doesn't provide these, so kludge them in following the same
        // const naming scheme zlib uses.
        binding.Z_MIN_WINDOWBITS = 8;
        binding.Z_MAX_WINDOWBITS = 15;
        binding.Z_DEFAULT_WINDOWBITS = 15;

        // fewer than 64 bytes per chunk is stupid.
        // technically it could work with as few as 8, but even 64 bytes
        // is absurdly low.  Usually a MB or more is best.
        binding.Z_MIN_CHUNK = 64;
        binding.Z_MAX_CHUNK = Infinity;
        binding.Z_DEFAULT_CHUNK = (16 * 1024);

        binding.Z_MIN_MEMLEVEL = 1;
        binding.Z_MAX_MEMLEVEL = 9;
        binding.Z_DEFAULT_MEMLEVEL = 8;

        binding.Z_MIN_LEVEL = -1;
        binding.Z_MAX_LEVEL = 9;
        binding.Z_DEFAULT_LEVEL = binding.Z_DEFAULT_COMPRESSION;


        // translation table for return codes.
        var codes = {
          Z_OK: binding.Z_OK,
          Z_STREAM_END: binding.Z_STREAM_END,
          Z_NEED_DICT: binding.Z_NEED_DICT,
          Z_ERRNO: binding.Z_ERRNO,
          Z_STREAM_ERROR: binding.Z_STREAM_ERROR,
          Z_DATA_ERROR: binding.Z_DATA_ERROR,
          Z_MEM_ERROR: binding.Z_MEM_ERROR,
          Z_BUF_ERROR: binding.Z_BUF_ERROR,
          Z_VERSION_ERROR: binding.Z_VERSION_ERROR
        };

        Object.keys(codes).forEach(function(k) {
          codes[codes[k]] = k;
        });

        function createDeflate(o) {
          return new Deflate(o);
        }

        function createInflate(o) {
          return new Inflate(o);
        }

        function createDeflateRaw(o) {
          return new DeflateRaw(o);
        }

        function createInflateRaw(o) {
          return new InflateRaw(o);
        }

        function createGzip(o) {
          return new Gzip(o);
        }

        function createGunzip(o) {
          return new Gunzip(o);
        }

        function createUnzip(o) {
          return new Unzip(o);
        }


        // Convenience methods.
        // compress/decompress a string or buffer in one step.
        function deflate$1(buffer, opts, callback) {
          if (typeof opts === 'function') {
            callback = opts;
            opts = {};
          }
          return zlibBuffer(new Deflate(opts), buffer, callback);
        }

        function deflateSync(buffer, opts) {
          return zlibBufferSync(new Deflate(opts), buffer);
        }

        function gzip(buffer, opts, callback) {
          if (typeof opts === 'function') {
            callback = opts;
            opts = {};
          }
          return zlibBuffer(new Gzip(opts), buffer, callback);
        }

        function gzipSync(buffer, opts) {
          return zlibBufferSync(new Gzip(opts), buffer);
        }

        function deflateRaw(buffer, opts, callback) {
          if (typeof opts === 'function') {
            callback = opts;
            opts = {};
          }
          return zlibBuffer(new DeflateRaw(opts), buffer, callback);
        }

        function deflateRawSync(buffer, opts) {
          return zlibBufferSync(new DeflateRaw(opts), buffer);
        }

        function unzip(buffer, opts, callback) {
          if (typeof opts === 'function') {
            callback = opts;
            opts = {};
          }
          return zlibBuffer(new Unzip(opts), buffer, callback);
        }

        function unzipSync(buffer, opts) {
          return zlibBufferSync(new Unzip(opts), buffer);
        }

        function inflate$1(buffer, opts, callback) {
          if (typeof opts === 'function') {
            callback = opts;
            opts = {};
          }
          return zlibBuffer(new Inflate(opts), buffer, callback);
        }

        function inflateSync(buffer, opts) {
          return zlibBufferSync(new Inflate(opts), buffer);
        }

        function gunzip(buffer, opts, callback) {
          if (typeof opts === 'function') {
            callback = opts;
            opts = {};
          }
          return zlibBuffer(new Gunzip(opts), buffer, callback);
        }

        function gunzipSync(buffer, opts) {
          return zlibBufferSync(new Gunzip(opts), buffer);
        }

        function inflateRaw(buffer, opts, callback) {
          if (typeof opts === 'function') {
            callback = opts;
            opts = {};
          }
          return zlibBuffer(new InflateRaw(opts), buffer, callback);
        }

        function inflateRawSync(buffer, opts) {
          return zlibBufferSync(new InflateRaw(opts), buffer);
        }

        function zlibBuffer(engine, buffer, callback) {
          var buffers = [];
          var nread = 0;

          engine.on('error', onError);
          engine.on('end', onEnd);

          engine.end(buffer);
          flow();

          function flow() {
            var chunk;
            while (null !== (chunk = engine.read())) {
              buffers.push(chunk);
              nread += chunk.length;
            }
            engine.once('readable', flow);
          }

          function onError(err) {
            engine.removeListener('end', onEnd);
            engine.removeListener('readable', flow);
            callback(err);
          }

          function onEnd() {
            var buf = Buffer.concat(buffers, nread);
            buffers = [];
            callback(null, buf);
            engine.close();
          }
        }

        function zlibBufferSync(engine, buffer) {
          if (typeof buffer === 'string')
            buffer = new Buffer(buffer);
          if (!isBuffer(buffer))
            throw new TypeError('Not a string or buffer');

          var flushFlag = binding.Z_FINISH;

          return engine._processChunk(buffer, flushFlag);
        }

        // generic zlib
        // minimal 2-byte header
        function Deflate(opts) {
          if (!(this instanceof Deflate)) return new Deflate(opts);
          Zlib$1.call(this, opts, binding.DEFLATE);
        }

        function Inflate(opts) {
          if (!(this instanceof Inflate)) return new Inflate(opts);
          Zlib$1.call(this, opts, binding.INFLATE);
        }



        // gzip - bigger header, same deflate compression
        function Gzip(opts) {
          if (!(this instanceof Gzip)) return new Gzip(opts);
          Zlib$1.call(this, opts, binding.GZIP);
        }

        function Gunzip(opts) {
          if (!(this instanceof Gunzip)) return new Gunzip(opts);
          Zlib$1.call(this, opts, binding.GUNZIP);
        }



        // raw - no header
        function DeflateRaw(opts) {
          if (!(this instanceof DeflateRaw)) return new DeflateRaw(opts);
          Zlib$1.call(this, opts, binding.DEFLATERAW);
        }

        function InflateRaw(opts) {
          if (!(this instanceof InflateRaw)) return new InflateRaw(opts);
          Zlib$1.call(this, opts, binding.INFLATERAW);
        }


        // auto-detect header.
        function Unzip(opts) {
          if (!(this instanceof Unzip)) return new Unzip(opts);
          Zlib$1.call(this, opts, binding.UNZIP);
        }


        // the Zlib class they all inherit from
        // This thing manages the queue of requests, and returns
        // true or false if there is anything in the queue when
        // you call the .write() method.

        function Zlib$1(opts, mode) {
          this._opts = opts = opts || {};
          this._chunkSize = opts.chunkSize || binding.Z_DEFAULT_CHUNK;

          Transform.call(this, opts);

          if (opts.flush) {
            if (opts.flush !== binding.Z_NO_FLUSH &&
                opts.flush !== binding.Z_PARTIAL_FLUSH &&
                opts.flush !== binding.Z_SYNC_FLUSH &&
                opts.flush !== binding.Z_FULL_FLUSH &&
                opts.flush !== binding.Z_FINISH &&
                opts.flush !== binding.Z_BLOCK) {
              throw new Error('Invalid flush flag: ' + opts.flush);
            }
          }
          this._flushFlag = opts.flush || binding.Z_NO_FLUSH;

          if (opts.chunkSize) {
            if (opts.chunkSize < binding.Z_MIN_CHUNK ||
                opts.chunkSize > binding.Z_MAX_CHUNK) {
              throw new Error('Invalid chunk size: ' + opts.chunkSize);
            }
          }

          if (opts.windowBits) {
            if (opts.windowBits < binding.Z_MIN_WINDOWBITS ||
                opts.windowBits > binding.Z_MAX_WINDOWBITS) {
              throw new Error('Invalid windowBits: ' + opts.windowBits);
            }
          }

          if (opts.level) {
            if (opts.level < binding.Z_MIN_LEVEL ||
                opts.level > binding.Z_MAX_LEVEL) {
              throw new Error('Invalid compression level: ' + opts.level);
            }
          }

          if (opts.memLevel) {
            if (opts.memLevel < binding.Z_MIN_MEMLEVEL ||
                opts.memLevel > binding.Z_MAX_MEMLEVEL) {
              throw new Error('Invalid memLevel: ' + opts.memLevel);
            }
          }

          if (opts.strategy) {
            if (opts.strategy != binding.Z_FILTERED &&
                opts.strategy != binding.Z_HUFFMAN_ONLY &&
                opts.strategy != binding.Z_RLE &&
                opts.strategy != binding.Z_FIXED &&
                opts.strategy != binding.Z_DEFAULT_STRATEGY) {
              throw new Error('Invalid strategy: ' + opts.strategy);
            }
          }

          if (opts.dictionary) {
            if (!isBuffer(opts.dictionary)) {
              throw new Error('Invalid dictionary: it should be a Buffer instance');
            }
          }

          this._binding = new binding.Zlib(mode);

          var self = this;
          this._hadError = false;
          this._binding.onerror = function(message, errno) {
            // there is no way to cleanly recover.
            // continuing only obscures problems.
            self._binding = null;
            self._hadError = true;

            var error = new Error(message);
            error.errno = errno;
            error.code = binding.codes[errno];
            self.emit('error', error);
          };

          var level = binding.Z_DEFAULT_COMPRESSION;
          if (typeof opts.level === 'number') level = opts.level;

          var strategy = binding.Z_DEFAULT_STRATEGY;
          if (typeof opts.strategy === 'number') strategy = opts.strategy;

          this._binding.init(opts.windowBits || binding.Z_DEFAULT_WINDOWBITS,
                             level,
                             opts.memLevel || binding.Z_DEFAULT_MEMLEVEL,
                             strategy,
                             opts.dictionary);

          this._buffer = new Buffer(this._chunkSize);
          this._offset = 0;
          this._closed = false;
          this._level = level;
          this._strategy = strategy;

          this.once('end', this.close);
        }

        inherits$1(Zlib$1, Transform);

        Zlib$1.prototype.params = function(level, strategy, callback) {
          if (level < binding.Z_MIN_LEVEL ||
              level > binding.Z_MAX_LEVEL) {
            throw new RangeError('Invalid compression level: ' + level);
          }
          if (strategy != binding.Z_FILTERED &&
              strategy != binding.Z_HUFFMAN_ONLY &&
              strategy != binding.Z_RLE &&
              strategy != binding.Z_FIXED &&
              strategy != binding.Z_DEFAULT_STRATEGY) {
            throw new TypeError('Invalid strategy: ' + strategy);
          }

          if (this._level !== level || this._strategy !== strategy) {
            var self = this;
            this.flush(binding.Z_SYNC_FLUSH, function() {
              self._binding.params(level, strategy);
              if (!self._hadError) {
                self._level = level;
                self._strategy = strategy;
                if (callback) callback();
              }
            });
          } else {
            nextTick$1(callback);
          }
        };

        Zlib$1.prototype.reset = function() {
          return this._binding.reset();
        };

        // This is the _flush function called by the transform class,
        // internally, when the last chunk has been written.
        Zlib$1.prototype._flush = function(callback) {
          this._transform(new Buffer(0), '', callback);
        };

        Zlib$1.prototype.flush = function(kind, callback) {
          var ws = this._writableState;

          if (typeof kind === 'function' || (kind === void 0 && !callback)) {
            callback = kind;
            kind = binding.Z_FULL_FLUSH;
          }

          if (ws.ended) {
            if (callback)
              nextTick$1(callback);
          } else if (ws.ending) {
            if (callback)
              this.once('end', callback);
          } else if (ws.needDrain) {
            var self = this;
            this.once('drain', function() {
              self.flush(callback);
            });
          } else {
            this._flushFlag = kind;
            this.write(new Buffer(0), '', callback);
          }
        };

        Zlib$1.prototype.close = function(callback) {
          if (callback)
            nextTick$1(callback);

          if (this._closed)
            return;

          this._closed = true;

          this._binding.close();

          var self = this;
          nextTick$1(function() {
            self.emit('close');
          });
        };

        Zlib$1.prototype._transform = function(chunk, encoding, cb) {
          var flushFlag;
          var ws = this._writableState;
          var ending = ws.ending || ws.ended;
          var last = ending && (!chunk || ws.length === chunk.length);

          if (!chunk === null && !isBuffer(chunk))
            return cb(new Error('invalid input'));

          // If it's the last chunk, or a final flush, we use the Z_FINISH flush flag.
          // If it's explicitly flushing at some other time, then we use
          // Z_FULL_FLUSH. Otherwise, use Z_NO_FLUSH for maximum compression
          // goodness.
          if (last)
            flushFlag = binding.Z_FINISH;
          else {
            flushFlag = this._flushFlag;
            // once we've flushed the last of the queue, stop flushing and
            // go back to the normal behavior.
            if (chunk.length >= ws.length) {
              this._flushFlag = this._opts.flush || binding.Z_NO_FLUSH;
            }
          }

          this._processChunk(chunk, flushFlag, cb);
        };

        Zlib$1.prototype._processChunk = function(chunk, flushFlag, cb) {
          var availInBefore = chunk && chunk.length;
          var availOutBefore = this._chunkSize - this._offset;
          var inOff = 0;

          var self = this;

          var async = typeof cb === 'function';

          if (!async) {
            var buffers = [];
            var nread = 0;

            var error;
            this.on('error', function(er) {
              error = er;
            });

            do {
              var res = this._binding.writeSync(flushFlag,
                                                chunk, // in
                                                inOff, // in_off
                                                availInBefore, // in_len
                                                this._buffer, // out
                                                this._offset, //out_off
                                                availOutBefore); // out_len
            } while (!this._hadError && callback(res[0], res[1]));

            if (this._hadError) {
              throw error;
            }

            var buf = Buffer.concat(buffers, nread);
            this.close();

            return buf;
          }

          var req = this._binding.write(flushFlag,
                                        chunk, // in
                                        inOff, // in_off
                                        availInBefore, // in_len
                                        this._buffer, // out
                                        this._offset, //out_off
                                        availOutBefore); // out_len

          req.buffer = chunk;
          req.callback = callback;

          function callback(availInAfter, availOutAfter) {
            if (self._hadError)
              return;

            var have = availOutBefore - availOutAfter;
            assert(have >= 0, 'have should not go down');

            if (have > 0) {
              var out = self._buffer.slice(self._offset, self._offset + have);
              self._offset += have;
              // serve some output to the consumer.
              if (async) {
                self.push(out);
              } else {
                buffers.push(out);
                nread += out.length;
              }
            }

            // exhausted the output buffer, or used all the input create a new one.
            if (availOutAfter === 0 || self._offset >= self._chunkSize) {
              availOutBefore = self._chunkSize;
              self._offset = 0;
              self._buffer = new Buffer(self._chunkSize);
            }

            if (availOutAfter === 0) {
              // Not actually done.  Need to reprocess.
              // Also, update the availInBefore to the availInAfter value,
              // so that if we have to hit it a third (fourth, etc.) time,
              // it'll have the correct byte counts.
              inOff += (availInBefore - availInAfter);
              availInBefore = availInAfter;

              if (!async)
                return true;

              var newReq = self._binding.write(flushFlag,
                                               chunk,
                                               inOff,
                                               availInBefore,
                                               self._buffer,
                                               self._offset,
                                               self._chunkSize);
              newReq.callback = callback; // this same function
              newReq.buffer = chunk;
              return;
            }

            if (!async)
              return false;

            // finished with the chunk.
            cb();
          }
        };

        inherits$1(Deflate, Zlib$1);
        inherits$1(Inflate, Zlib$1);
        inherits$1(Gzip, Zlib$1);
        inherits$1(Gunzip, Zlib$1);
        inherits$1(DeflateRaw, Zlib$1);
        inherits$1(InflateRaw, Zlib$1);
        inherits$1(Unzip, Zlib$1);
        var zlib = {
          codes: codes,
          createDeflate: createDeflate,
          createInflate: createInflate,
          createDeflateRaw: createDeflateRaw,
          createInflateRaw: createInflateRaw,
          createGzip: createGzip,
          createGunzip: createGunzip,
          createUnzip: createUnzip,
          deflate: deflate$1,
          deflateSync: deflateSync,
          gzip: gzip,
          gzipSync: gzipSync,
          deflateRaw: deflateRaw,
          deflateRawSync: deflateRawSync,
          unzip: unzip,
          unzipSync: unzipSync,
          inflate: inflate$1,
          inflateSync: inflateSync,
          gunzip: gunzip,
          gunzipSync: gunzipSync,
          inflateRaw: inflateRaw,
          inflateRawSync: inflateRawSync,
          Deflate: Deflate,
          Inflate: Inflate,
          Gzip: Gzip,
          Gunzip: Gunzip,
          DeflateRaw: DeflateRaw,
          InflateRaw: InflateRaw,
          Unzip: Unzip,
          Zlib: Zlib$1
        };

        class PDFReference extends PDFAbstractReference {
          constructor(document, id, data = {}) {
            super();
            this.document = document;
            this.id = id;
            this.data = data;
            this.gen = 0;
            this.compress = this.document.compress && !this.data.Filter;
            this.uncompressedLength = 0;
            this.buffer = [];
          }

          write(chunk) {
            if (!isBuffer(chunk)) {
              chunk = new Buffer(chunk + '\n', 'binary');
            }

            this.uncompressedLength += chunk.length;
            if (this.data.Length == null) {
              this.data.Length = 0;
            }
            this.buffer.push(chunk);
            this.data.Length += chunk.length;
            if (this.compress) {
              return (this.data.Filter = 'FlateDecode');
            }
          }

          end(chunk) {
            if (chunk) {
              this.write(chunk);
            }
            return this.finalize();
          }

          finalize() {
            this.offset = this.document._offset;

            const encryptFn = this.document._security
              ? this.document._security.getEncryptFn(this.id, this.gen)
              : null;

            if (this.buffer.length) {
              this.buffer = Buffer.concat(this.buffer);
              if (this.compress) {
                this.buffer = zlib.deflateSync(this.buffer);
              }

              if (encryptFn) {
                this.buffer = encryptFn(this.buffer);
              }

              this.data.Length = this.buffer.length;
            }

            this.document._write(`${this.id} ${this.gen} obj`);
            this.document._write(PDFObject.convert(this.data, encryptFn));

            if (this.buffer.length) {
              this.document._write('stream');
              this.document._write(this.buffer);

              this.buffer = []; // free up memory
              this.document._write('\nendstream');
            }

            this.document._write('endobj');
            this.document._refEnd(this);
          }
          toString() {
            return `${this.id} ${this.gen} R`;
          }
        }

        /*
        PDFPage - represents a single page in the PDF document
        By Devon Govett
        */

        const DEFAULT_MARGINS = {
          top: 72,
          left: 72,
          bottom: 72,
          right: 72
        };

        const SIZES = {
          '4A0': [4767.87, 6740.79],
          '2A0': [3370.39, 4767.87],
          A0: [2383.94, 3370.39],
          A1: [1683.78, 2383.94],
          A2: [1190.55, 1683.78],
          A3: [841.89, 1190.55],
          A4: [595.28, 841.89],
          A5: [419.53, 595.28],
          A6: [297.64, 419.53],
          A7: [209.76, 297.64],
          A8: [147.4, 209.76],
          A9: [104.88, 147.4],
          A10: [73.7, 104.88],
          B0: [2834.65, 4008.19],
          B1: [2004.09, 2834.65],
          B2: [1417.32, 2004.09],
          B3: [1000.63, 1417.32],
          B4: [708.66, 1000.63],
          B5: [498.9, 708.66],
          B6: [354.33, 498.9],
          B7: [249.45, 354.33],
          B8: [175.75, 249.45],
          B9: [124.72, 175.75],
          B10: [87.87, 124.72],
          C0: [2599.37, 3676.54],
          C1: [1836.85, 2599.37],
          C2: [1298.27, 1836.85],
          C3: [918.43, 1298.27],
          C4: [649.13, 918.43],
          C5: [459.21, 649.13],
          C6: [323.15, 459.21],
          C7: [229.61, 323.15],
          C8: [161.57, 229.61],
          C9: [113.39, 161.57],
          C10: [79.37, 113.39],
          RA0: [2437.8, 3458.27],
          RA1: [1729.13, 2437.8],
          RA2: [1218.9, 1729.13],
          RA3: [864.57, 1218.9],
          RA4: [609.45, 864.57],
          SRA0: [2551.18, 3628.35],
          SRA1: [1814.17, 2551.18],
          SRA2: [1275.59, 1814.17],
          SRA3: [907.09, 1275.59],
          SRA4: [637.8, 907.09],
          EXECUTIVE: [521.86, 756.0],
          FOLIO: [612.0, 936.0],
          LEGAL: [612.0, 1008.0],
          LETTER: [612.0, 792.0],
          TABLOID: [792.0, 1224.0]
        };

        class PDFPage {
          constructor(document, options = {}) {
            this.document = document;
            this.size = options.size || 'letter';
            this.layout = options.layout || 'portrait';

            // process margins
            if (typeof options.margin === 'number') {
              this.margins = {
                top: options.margin,
                left: options.margin,
                bottom: options.margin,
                right: options.margin
              };

              // default to 1 inch margins
            } else {
              this.margins = options.margins || DEFAULT_MARGINS;
            }

            // calculate page dimensions
            const dimensions = Array.isArray(this.size)
              ? this.size
              : SIZES[this.size.toUpperCase()];
            this.width = dimensions[this.layout === 'portrait' ? 0 : 1];
            this.height = dimensions[this.layout === 'portrait' ? 1 : 0];

            this.content = this.document.ref();

            // Initialize the Font, XObject, and ExtGState dictionaries
            this.resources = this.document.ref({
              ProcSet: ['PDF', 'Text', 'ImageB', 'ImageC', 'ImageI']
            });

            // The page dictionary
            this.dictionary = this.document.ref({
              Type: 'Page',
              Parent: this.document._root.data.Pages,
              MediaBox: [0, 0, this.width, this.height],
              Contents: this.content,
              Resources: this.resources
            });
          }

          // Lazily create these dictionaries
          get fonts() {
            const data = this.resources.data;
            return data.Font != null ? data.Font : (data.Font = {});
          }

          get xobjects() {
            const data = this.resources.data;
            return data.XObject != null ? data.XObject : (data.XObject = {});
          }

          get ext_gstates() {
            const data = this.resources.data;
            return data.ExtGState != null ? data.ExtGState : (data.ExtGState = {});
          }

          get patterns() {
            const data = this.resources.data;
            return data.Pattern != null ? data.Pattern : (data.Pattern = {});
          }

          get annotations() {
            const data = this.dictionary.data;
            return data.Annots != null ? data.Annots : (data.Annots = []);
          }

          maxY() {
            return this.height - this.margins.bottom;
          }

          write(chunk) {
            return this.content.write(chunk);
          }

          end() {
            this.dictionary.end();
            this.resources.end();
            return this.content.end();
          }
        }

        var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global$1 !== 'undefined' ? global$1 : typeof self !== 'undefined' ? self : {};

        function createCommonjsModule(fn, module) {
        	return module = { exports: {} }, fn(module, module.exports), module.exports;
        }

        var core = createCommonjsModule(function (module, exports) {
        (function (root, factory) {
        	{
        		// CommonJS
        		module.exports = exports = factory();
        	}
        }(commonjsGlobal, function () {

        	/**
        	 * CryptoJS core components.
        	 */
        	var CryptoJS = CryptoJS || (function (Math, undefined$1) {
        	    /*
        	     * Local polyfil of Object.create
        	     */
        	    var create = Object.create || (function () {
        	        function F() {}
        	        return function (obj) {
        	            var subtype;

        	            F.prototype = obj;

        	            subtype = new F();

        	            F.prototype = null;

        	            return subtype;
        	        };
        	    }());

        	    /**
        	     * CryptoJS namespace.
        	     */
        	    var C = {};

        	    /**
        	     * Library namespace.
        	     */
        	    var C_lib = C.lib = {};

        	    /**
        	     * Base object for prototypal inheritance.
        	     */
        	    var Base = C_lib.Base = (function () {


        	        return {
        	            /**
        	             * Creates a new object that inherits from this object.
        	             *
        	             * @param {Object} overrides Properties to copy into the new object.
        	             *
        	             * @return {Object} The new object.
        	             *
        	             * @static
        	             *
        	             * @example
        	             *
        	             *     var MyType = CryptoJS.lib.Base.extend({
        	             *         field: 'value',
        	             *
        	             *         method: function () {
        	             *         }
        	             *     });
        	             */
        	            extend: function (overrides) {
        	                // Spawn
        	                var subtype = create(this);

        	                // Augment
        	                if (overrides) {
        	                    subtype.mixIn(overrides);
        	                }

        	                // Create default initializer
        	                if (!subtype.hasOwnProperty('init') || this.init === subtype.init) {
        	                    subtype.init = function () {
        	                        subtype.$super.init.apply(this, arguments);
        	                    };
        	                }

        	                // Initializer's prototype is the subtype object
        	                subtype.init.prototype = subtype;

        	                // Reference supertype
        	                subtype.$super = this;

        	                return subtype;
        	            },

        	            /**
        	             * Extends this object and runs the init method.
        	             * Arguments to create() will be passed to init().
        	             *
        	             * @return {Object} The new object.
        	             *
        	             * @static
        	             *
        	             * @example
        	             *
        	             *     var instance = MyType.create();
        	             */
        	            create: function () {
        	                var instance = this.extend();
        	                instance.init.apply(instance, arguments);

        	                return instance;
        	            },

        	            /**
        	             * Initializes a newly created object.
        	             * Override this method to add some logic when your objects are created.
        	             *
        	             * @example
        	             *
        	             *     var MyType = CryptoJS.lib.Base.extend({
        	             *         init: function () {
        	             *             // ...
        	             *         }
        	             *     });
        	             */
        	            init: function () {
        	            },

        	            /**
        	             * Copies properties into this object.
        	             *
        	             * @param {Object} properties The properties to mix in.
        	             *
        	             * @example
        	             *
        	             *     MyType.mixIn({
        	             *         field: 'value'
        	             *     });
        	             */
        	            mixIn: function (properties) {
        	                for (var propertyName in properties) {
        	                    if (properties.hasOwnProperty(propertyName)) {
        	                        this[propertyName] = properties[propertyName];
        	                    }
        	                }

        	                // IE won't copy toString using the loop above
        	                if (properties.hasOwnProperty('toString')) {
        	                    this.toString = properties.toString;
        	                }
        	            },

        	            /**
        	             * Creates a copy of this object.
        	             *
        	             * @return {Object} The clone.
        	             *
        	             * @example
        	             *
        	             *     var clone = instance.clone();
        	             */
        	            clone: function () {
        	                return this.init.prototype.extend(this);
        	            }
        	        };
        	    }());

        	    /**
        	     * An array of 32-bit words.
        	     *
        	     * @property {Array} words The array of 32-bit words.
        	     * @property {number} sigBytes The number of significant bytes in this word array.
        	     */
        	    var WordArray = C_lib.WordArray = Base.extend({
        	        /**
        	         * Initializes a newly created word array.
        	         *
        	         * @param {Array} words (Optional) An array of 32-bit words.
        	         * @param {number} sigBytes (Optional) The number of significant bytes in the words.
        	         *
        	         * @example
        	         *
        	         *     var wordArray = CryptoJS.lib.WordArray.create();
        	         *     var wordArray = CryptoJS.lib.WordArray.create([0x00010203, 0x04050607]);
        	         *     var wordArray = CryptoJS.lib.WordArray.create([0x00010203, 0x04050607], 6);
        	         */
        	        init: function (words, sigBytes) {
        	            words = this.words = words || [];

        	            if (sigBytes != undefined$1) {
        	                this.sigBytes = sigBytes;
        	            } else {
        	                this.sigBytes = words.length * 4;
        	            }
        	        },

        	        /**
        	         * Converts this word array to a string.
        	         *
        	         * @param {Encoder} encoder (Optional) The encoding strategy to use. Default: CryptoJS.enc.Hex
        	         *
        	         * @return {string} The stringified word array.
        	         *
        	         * @example
        	         *
        	         *     var string = wordArray + '';
        	         *     var string = wordArray.toString();
        	         *     var string = wordArray.toString(CryptoJS.enc.Utf8);
        	         */
        	        toString: function (encoder) {
        	            return (encoder || Hex).stringify(this);
        	        },

        	        /**
        	         * Concatenates a word array to this word array.
        	         *
        	         * @param {WordArray} wordArray The word array to append.
        	         *
        	         * @return {WordArray} This word array.
        	         *
        	         * @example
        	         *
        	         *     wordArray1.concat(wordArray2);
        	         */
        	        concat: function (wordArray) {
        	            // Shortcuts
        	            var thisWords = this.words;
        	            var thatWords = wordArray.words;
        	            var thisSigBytes = this.sigBytes;
        	            var thatSigBytes = wordArray.sigBytes;

        	            // Clamp excess bits
        	            this.clamp();

        	            // Concat
        	            if (thisSigBytes % 4) {
        	                // Copy one byte at a time
        	                for (var i = 0; i < thatSigBytes; i++) {
        	                    var thatByte = (thatWords[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
        	                    thisWords[(thisSigBytes + i) >>> 2] |= thatByte << (24 - ((thisSigBytes + i) % 4) * 8);
        	                }
        	            } else {
        	                // Copy one word at a time
        	                for (var i = 0; i < thatSigBytes; i += 4) {
        	                    thisWords[(thisSigBytes + i) >>> 2] = thatWords[i >>> 2];
        	                }
        	            }
        	            this.sigBytes += thatSigBytes;

        	            // Chainable
        	            return this;
        	        },

        	        /**
        	         * Removes insignificant bits.
        	         *
        	         * @example
        	         *
        	         *     wordArray.clamp();
        	         */
        	        clamp: function () {
        	            // Shortcuts
        	            var words = this.words;
        	            var sigBytes = this.sigBytes;

        	            // Clamp
        	            words[sigBytes >>> 2] &= 0xffffffff << (32 - (sigBytes % 4) * 8);
        	            words.length = Math.ceil(sigBytes / 4);
        	        },

        	        /**
        	         * Creates a copy of this word array.
        	         *
        	         * @return {WordArray} The clone.
        	         *
        	         * @example
        	         *
        	         *     var clone = wordArray.clone();
        	         */
        	        clone: function () {
        	            var clone = Base.clone.call(this);
        	            clone.words = this.words.slice(0);

        	            return clone;
        	        },

        	        /**
        	         * Creates a word array filled with random bytes.
        	         *
        	         * @param {number} nBytes The number of random bytes to generate.
        	         *
        	         * @return {WordArray} The random word array.
        	         *
        	         * @static
        	         *
        	         * @example
        	         *
        	         *     var wordArray = CryptoJS.lib.WordArray.random(16);
        	         */
        	        random: function (nBytes) {
        	            var words = [];

        	            var r = (function (m_w) {
        	                var m_w = m_w;
        	                var m_z = 0x3ade68b1;
        	                var mask = 0xffffffff;

        	                return function () {
        	                    m_z = (0x9069 * (m_z & 0xFFFF) + (m_z >> 0x10)) & mask;
        	                    m_w = (0x4650 * (m_w & 0xFFFF) + (m_w >> 0x10)) & mask;
        	                    var result = ((m_z << 0x10) + m_w) & mask;
        	                    result /= 0x100000000;
        	                    result += 0.5;
        	                    return result * (Math.random() > .5 ? 1 : -1);
        	                }
        	            });

        	            for (var i = 0, rcache; i < nBytes; i += 4) {
        	                var _r = r((rcache || Math.random()) * 0x100000000);

        	                rcache = _r() * 0x3ade67b7;
        	                words.push((_r() * 0x100000000) | 0);
        	            }

        	            return new WordArray.init(words, nBytes);
        	        }
        	    });

        	    /**
        	     * Encoder namespace.
        	     */
        	    var C_enc = C.enc = {};

        	    /**
        	     * Hex encoding strategy.
        	     */
        	    var Hex = C_enc.Hex = {
        	        /**
        	         * Converts a word array to a hex string.
        	         *
        	         * @param {WordArray} wordArray The word array.
        	         *
        	         * @return {string} The hex string.
        	         *
        	         * @static
        	         *
        	         * @example
        	         *
        	         *     var hexString = CryptoJS.enc.Hex.stringify(wordArray);
        	         */
        	        stringify: function (wordArray) {
        	            // Shortcuts
        	            var words = wordArray.words;
        	            var sigBytes = wordArray.sigBytes;

        	            // Convert
        	            var hexChars = [];
        	            for (var i = 0; i < sigBytes; i++) {
        	                var bite = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
        	                hexChars.push((bite >>> 4).toString(16));
        	                hexChars.push((bite & 0x0f).toString(16));
        	            }

        	            return hexChars.join('');
        	        },

        	        /**
        	         * Converts a hex string to a word array.
        	         *
        	         * @param {string} hexStr The hex string.
        	         *
        	         * @return {WordArray} The word array.
        	         *
        	         * @static
        	         *
        	         * @example
        	         *
        	         *     var wordArray = CryptoJS.enc.Hex.parse(hexString);
        	         */
        	        parse: function (hexStr) {
        	            // Shortcut
        	            var hexStrLength = hexStr.length;

        	            // Convert
        	            var words = [];
        	            for (var i = 0; i < hexStrLength; i += 2) {
        	                words[i >>> 3] |= parseInt(hexStr.substr(i, 2), 16) << (24 - (i % 8) * 4);
        	            }

        	            return new WordArray.init(words, hexStrLength / 2);
        	        }
        	    };

        	    /**
        	     * Latin1 encoding strategy.
        	     */
        	    var Latin1 = C_enc.Latin1 = {
        	        /**
        	         * Converts a word array to a Latin1 string.
        	         *
        	         * @param {WordArray} wordArray The word array.
        	         *
        	         * @return {string} The Latin1 string.
        	         *
        	         * @static
        	         *
        	         * @example
        	         *
        	         *     var latin1String = CryptoJS.enc.Latin1.stringify(wordArray);
        	         */
        	        stringify: function (wordArray) {
        	            // Shortcuts
        	            var words = wordArray.words;
        	            var sigBytes = wordArray.sigBytes;

        	            // Convert
        	            var latin1Chars = [];
        	            for (var i = 0; i < sigBytes; i++) {
        	                var bite = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
        	                latin1Chars.push(String.fromCharCode(bite));
        	            }

        	            return latin1Chars.join('');
        	        },

        	        /**
        	         * Converts a Latin1 string to a word array.
        	         *
        	         * @param {string} latin1Str The Latin1 string.
        	         *
        	         * @return {WordArray} The word array.
        	         *
        	         * @static
        	         *
        	         * @example
        	         *
        	         *     var wordArray = CryptoJS.enc.Latin1.parse(latin1String);
        	         */
        	        parse: function (latin1Str) {
        	            // Shortcut
        	            var latin1StrLength = latin1Str.length;

        	            // Convert
        	            var words = [];
        	            for (var i = 0; i < latin1StrLength; i++) {
        	                words[i >>> 2] |= (latin1Str.charCodeAt(i) & 0xff) << (24 - (i % 4) * 8);
        	            }

        	            return new WordArray.init(words, latin1StrLength);
        	        }
        	    };

        	    /**
        	     * UTF-8 encoding strategy.
        	     */
        	    var Utf8 = C_enc.Utf8 = {
        	        /**
        	         * Converts a word array to a UTF-8 string.
        	         *
        	         * @param {WordArray} wordArray The word array.
        	         *
        	         * @return {string} The UTF-8 string.
        	         *
        	         * @static
        	         *
        	         * @example
        	         *
        	         *     var utf8String = CryptoJS.enc.Utf8.stringify(wordArray);
        	         */
        	        stringify: function (wordArray) {
        	            try {
        	                return decodeURIComponent(escape(Latin1.stringify(wordArray)));
        	            } catch (e) {
        	                throw new Error('Malformed UTF-8 data');
        	            }
        	        },

        	        /**
        	         * Converts a UTF-8 string to a word array.
        	         *
        	         * @param {string} utf8Str The UTF-8 string.
        	         *
        	         * @return {WordArray} The word array.
        	         *
        	         * @static
        	         *
        	         * @example
        	         *
        	         *     var wordArray = CryptoJS.enc.Utf8.parse(utf8String);
        	         */
        	        parse: function (utf8Str) {
        	            return Latin1.parse(unescape(encodeURIComponent(utf8Str)));
        	        }
        	    };

        	    /**
        	     * Abstract buffered block algorithm template.
        	     *
        	     * The property blockSize must be implemented in a concrete subtype.
        	     *
        	     * @property {number} _minBufferSize The number of blocks that should be kept unprocessed in the buffer. Default: 0
        	     */
        	    var BufferedBlockAlgorithm = C_lib.BufferedBlockAlgorithm = Base.extend({
        	        /**
        	         * Resets this block algorithm's data buffer to its initial state.
        	         *
        	         * @example
        	         *
        	         *     bufferedBlockAlgorithm.reset();
        	         */
        	        reset: function () {
        	            // Initial values
        	            this._data = new WordArray.init();
        	            this._nDataBytes = 0;
        	        },

        	        /**
        	         * Adds new data to this block algorithm's buffer.
        	         *
        	         * @param {WordArray|string} data The data to append. Strings are converted to a WordArray using UTF-8.
        	         *
        	         * @example
        	         *
        	         *     bufferedBlockAlgorithm._append('data');
        	         *     bufferedBlockAlgorithm._append(wordArray);
        	         */
        	        _append: function (data) {
        	            // Convert string to WordArray, else assume WordArray already
        	            if (typeof data == 'string') {
        	                data = Utf8.parse(data);
        	            }

        	            // Append
        	            this._data.concat(data);
        	            this._nDataBytes += data.sigBytes;
        	        },

        	        /**
        	         * Processes available data blocks.
        	         *
        	         * This method invokes _doProcessBlock(offset), which must be implemented by a concrete subtype.
        	         *
        	         * @param {boolean} doFlush Whether all blocks and partial blocks should be processed.
        	         *
        	         * @return {WordArray} The processed data.
        	         *
        	         * @example
        	         *
        	         *     var processedData = bufferedBlockAlgorithm._process();
        	         *     var processedData = bufferedBlockAlgorithm._process(!!'flush');
        	         */
        	        _process: function (doFlush) {
        	            // Shortcuts
        	            var data = this._data;
        	            var dataWords = data.words;
        	            var dataSigBytes = data.sigBytes;
        	            var blockSize = this.blockSize;
        	            var blockSizeBytes = blockSize * 4;

        	            // Count blocks ready
        	            var nBlocksReady = dataSigBytes / blockSizeBytes;
        	            if (doFlush) {
        	                // Round up to include partial blocks
        	                nBlocksReady = Math.ceil(nBlocksReady);
        	            } else {
        	                // Round down to include only full blocks,
        	                // less the number of blocks that must remain in the buffer
        	                nBlocksReady = Math.max((nBlocksReady | 0) - this._minBufferSize, 0);
        	            }

        	            // Count words ready
        	            var nWordsReady = nBlocksReady * blockSize;

        	            // Count bytes ready
        	            var nBytesReady = Math.min(nWordsReady * 4, dataSigBytes);

        	            // Process blocks
        	            if (nWordsReady) {
        	                for (var offset = 0; offset < nWordsReady; offset += blockSize) {
        	                    // Perform concrete-algorithm logic
        	                    this._doProcessBlock(dataWords, offset);
        	                }

        	                // Remove processed words
        	                var processedWords = dataWords.splice(0, nWordsReady);
        	                data.sigBytes -= nBytesReady;
        	            }

        	            // Return processed words
        	            return new WordArray.init(processedWords, nBytesReady);
        	        },

        	        /**
        	         * Creates a copy of this object.
        	         *
        	         * @return {Object} The clone.
        	         *
        	         * @example
        	         *
        	         *     var clone = bufferedBlockAlgorithm.clone();
        	         */
        	        clone: function () {
        	            var clone = Base.clone.call(this);
        	            clone._data = this._data.clone();

        	            return clone;
        	        },

        	        _minBufferSize: 0
        	    });

        	    /**
        	     * Abstract hasher template.
        	     *
        	     * @property {number} blockSize The number of 32-bit words this hasher operates on. Default: 16 (512 bits)
        	     */
        	    var Hasher = C_lib.Hasher = BufferedBlockAlgorithm.extend({
        	        /**
        	         * Configuration options.
        	         */
        	        cfg: Base.extend(),

        	        /**
        	         * Initializes a newly created hasher.
        	         *
        	         * @param {Object} cfg (Optional) The configuration options to use for this hash computation.
        	         *
        	         * @example
        	         *
        	         *     var hasher = CryptoJS.algo.SHA256.create();
        	         */
        	        init: function (cfg) {
        	            // Apply config defaults
        	            this.cfg = this.cfg.extend(cfg);

        	            // Set initial values
        	            this.reset();
        	        },

        	        /**
        	         * Resets this hasher to its initial state.
        	         *
        	         * @example
        	         *
        	         *     hasher.reset();
        	         */
        	        reset: function () {
        	            // Reset data buffer
        	            BufferedBlockAlgorithm.reset.call(this);

        	            // Perform concrete-hasher logic
        	            this._doReset();
        	        },

        	        /**
        	         * Updates this hasher with a message.
        	         *
        	         * @param {WordArray|string} messageUpdate The message to append.
        	         *
        	         * @return {Hasher} This hasher.
        	         *
        	         * @example
        	         *
        	         *     hasher.update('message');
        	         *     hasher.update(wordArray);
        	         */
        	        update: function (messageUpdate) {
        	            // Append
        	            this._append(messageUpdate);

        	            // Update the hash
        	            this._process();

        	            // Chainable
        	            return this;
        	        },

        	        /**
        	         * Finalizes the hash computation.
        	         * Note that the finalize operation is effectively a destructive, read-once operation.
        	         *
        	         * @param {WordArray|string} messageUpdate (Optional) A final message update.
        	         *
        	         * @return {WordArray} The hash.
        	         *
        	         * @example
        	         *
        	         *     var hash = hasher.finalize();
        	         *     var hash = hasher.finalize('message');
        	         *     var hash = hasher.finalize(wordArray);
        	         */
        	        finalize: function (messageUpdate) {
        	            // Final message update
        	            if (messageUpdate) {
        	                this._append(messageUpdate);
        	            }

        	            // Perform concrete-hasher logic
        	            var hash = this._doFinalize();

        	            return hash;
        	        },

        	        blockSize: 512/32,

        	        /**
        	         * Creates a shortcut function to a hasher's object interface.
        	         *
        	         * @param {Hasher} hasher The hasher to create a helper for.
        	         *
        	         * @return {Function} The shortcut function.
        	         *
        	         * @static
        	         *
        	         * @example
        	         *
        	         *     var SHA256 = CryptoJS.lib.Hasher._createHelper(CryptoJS.algo.SHA256);
        	         */
        	        _createHelper: function (hasher) {
        	            return function (message, cfg) {
        	                return new hasher.init(cfg).finalize(message);
        	            };
        	        },

        	        /**
        	         * Creates a shortcut function to the HMAC's object interface.
        	         *
        	         * @param {Hasher} hasher The hasher to use in this HMAC helper.
        	         *
        	         * @return {Function} The shortcut function.
        	         *
        	         * @static
        	         *
        	         * @example
        	         *
        	         *     var HmacSHA256 = CryptoJS.lib.Hasher._createHmacHelper(CryptoJS.algo.SHA256);
        	         */
        	        _createHmacHelper: function (hasher) {
        	            return function (message, key) {
        	                return new C_algo.HMAC.init(hasher, key).finalize(message);
        	            };
        	        }
        	    });

        	    /**
        	     * Algorithm namespace.
        	     */
        	    var C_algo = C.algo = {};

        	    return C;
        	}(Math));


        	return CryptoJS;

        }));
        });

        var x64Core = createCommonjsModule(function (module, exports) {
        (function (root, factory) {
        	{
        		// CommonJS
        		module.exports = exports = factory(core);
        	}
        }(commonjsGlobal, function (CryptoJS) {

        	(function (undefined$1) {
        	    // Shortcuts
        	    var C = CryptoJS;
        	    var C_lib = C.lib;
        	    var Base = C_lib.Base;
        	    var X32WordArray = C_lib.WordArray;

        	    /**
        	     * x64 namespace.
        	     */
        	    var C_x64 = C.x64 = {};

        	    /**
        	     * A 64-bit word.
        	     */
        	    var X64Word = C_x64.Word = Base.extend({
        	        /**
        	         * Initializes a newly created 64-bit word.
        	         *
        	         * @param {number} high The high 32 bits.
        	         * @param {number} low The low 32 bits.
        	         *
        	         * @example
        	         *
        	         *     var x64Word = CryptoJS.x64.Word.create(0x00010203, 0x04050607);
        	         */
        	        init: function (high, low) {
        	            this.high = high;
        	            this.low = low;
        	        }

        	        /**
        	         * Bitwise NOTs this word.
        	         *
        	         * @return {X64Word} A new x64-Word object after negating.
        	         *
        	         * @example
        	         *
        	         *     var negated = x64Word.not();
        	         */
        	        // not: function () {
        	            // var high = ~this.high;
        	            // var low = ~this.low;

        	            // return X64Word.create(high, low);
        	        // },

        	        /**
        	         * Bitwise ANDs this word with the passed word.
        	         *
        	         * @param {X64Word} word The x64-Word to AND with this word.
        	         *
        	         * @return {X64Word} A new x64-Word object after ANDing.
        	         *
        	         * @example
        	         *
        	         *     var anded = x64Word.and(anotherX64Word);
        	         */
        	        // and: function (word) {
        	            // var high = this.high & word.high;
        	            // var low = this.low & word.low;

        	            // return X64Word.create(high, low);
        	        // },

        	        /**
        	         * Bitwise ORs this word with the passed word.
        	         *
        	         * @param {X64Word} word The x64-Word to OR with this word.
        	         *
        	         * @return {X64Word} A new x64-Word object after ORing.
        	         *
        	         * @example
        	         *
        	         *     var ored = x64Word.or(anotherX64Word);
        	         */
        	        // or: function (word) {
        	            // var high = this.high | word.high;
        	            // var low = this.low | word.low;

        	            // return X64Word.create(high, low);
        	        // },

        	        /**
        	         * Bitwise XORs this word with the passed word.
        	         *
        	         * @param {X64Word} word The x64-Word to XOR with this word.
        	         *
        	         * @return {X64Word} A new x64-Word object after XORing.
        	         *
        	         * @example
        	         *
        	         *     var xored = x64Word.xor(anotherX64Word);
        	         */
        	        // xor: function (word) {
        	            // var high = this.high ^ word.high;
        	            // var low = this.low ^ word.low;

        	            // return X64Word.create(high, low);
        	        // },

        	        /**
        	         * Shifts this word n bits to the left.
        	         *
        	         * @param {number} n The number of bits to shift.
        	         *
        	         * @return {X64Word} A new x64-Word object after shifting.
        	         *
        	         * @example
        	         *
        	         *     var shifted = x64Word.shiftL(25);
        	         */
        	        // shiftL: function (n) {
        	            // if (n < 32) {
        	                // var high = (this.high << n) | (this.low >>> (32 - n));
        	                // var low = this.low << n;
        	            // } else {
        	                // var high = this.low << (n - 32);
        	                // var low = 0;
        	            // }

        	            // return X64Word.create(high, low);
        	        // },

        	        /**
        	         * Shifts this word n bits to the right.
        	         *
        	         * @param {number} n The number of bits to shift.
        	         *
        	         * @return {X64Word} A new x64-Word object after shifting.
        	         *
        	         * @example
        	         *
        	         *     var shifted = x64Word.shiftR(7);
        	         */
        	        // shiftR: function (n) {
        	            // if (n < 32) {
        	                // var low = (this.low >>> n) | (this.high << (32 - n));
        	                // var high = this.high >>> n;
        	            // } else {
        	                // var low = this.high >>> (n - 32);
        	                // var high = 0;
        	            // }

        	            // return X64Word.create(high, low);
        	        // },

        	        /**
        	         * Rotates this word n bits to the left.
        	         *
        	         * @param {number} n The number of bits to rotate.
        	         *
        	         * @return {X64Word} A new x64-Word object after rotating.
        	         *
        	         * @example
        	         *
        	         *     var rotated = x64Word.rotL(25);
        	         */
        	        // rotL: function (n) {
        	            // return this.shiftL(n).or(this.shiftR(64 - n));
        	        // },

        	        /**
        	         * Rotates this word n bits to the right.
        	         *
        	         * @param {number} n The number of bits to rotate.
        	         *
        	         * @return {X64Word} A new x64-Word object after rotating.
        	         *
        	         * @example
        	         *
        	         *     var rotated = x64Word.rotR(7);
        	         */
        	        // rotR: function (n) {
        	            // return this.shiftR(n).or(this.shiftL(64 - n));
        	        // },

        	        /**
        	         * Adds this word with the passed word.
        	         *
        	         * @param {X64Word} word The x64-Word to add with this word.
        	         *
        	         * @return {X64Word} A new x64-Word object after adding.
        	         *
        	         * @example
        	         *
        	         *     var added = x64Word.add(anotherX64Word);
        	         */
        	        // add: function (word) {
        	            // var low = (this.low + word.low) | 0;
        	            // var carry = (low >>> 0) < (this.low >>> 0) ? 1 : 0;
        	            // var high = (this.high + word.high + carry) | 0;

        	            // return X64Word.create(high, low);
        	        // }
        	    });

        	    /**
        	     * An array of 64-bit words.
        	     *
        	     * @property {Array} words The array of CryptoJS.x64.Word objects.
        	     * @property {number} sigBytes The number of significant bytes in this word array.
        	     */
        	    var X64WordArray = C_x64.WordArray = Base.extend({
        	        /**
        	         * Initializes a newly created word array.
        	         *
        	         * @param {Array} words (Optional) An array of CryptoJS.x64.Word objects.
        	         * @param {number} sigBytes (Optional) The number of significant bytes in the words.
        	         *
        	         * @example
        	         *
        	         *     var wordArray = CryptoJS.x64.WordArray.create();
        	         *
        	         *     var wordArray = CryptoJS.x64.WordArray.create([
        	         *         CryptoJS.x64.Word.create(0x00010203, 0x04050607),
        	         *         CryptoJS.x64.Word.create(0x18191a1b, 0x1c1d1e1f)
        	         *     ]);
        	         *
        	         *     var wordArray = CryptoJS.x64.WordArray.create([
        	         *         CryptoJS.x64.Word.create(0x00010203, 0x04050607),
        	         *         CryptoJS.x64.Word.create(0x18191a1b, 0x1c1d1e1f)
        	         *     ], 10);
        	         */
        	        init: function (words, sigBytes) {
        	            words = this.words = words || [];

        	            if (sigBytes != undefined$1) {
        	                this.sigBytes = sigBytes;
        	            } else {
        	                this.sigBytes = words.length * 8;
        	            }
        	        },

        	        /**
        	         * Converts this 64-bit word array to a 32-bit word array.
        	         *
        	         * @return {CryptoJS.lib.WordArray} This word array's data as a 32-bit word array.
        	         *
        	         * @example
        	         *
        	         *     var x32WordArray = x64WordArray.toX32();
        	         */
        	        toX32: function () {
        	            // Shortcuts
        	            var x64Words = this.words;
        	            var x64WordsLength = x64Words.length;

        	            // Convert
        	            var x32Words = [];
        	            for (var i = 0; i < x64WordsLength; i++) {
        	                var x64Word = x64Words[i];
        	                x32Words.push(x64Word.high);
        	                x32Words.push(x64Word.low);
        	            }

        	            return X32WordArray.create(x32Words, this.sigBytes);
        	        },

        	        /**
        	         * Creates a copy of this word array.
        	         *
        	         * @return {X64WordArray} The clone.
        	         *
        	         * @example
        	         *
        	         *     var clone = x64WordArray.clone();
        	         */
        	        clone: function () {
        	            var clone = Base.clone.call(this);

        	            // Clone "words" array
        	            var words = clone.words = this.words.slice(0);

        	            // Clone each X64Word object
        	            var wordsLength = words.length;
        	            for (var i = 0; i < wordsLength; i++) {
        	                words[i] = words[i].clone();
        	            }

        	            return clone;
        	        }
        	    });
        	}());


        	return CryptoJS;

        }));
        });

        var libTypedarrays = createCommonjsModule(function (module, exports) {
        (function (root, factory) {
        	{
        		// CommonJS
        		module.exports = exports = factory(core);
        	}
        }(commonjsGlobal, function (CryptoJS) {

        	(function () {
        	    // Check if typed arrays are supported
        	    if (typeof ArrayBuffer != 'function') {
        	        return;
        	    }

        	    // Shortcuts
        	    var C = CryptoJS;
        	    var C_lib = C.lib;
        	    var WordArray = C_lib.WordArray;

        	    // Reference original init
        	    var superInit = WordArray.init;

        	    // Augment WordArray.init to handle typed arrays
        	    var subInit = WordArray.init = function (typedArray) {
        	        // Convert buffers to uint8
        	        if (typedArray instanceof ArrayBuffer) {
        	            typedArray = new Uint8Array(typedArray);
        	        }

        	        // Convert other array views to uint8
        	        if (
        	            typedArray instanceof Int8Array ||
        	            (typeof Uint8ClampedArray !== "undefined" && typedArray instanceof Uint8ClampedArray) ||
        	            typedArray instanceof Int16Array ||
        	            typedArray instanceof Uint16Array ||
        	            typedArray instanceof Int32Array ||
        	            typedArray instanceof Uint32Array ||
        	            typedArray instanceof Float32Array ||
        	            typedArray instanceof Float64Array
        	        ) {
        	            typedArray = new Uint8Array(typedArray.buffer, typedArray.byteOffset, typedArray.byteLength);
        	        }

        	        // Handle Uint8Array
        	        if (typedArray instanceof Uint8Array) {
        	            // Shortcut
        	            var typedArrayByteLength = typedArray.byteLength;

        	            // Extract bytes
        	            var words = [];
        	            for (var i = 0; i < typedArrayByteLength; i++) {
        	                words[i >>> 2] |= typedArray[i] << (24 - (i % 4) * 8);
        	            }

        	            // Initialize this word array
        	            superInit.call(this, words, typedArrayByteLength);
        	        } else {
        	            // Else call normal init
        	            superInit.apply(this, arguments);
        	        }
        	    };

        	    subInit.prototype = WordArray;
        	}());


        	return CryptoJS.lib.WordArray;

        }));
        });

        var encUtf16 = createCommonjsModule(function (module, exports) {
        (function (root, factory) {
        	{
        		// CommonJS
        		module.exports = exports = factory(core);
        	}
        }(commonjsGlobal, function (CryptoJS) {

        	(function () {
        	    // Shortcuts
        	    var C = CryptoJS;
        	    var C_lib = C.lib;
        	    var WordArray = C_lib.WordArray;
        	    var C_enc = C.enc;

        	    /**
        	     * UTF-16 BE encoding strategy.
        	     */
        	    var Utf16BE = C_enc.Utf16 = C_enc.Utf16BE = {
        	        /**
        	         * Converts a word array to a UTF-16 BE string.
        	         *
        	         * @param {WordArray} wordArray The word array.
        	         *
        	         * @return {string} The UTF-16 BE string.
        	         *
        	         * @static
        	         *
        	         * @example
        	         *
        	         *     var utf16String = CryptoJS.enc.Utf16.stringify(wordArray);
        	         */
        	        stringify: function (wordArray) {
        	            // Shortcuts
        	            var words = wordArray.words;
        	            var sigBytes = wordArray.sigBytes;

        	            // Convert
        	            var utf16Chars = [];
        	            for (var i = 0; i < sigBytes; i += 2) {
        	                var codePoint = (words[i >>> 2] >>> (16 - (i % 4) * 8)) & 0xffff;
        	                utf16Chars.push(String.fromCharCode(codePoint));
        	            }

        	            return utf16Chars.join('');
        	        },

        	        /**
        	         * Converts a UTF-16 BE string to a word array.
        	         *
        	         * @param {string} utf16Str The UTF-16 BE string.
        	         *
        	         * @return {WordArray} The word array.
        	         *
        	         * @static
        	         *
        	         * @example
        	         *
        	         *     var wordArray = CryptoJS.enc.Utf16.parse(utf16String);
        	         */
        	        parse: function (utf16Str) {
        	            // Shortcut
        	            var utf16StrLength = utf16Str.length;

        	            // Convert
        	            var words = [];
        	            for (var i = 0; i < utf16StrLength; i++) {
        	                words[i >>> 1] |= utf16Str.charCodeAt(i) << (16 - (i % 2) * 16);
        	            }

        	            return WordArray.create(words, utf16StrLength * 2);
        	        }
        	    };

        	    /**
        	     * UTF-16 LE encoding strategy.
        	     */
        	    C_enc.Utf16LE = {
        	        /**
        	         * Converts a word array to a UTF-16 LE string.
        	         *
        	         * @param {WordArray} wordArray The word array.
        	         *
        	         * @return {string} The UTF-16 LE string.
        	         *
        	         * @static
        	         *
        	         * @example
        	         *
        	         *     var utf16Str = CryptoJS.enc.Utf16LE.stringify(wordArray);
        	         */
        	        stringify: function (wordArray) {
        	            // Shortcuts
        	            var words = wordArray.words;
        	            var sigBytes = wordArray.sigBytes;

        	            // Convert
        	            var utf16Chars = [];
        	            for (var i = 0; i < sigBytes; i += 2) {
        	                var codePoint = swapEndian((words[i >>> 2] >>> (16 - (i % 4) * 8)) & 0xffff);
        	                utf16Chars.push(String.fromCharCode(codePoint));
        	            }

        	            return utf16Chars.join('');
        	        },

        	        /**
        	         * Converts a UTF-16 LE string to a word array.
        	         *
        	         * @param {string} utf16Str The UTF-16 LE string.
        	         *
        	         * @return {WordArray} The word array.
        	         *
        	         * @static
        	         *
        	         * @example
        	         *
        	         *     var wordArray = CryptoJS.enc.Utf16LE.parse(utf16Str);
        	         */
        	        parse: function (utf16Str) {
        	            // Shortcut
        	            var utf16StrLength = utf16Str.length;

        	            // Convert
        	            var words = [];
        	            for (var i = 0; i < utf16StrLength; i++) {
        	                words[i >>> 1] |= swapEndian(utf16Str.charCodeAt(i) << (16 - (i % 2) * 16));
        	            }

        	            return WordArray.create(words, utf16StrLength * 2);
        	        }
        	    };

        	    function swapEndian(word) {
        	        return ((word << 8) & 0xff00ff00) | ((word >>> 8) & 0x00ff00ff);
        	    }
        	}());


        	return CryptoJS.enc.Utf16;

        }));
        });

        var encBase64 = createCommonjsModule(function (module, exports) {
        (function (root, factory) {
        	{
        		// CommonJS
        		module.exports = exports = factory(core);
        	}
        }(commonjsGlobal, function (CryptoJS) {

        	(function () {
        	    // Shortcuts
        	    var C = CryptoJS;
        	    var C_lib = C.lib;
        	    var WordArray = C_lib.WordArray;
        	    var C_enc = C.enc;

        	    /**
        	     * Base64 encoding strategy.
        	     */
        	    var Base64 = C_enc.Base64 = {
        	        /**
        	         * Converts a word array to a Base64 string.
        	         *
        	         * @param {WordArray} wordArray The word array.
        	         *
        	         * @return {string} The Base64 string.
        	         *
        	         * @static
        	         *
        	         * @example
        	         *
        	         *     var base64String = CryptoJS.enc.Base64.stringify(wordArray);
        	         */
        	        stringify: function (wordArray) {
        	            // Shortcuts
        	            var words = wordArray.words;
        	            var sigBytes = wordArray.sigBytes;
        	            var map = this._map;

        	            // Clamp excess bits
        	            wordArray.clamp();

        	            // Convert
        	            var base64Chars = [];
        	            for (var i = 0; i < sigBytes; i += 3) {
        	                var byte1 = (words[i >>> 2]       >>> (24 - (i % 4) * 8))       & 0xff;
        	                var byte2 = (words[(i + 1) >>> 2] >>> (24 - ((i + 1) % 4) * 8)) & 0xff;
        	                var byte3 = (words[(i + 2) >>> 2] >>> (24 - ((i + 2) % 4) * 8)) & 0xff;

        	                var triplet = (byte1 << 16) | (byte2 << 8) | byte3;

        	                for (var j = 0; (j < 4) && (i + j * 0.75 < sigBytes); j++) {
        	                    base64Chars.push(map.charAt((triplet >>> (6 * (3 - j))) & 0x3f));
        	                }
        	            }

        	            // Add padding
        	            var paddingChar = map.charAt(64);
        	            if (paddingChar) {
        	                while (base64Chars.length % 4) {
        	                    base64Chars.push(paddingChar);
        	                }
        	            }

        	            return base64Chars.join('');
        	        },

        	        /**
        	         * Converts a Base64 string to a word array.
        	         *
        	         * @param {string} base64Str The Base64 string.
        	         *
        	         * @return {WordArray} The word array.
        	         *
        	         * @static
        	         *
        	         * @example
        	         *
        	         *     var wordArray = CryptoJS.enc.Base64.parse(base64String);
        	         */
        	        parse: function (base64Str) {
        	            // Shortcuts
        	            var base64StrLength = base64Str.length;
        	            var map = this._map;
        	            var reverseMap = this._reverseMap;

        	            if (!reverseMap) {
        	                    reverseMap = this._reverseMap = [];
        	                    for (var j = 0; j < map.length; j++) {
        	                        reverseMap[map.charCodeAt(j)] = j;
        	                    }
        	            }

        	            // Ignore padding
        	            var paddingChar = map.charAt(64);
        	            if (paddingChar) {
        	                var paddingIndex = base64Str.indexOf(paddingChar);
        	                if (paddingIndex !== -1) {
        	                    base64StrLength = paddingIndex;
        	                }
        	            }

        	            // Convert
        	            return parseLoop(base64Str, base64StrLength, reverseMap);

        	        },

        	        _map: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
        	    };

        	    function parseLoop(base64Str, base64StrLength, reverseMap) {
        	      var words = [];
        	      var nBytes = 0;
        	      for (var i = 0; i < base64StrLength; i++) {
        	          if (i % 4) {
        	              var bits1 = reverseMap[base64Str.charCodeAt(i - 1)] << ((i % 4) * 2);
        	              var bits2 = reverseMap[base64Str.charCodeAt(i)] >>> (6 - (i % 4) * 2);
        	              words[nBytes >>> 2] |= (bits1 | bits2) << (24 - (nBytes % 4) * 8);
        	              nBytes++;
        	          }
        	      }
        	      return WordArray.create(words, nBytes);
        	    }
        	}());


        	return CryptoJS.enc.Base64;

        }));
        });

        var md5 = createCommonjsModule(function (module, exports) {
        (function (root, factory) {
        	{
        		// CommonJS
        		module.exports = exports = factory(core);
        	}
        }(commonjsGlobal, function (CryptoJS) {

        	(function (Math) {
        	    // Shortcuts
        	    var C = CryptoJS;
        	    var C_lib = C.lib;
        	    var WordArray = C_lib.WordArray;
        	    var Hasher = C_lib.Hasher;
        	    var C_algo = C.algo;

        	    // Constants table
        	    var T = [];

        	    // Compute constants
        	    (function () {
        	        for (var i = 0; i < 64; i++) {
        	            T[i] = (Math.abs(Math.sin(i + 1)) * 0x100000000) | 0;
        	        }
        	    }());

        	    /**
        	     * MD5 hash algorithm.
        	     */
        	    var MD5 = C_algo.MD5 = Hasher.extend({
        	        _doReset: function () {
        	            this._hash = new WordArray.init([
        	                0x67452301, 0xefcdab89,
        	                0x98badcfe, 0x10325476
        	            ]);
        	        },

        	        _doProcessBlock: function (M, offset) {
        	            // Swap endian
        	            for (var i = 0; i < 16; i++) {
        	                // Shortcuts
        	                var offset_i = offset + i;
        	                var M_offset_i = M[offset_i];

        	                M[offset_i] = (
        	                    (((M_offset_i << 8)  | (M_offset_i >>> 24)) & 0x00ff00ff) |
        	                    (((M_offset_i << 24) | (M_offset_i >>> 8))  & 0xff00ff00)
        	                );
        	            }

        	            // Shortcuts
        	            var H = this._hash.words;

        	            var M_offset_0  = M[offset + 0];
        	            var M_offset_1  = M[offset + 1];
        	            var M_offset_2  = M[offset + 2];
        	            var M_offset_3  = M[offset + 3];
        	            var M_offset_4  = M[offset + 4];
        	            var M_offset_5  = M[offset + 5];
        	            var M_offset_6  = M[offset + 6];
        	            var M_offset_7  = M[offset + 7];
        	            var M_offset_8  = M[offset + 8];
        	            var M_offset_9  = M[offset + 9];
        	            var M_offset_10 = M[offset + 10];
        	            var M_offset_11 = M[offset + 11];
        	            var M_offset_12 = M[offset + 12];
        	            var M_offset_13 = M[offset + 13];
        	            var M_offset_14 = M[offset + 14];
        	            var M_offset_15 = M[offset + 15];

        	            // Working varialbes
        	            var a = H[0];
        	            var b = H[1];
        	            var c = H[2];
        	            var d = H[3];

        	            // Computation
        	            a = FF(a, b, c, d, M_offset_0,  7,  T[0]);
        	            d = FF(d, a, b, c, M_offset_1,  12, T[1]);
        	            c = FF(c, d, a, b, M_offset_2,  17, T[2]);
        	            b = FF(b, c, d, a, M_offset_3,  22, T[3]);
        	            a = FF(a, b, c, d, M_offset_4,  7,  T[4]);
        	            d = FF(d, a, b, c, M_offset_5,  12, T[5]);
        	            c = FF(c, d, a, b, M_offset_6,  17, T[6]);
        	            b = FF(b, c, d, a, M_offset_7,  22, T[7]);
        	            a = FF(a, b, c, d, M_offset_8,  7,  T[8]);
        	            d = FF(d, a, b, c, M_offset_9,  12, T[9]);
        	            c = FF(c, d, a, b, M_offset_10, 17, T[10]);
        	            b = FF(b, c, d, a, M_offset_11, 22, T[11]);
        	            a = FF(a, b, c, d, M_offset_12, 7,  T[12]);
        	            d = FF(d, a, b, c, M_offset_13, 12, T[13]);
        	            c = FF(c, d, a, b, M_offset_14, 17, T[14]);
        	            b = FF(b, c, d, a, M_offset_15, 22, T[15]);

        	            a = GG(a, b, c, d, M_offset_1,  5,  T[16]);
        	            d = GG(d, a, b, c, M_offset_6,  9,  T[17]);
        	            c = GG(c, d, a, b, M_offset_11, 14, T[18]);
        	            b = GG(b, c, d, a, M_offset_0,  20, T[19]);
        	            a = GG(a, b, c, d, M_offset_5,  5,  T[20]);
        	            d = GG(d, a, b, c, M_offset_10, 9,  T[21]);
        	            c = GG(c, d, a, b, M_offset_15, 14, T[22]);
        	            b = GG(b, c, d, a, M_offset_4,  20, T[23]);
        	            a = GG(a, b, c, d, M_offset_9,  5,  T[24]);
        	            d = GG(d, a, b, c, M_offset_14, 9,  T[25]);
        	            c = GG(c, d, a, b, M_offset_3,  14, T[26]);
        	            b = GG(b, c, d, a, M_offset_8,  20, T[27]);
        	            a = GG(a, b, c, d, M_offset_13, 5,  T[28]);
        	            d = GG(d, a, b, c, M_offset_2,  9,  T[29]);
        	            c = GG(c, d, a, b, M_offset_7,  14, T[30]);
        	            b = GG(b, c, d, a, M_offset_12, 20, T[31]);

        	            a = HH(a, b, c, d, M_offset_5,  4,  T[32]);
        	            d = HH(d, a, b, c, M_offset_8,  11, T[33]);
        	            c = HH(c, d, a, b, M_offset_11, 16, T[34]);
        	            b = HH(b, c, d, a, M_offset_14, 23, T[35]);
        	            a = HH(a, b, c, d, M_offset_1,  4,  T[36]);
        	            d = HH(d, a, b, c, M_offset_4,  11, T[37]);
        	            c = HH(c, d, a, b, M_offset_7,  16, T[38]);
        	            b = HH(b, c, d, a, M_offset_10, 23, T[39]);
        	            a = HH(a, b, c, d, M_offset_13, 4,  T[40]);
        	            d = HH(d, a, b, c, M_offset_0,  11, T[41]);
        	            c = HH(c, d, a, b, M_offset_3,  16, T[42]);
        	            b = HH(b, c, d, a, M_offset_6,  23, T[43]);
        	            a = HH(a, b, c, d, M_offset_9,  4,  T[44]);
        	            d = HH(d, a, b, c, M_offset_12, 11, T[45]);
        	            c = HH(c, d, a, b, M_offset_15, 16, T[46]);
        	            b = HH(b, c, d, a, M_offset_2,  23, T[47]);

        	            a = II(a, b, c, d, M_offset_0,  6,  T[48]);
        	            d = II(d, a, b, c, M_offset_7,  10, T[49]);
        	            c = II(c, d, a, b, M_offset_14, 15, T[50]);
        	            b = II(b, c, d, a, M_offset_5,  21, T[51]);
        	            a = II(a, b, c, d, M_offset_12, 6,  T[52]);
        	            d = II(d, a, b, c, M_offset_3,  10, T[53]);
        	            c = II(c, d, a, b, M_offset_10, 15, T[54]);
        	            b = II(b, c, d, a, M_offset_1,  21, T[55]);
        	            a = II(a, b, c, d, M_offset_8,  6,  T[56]);
        	            d = II(d, a, b, c, M_offset_15, 10, T[57]);
        	            c = II(c, d, a, b, M_offset_6,  15, T[58]);
        	            b = II(b, c, d, a, M_offset_13, 21, T[59]);
        	            a = II(a, b, c, d, M_offset_4,  6,  T[60]);
        	            d = II(d, a, b, c, M_offset_11, 10, T[61]);
        	            c = II(c, d, a, b, M_offset_2,  15, T[62]);
        	            b = II(b, c, d, a, M_offset_9,  21, T[63]);

        	            // Intermediate hash value
        	            H[0] = (H[0] + a) | 0;
        	            H[1] = (H[1] + b) | 0;
        	            H[2] = (H[2] + c) | 0;
        	            H[3] = (H[3] + d) | 0;
        	        },

        	        _doFinalize: function () {
        	            // Shortcuts
        	            var data = this._data;
        	            var dataWords = data.words;

        	            var nBitsTotal = this._nDataBytes * 8;
        	            var nBitsLeft = data.sigBytes * 8;

        	            // Add padding
        	            dataWords[nBitsLeft >>> 5] |= 0x80 << (24 - nBitsLeft % 32);

        	            var nBitsTotalH = Math.floor(nBitsTotal / 0x100000000);
        	            var nBitsTotalL = nBitsTotal;
        	            dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 15] = (
        	                (((nBitsTotalH << 8)  | (nBitsTotalH >>> 24)) & 0x00ff00ff) |
        	                (((nBitsTotalH << 24) | (nBitsTotalH >>> 8))  & 0xff00ff00)
        	            );
        	            dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 14] = (
        	                (((nBitsTotalL << 8)  | (nBitsTotalL >>> 24)) & 0x00ff00ff) |
        	                (((nBitsTotalL << 24) | (nBitsTotalL >>> 8))  & 0xff00ff00)
        	            );

        	            data.sigBytes = (dataWords.length + 1) * 4;

        	            // Hash final blocks
        	            this._process();

        	            // Shortcuts
        	            var hash = this._hash;
        	            var H = hash.words;

        	            // Swap endian
        	            for (var i = 0; i < 4; i++) {
        	                // Shortcut
        	                var H_i = H[i];

        	                H[i] = (((H_i << 8)  | (H_i >>> 24)) & 0x00ff00ff) |
        	                       (((H_i << 24) | (H_i >>> 8))  & 0xff00ff00);
        	            }

        	            // Return final computed hash
        	            return hash;
        	        },

        	        clone: function () {
        	            var clone = Hasher.clone.call(this);
        	            clone._hash = this._hash.clone();

        	            return clone;
        	        }
        	    });

        	    function FF(a, b, c, d, x, s, t) {
        	        var n = a + ((b & c) | (~b & d)) + x + t;
        	        return ((n << s) | (n >>> (32 - s))) + b;
        	    }

        	    function GG(a, b, c, d, x, s, t) {
        	        var n = a + ((b & d) | (c & ~d)) + x + t;
        	        return ((n << s) | (n >>> (32 - s))) + b;
        	    }

        	    function HH(a, b, c, d, x, s, t) {
        	        var n = a + (b ^ c ^ d) + x + t;
        	        return ((n << s) | (n >>> (32 - s))) + b;
        	    }

        	    function II(a, b, c, d, x, s, t) {
        	        var n = a + (c ^ (b | ~d)) + x + t;
        	        return ((n << s) | (n >>> (32 - s))) + b;
        	    }

        	    /**
        	     * Shortcut function to the hasher's object interface.
        	     *
        	     * @param {WordArray|string} message The message to hash.
        	     *
        	     * @return {WordArray} The hash.
        	     *
        	     * @static
        	     *
        	     * @example
        	     *
        	     *     var hash = CryptoJS.MD5('message');
        	     *     var hash = CryptoJS.MD5(wordArray);
        	     */
        	    C.MD5 = Hasher._createHelper(MD5);

        	    /**
        	     * Shortcut function to the HMAC's object interface.
        	     *
        	     * @param {WordArray|string} message The message to hash.
        	     * @param {WordArray|string} key The secret key.
        	     *
        	     * @return {WordArray} The HMAC.
        	     *
        	     * @static
        	     *
        	     * @example
        	     *
        	     *     var hmac = CryptoJS.HmacMD5(message, key);
        	     */
        	    C.HmacMD5 = Hasher._createHmacHelper(MD5);
        	}(Math));


        	return CryptoJS.MD5;

        }));
        });

        var sha1 = createCommonjsModule(function (module, exports) {
        (function (root, factory) {
        	{
        		// CommonJS
        		module.exports = exports = factory(core);
        	}
        }(commonjsGlobal, function (CryptoJS) {

        	(function () {
        	    // Shortcuts
        	    var C = CryptoJS;
        	    var C_lib = C.lib;
        	    var WordArray = C_lib.WordArray;
        	    var Hasher = C_lib.Hasher;
        	    var C_algo = C.algo;

        	    // Reusable object
        	    var W = [];

        	    /**
        	     * SHA-1 hash algorithm.
        	     */
        	    var SHA1 = C_algo.SHA1 = Hasher.extend({
        	        _doReset: function () {
        	            this._hash = new WordArray.init([
        	                0x67452301, 0xefcdab89,
        	                0x98badcfe, 0x10325476,
        	                0xc3d2e1f0
        	            ]);
        	        },

        	        _doProcessBlock: function (M, offset) {
        	            // Shortcut
        	            var H = this._hash.words;

        	            // Working variables
        	            var a = H[0];
        	            var b = H[1];
        	            var c = H[2];
        	            var d = H[3];
        	            var e = H[4];

        	            // Computation
        	            for (var i = 0; i < 80; i++) {
        	                if (i < 16) {
        	                    W[i] = M[offset + i] | 0;
        	                } else {
        	                    var n = W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16];
        	                    W[i] = (n << 1) | (n >>> 31);
        	                }

        	                var t = ((a << 5) | (a >>> 27)) + e + W[i];
        	                if (i < 20) {
        	                    t += ((b & c) | (~b & d)) + 0x5a827999;
        	                } else if (i < 40) {
        	                    t += (b ^ c ^ d) + 0x6ed9eba1;
        	                } else if (i < 60) {
        	                    t += ((b & c) | (b & d) | (c & d)) - 0x70e44324;
        	                } else /* if (i < 80) */ {
        	                    t += (b ^ c ^ d) - 0x359d3e2a;
        	                }

        	                e = d;
        	                d = c;
        	                c = (b << 30) | (b >>> 2);
        	                b = a;
        	                a = t;
        	            }

        	            // Intermediate hash value
        	            H[0] = (H[0] + a) | 0;
        	            H[1] = (H[1] + b) | 0;
        	            H[2] = (H[2] + c) | 0;
        	            H[3] = (H[3] + d) | 0;
        	            H[4] = (H[4] + e) | 0;
        	        },

        	        _doFinalize: function () {
        	            // Shortcuts
        	            var data = this._data;
        	            var dataWords = data.words;

        	            var nBitsTotal = this._nDataBytes * 8;
        	            var nBitsLeft = data.sigBytes * 8;

        	            // Add padding
        	            dataWords[nBitsLeft >>> 5] |= 0x80 << (24 - nBitsLeft % 32);
        	            dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 14] = Math.floor(nBitsTotal / 0x100000000);
        	            dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 15] = nBitsTotal;
        	            data.sigBytes = dataWords.length * 4;

        	            // Hash final blocks
        	            this._process();

        	            // Return final computed hash
        	            return this._hash;
        	        },

        	        clone: function () {
        	            var clone = Hasher.clone.call(this);
        	            clone._hash = this._hash.clone();

        	            return clone;
        	        }
        	    });

        	    /**
        	     * Shortcut function to the hasher's object interface.
        	     *
        	     * @param {WordArray|string} message The message to hash.
        	     *
        	     * @return {WordArray} The hash.
        	     *
        	     * @static
        	     *
        	     * @example
        	     *
        	     *     var hash = CryptoJS.SHA1('message');
        	     *     var hash = CryptoJS.SHA1(wordArray);
        	     */
        	    C.SHA1 = Hasher._createHelper(SHA1);

        	    /**
        	     * Shortcut function to the HMAC's object interface.
        	     *
        	     * @param {WordArray|string} message The message to hash.
        	     * @param {WordArray|string} key The secret key.
        	     *
        	     * @return {WordArray} The HMAC.
        	     *
        	     * @static
        	     *
        	     * @example
        	     *
        	     *     var hmac = CryptoJS.HmacSHA1(message, key);
        	     */
        	    C.HmacSHA1 = Hasher._createHmacHelper(SHA1);
        	}());


        	return CryptoJS.SHA1;

        }));
        });

        var sha256 = createCommonjsModule(function (module, exports) {
        (function (root, factory) {
        	{
        		// CommonJS
        		module.exports = exports = factory(core);
        	}
        }(commonjsGlobal, function (CryptoJS) {

        	(function (Math) {
        	    // Shortcuts
        	    var C = CryptoJS;
        	    var C_lib = C.lib;
        	    var WordArray = C_lib.WordArray;
        	    var Hasher = C_lib.Hasher;
        	    var C_algo = C.algo;

        	    // Initialization and round constants tables
        	    var H = [];
        	    var K = [];

        	    // Compute constants
        	    (function () {
        	        function isPrime(n) {
        	            var sqrtN = Math.sqrt(n);
        	            for (var factor = 2; factor <= sqrtN; factor++) {
        	                if (!(n % factor)) {
        	                    return false;
        	                }
        	            }

        	            return true;
        	        }

        	        function getFractionalBits(n) {
        	            return ((n - (n | 0)) * 0x100000000) | 0;
        	        }

        	        var n = 2;
        	        var nPrime = 0;
        	        while (nPrime < 64) {
        	            if (isPrime(n)) {
        	                if (nPrime < 8) {
        	                    H[nPrime] = getFractionalBits(Math.pow(n, 1 / 2));
        	                }
        	                K[nPrime] = getFractionalBits(Math.pow(n, 1 / 3));

        	                nPrime++;
        	            }

        	            n++;
        	        }
        	    }());

        	    // Reusable object
        	    var W = [];

        	    /**
        	     * SHA-256 hash algorithm.
        	     */
        	    var SHA256 = C_algo.SHA256 = Hasher.extend({
        	        _doReset: function () {
        	            this._hash = new WordArray.init(H.slice(0));
        	        },

        	        _doProcessBlock: function (M, offset) {
        	            // Shortcut
        	            var H = this._hash.words;

        	            // Working variables
        	            var a = H[0];
        	            var b = H[1];
        	            var c = H[2];
        	            var d = H[3];
        	            var e = H[4];
        	            var f = H[5];
        	            var g = H[6];
        	            var h = H[7];

        	            // Computation
        	            for (var i = 0; i < 64; i++) {
        	                if (i < 16) {
        	                    W[i] = M[offset + i] | 0;
        	                } else {
        	                    var gamma0x = W[i - 15];
        	                    var gamma0  = ((gamma0x << 25) | (gamma0x >>> 7))  ^
        	                                  ((gamma0x << 14) | (gamma0x >>> 18)) ^
        	                                   (gamma0x >>> 3);

        	                    var gamma1x = W[i - 2];
        	                    var gamma1  = ((gamma1x << 15) | (gamma1x >>> 17)) ^
        	                                  ((gamma1x << 13) | (gamma1x >>> 19)) ^
        	                                   (gamma1x >>> 10);

        	                    W[i] = gamma0 + W[i - 7] + gamma1 + W[i - 16];
        	                }

        	                var ch  = (e & f) ^ (~e & g);
        	                var maj = (a & b) ^ (a & c) ^ (b & c);

        	                var sigma0 = ((a << 30) | (a >>> 2)) ^ ((a << 19) | (a >>> 13)) ^ ((a << 10) | (a >>> 22));
        	                var sigma1 = ((e << 26) | (e >>> 6)) ^ ((e << 21) | (e >>> 11)) ^ ((e << 7)  | (e >>> 25));

        	                var t1 = h + sigma1 + ch + K[i] + W[i];
        	                var t2 = sigma0 + maj;

        	                h = g;
        	                g = f;
        	                f = e;
        	                e = (d + t1) | 0;
        	                d = c;
        	                c = b;
        	                b = a;
        	                a = (t1 + t2) | 0;
        	            }

        	            // Intermediate hash value
        	            H[0] = (H[0] + a) | 0;
        	            H[1] = (H[1] + b) | 0;
        	            H[2] = (H[2] + c) | 0;
        	            H[3] = (H[3] + d) | 0;
        	            H[4] = (H[4] + e) | 0;
        	            H[5] = (H[5] + f) | 0;
        	            H[6] = (H[6] + g) | 0;
        	            H[7] = (H[7] + h) | 0;
        	        },

        	        _doFinalize: function () {
        	            // Shortcuts
        	            var data = this._data;
        	            var dataWords = data.words;

        	            var nBitsTotal = this._nDataBytes * 8;
        	            var nBitsLeft = data.sigBytes * 8;

        	            // Add padding
        	            dataWords[nBitsLeft >>> 5] |= 0x80 << (24 - nBitsLeft % 32);
        	            dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 14] = Math.floor(nBitsTotal / 0x100000000);
        	            dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 15] = nBitsTotal;
        	            data.sigBytes = dataWords.length * 4;

        	            // Hash final blocks
        	            this._process();

        	            // Return final computed hash
        	            return this._hash;
        	        },

        	        clone: function () {
        	            var clone = Hasher.clone.call(this);
        	            clone._hash = this._hash.clone();

        	            return clone;
        	        }
        	    });

        	    /**
        	     * Shortcut function to the hasher's object interface.
        	     *
        	     * @param {WordArray|string} message The message to hash.
        	     *
        	     * @return {WordArray} The hash.
        	     *
        	     * @static
        	     *
        	     * @example
        	     *
        	     *     var hash = CryptoJS.SHA256('message');
        	     *     var hash = CryptoJS.SHA256(wordArray);
        	     */
        	    C.SHA256 = Hasher._createHelper(SHA256);

        	    /**
        	     * Shortcut function to the HMAC's object interface.
        	     *
        	     * @param {WordArray|string} message The message to hash.
        	     * @param {WordArray|string} key The secret key.
        	     *
        	     * @return {WordArray} The HMAC.
        	     *
        	     * @static
        	     *
        	     * @example
        	     *
        	     *     var hmac = CryptoJS.HmacSHA256(message, key);
        	     */
        	    C.HmacSHA256 = Hasher._createHmacHelper(SHA256);
        	}(Math));


        	return CryptoJS.SHA256;

        }));
        });

        var sha224 = createCommonjsModule(function (module, exports) {
        (function (root, factory, undef) {
        	{
        		// CommonJS
        		module.exports = exports = factory(core, sha256);
        	}
        }(commonjsGlobal, function (CryptoJS) {

        	(function () {
        	    // Shortcuts
        	    var C = CryptoJS;
        	    var C_lib = C.lib;
        	    var WordArray = C_lib.WordArray;
        	    var C_algo = C.algo;
        	    var SHA256 = C_algo.SHA256;

        	    /**
        	     * SHA-224 hash algorithm.
        	     */
        	    var SHA224 = C_algo.SHA224 = SHA256.extend({
        	        _doReset: function () {
        	            this._hash = new WordArray.init([
        	                0xc1059ed8, 0x367cd507, 0x3070dd17, 0xf70e5939,
        	                0xffc00b31, 0x68581511, 0x64f98fa7, 0xbefa4fa4
        	            ]);
        	        },

        	        _doFinalize: function () {
        	            var hash = SHA256._doFinalize.call(this);

        	            hash.sigBytes -= 4;

        	            return hash;
        	        }
        	    });

        	    /**
        	     * Shortcut function to the hasher's object interface.
        	     *
        	     * @param {WordArray|string} message The message to hash.
        	     *
        	     * @return {WordArray} The hash.
        	     *
        	     * @static
        	     *
        	     * @example
        	     *
        	     *     var hash = CryptoJS.SHA224('message');
        	     *     var hash = CryptoJS.SHA224(wordArray);
        	     */
        	    C.SHA224 = SHA256._createHelper(SHA224);

        	    /**
        	     * Shortcut function to the HMAC's object interface.
        	     *
        	     * @param {WordArray|string} message The message to hash.
        	     * @param {WordArray|string} key The secret key.
        	     *
        	     * @return {WordArray} The HMAC.
        	     *
        	     * @static
        	     *
        	     * @example
        	     *
        	     *     var hmac = CryptoJS.HmacSHA224(message, key);
        	     */
        	    C.HmacSHA224 = SHA256._createHmacHelper(SHA224);
        	}());


        	return CryptoJS.SHA224;

        }));
        });

        var sha512 = createCommonjsModule(function (module, exports) {
        (function (root, factory, undef) {
        	{
        		// CommonJS
        		module.exports = exports = factory(core, x64Core);
        	}
        }(commonjsGlobal, function (CryptoJS) {

        	(function () {
        	    // Shortcuts
        	    var C = CryptoJS;
        	    var C_lib = C.lib;
        	    var Hasher = C_lib.Hasher;
        	    var C_x64 = C.x64;
        	    var X64Word = C_x64.Word;
        	    var X64WordArray = C_x64.WordArray;
        	    var C_algo = C.algo;

        	    function X64Word_create() {
        	        return X64Word.create.apply(X64Word, arguments);
        	    }

        	    // Constants
        	    var K = [
        	        X64Word_create(0x428a2f98, 0xd728ae22), X64Word_create(0x71374491, 0x23ef65cd),
        	        X64Word_create(0xb5c0fbcf, 0xec4d3b2f), X64Word_create(0xe9b5dba5, 0x8189dbbc),
        	        X64Word_create(0x3956c25b, 0xf348b538), X64Word_create(0x59f111f1, 0xb605d019),
        	        X64Word_create(0x923f82a4, 0xaf194f9b), X64Word_create(0xab1c5ed5, 0xda6d8118),
        	        X64Word_create(0xd807aa98, 0xa3030242), X64Word_create(0x12835b01, 0x45706fbe),
        	        X64Word_create(0x243185be, 0x4ee4b28c), X64Word_create(0x550c7dc3, 0xd5ffb4e2),
        	        X64Word_create(0x72be5d74, 0xf27b896f), X64Word_create(0x80deb1fe, 0x3b1696b1),
        	        X64Word_create(0x9bdc06a7, 0x25c71235), X64Word_create(0xc19bf174, 0xcf692694),
        	        X64Word_create(0xe49b69c1, 0x9ef14ad2), X64Word_create(0xefbe4786, 0x384f25e3),
        	        X64Word_create(0x0fc19dc6, 0x8b8cd5b5), X64Word_create(0x240ca1cc, 0x77ac9c65),
        	        X64Word_create(0x2de92c6f, 0x592b0275), X64Word_create(0x4a7484aa, 0x6ea6e483),
        	        X64Word_create(0x5cb0a9dc, 0xbd41fbd4), X64Word_create(0x76f988da, 0x831153b5),
        	        X64Word_create(0x983e5152, 0xee66dfab), X64Word_create(0xa831c66d, 0x2db43210),
        	        X64Word_create(0xb00327c8, 0x98fb213f), X64Word_create(0xbf597fc7, 0xbeef0ee4),
        	        X64Word_create(0xc6e00bf3, 0x3da88fc2), X64Word_create(0xd5a79147, 0x930aa725),
        	        X64Word_create(0x06ca6351, 0xe003826f), X64Word_create(0x14292967, 0x0a0e6e70),
        	        X64Word_create(0x27b70a85, 0x46d22ffc), X64Word_create(0x2e1b2138, 0x5c26c926),
        	        X64Word_create(0x4d2c6dfc, 0x5ac42aed), X64Word_create(0x53380d13, 0x9d95b3df),
        	        X64Word_create(0x650a7354, 0x8baf63de), X64Word_create(0x766a0abb, 0x3c77b2a8),
        	        X64Word_create(0x81c2c92e, 0x47edaee6), X64Word_create(0x92722c85, 0x1482353b),
        	        X64Word_create(0xa2bfe8a1, 0x4cf10364), X64Word_create(0xa81a664b, 0xbc423001),
        	        X64Word_create(0xc24b8b70, 0xd0f89791), X64Word_create(0xc76c51a3, 0x0654be30),
        	        X64Word_create(0xd192e819, 0xd6ef5218), X64Word_create(0xd6990624, 0x5565a910),
        	        X64Word_create(0xf40e3585, 0x5771202a), X64Word_create(0x106aa070, 0x32bbd1b8),
        	        X64Word_create(0x19a4c116, 0xb8d2d0c8), X64Word_create(0x1e376c08, 0x5141ab53),
        	        X64Word_create(0x2748774c, 0xdf8eeb99), X64Word_create(0x34b0bcb5, 0xe19b48a8),
        	        X64Word_create(0x391c0cb3, 0xc5c95a63), X64Word_create(0x4ed8aa4a, 0xe3418acb),
        	        X64Word_create(0x5b9cca4f, 0x7763e373), X64Word_create(0x682e6ff3, 0xd6b2b8a3),
        	        X64Word_create(0x748f82ee, 0x5defb2fc), X64Word_create(0x78a5636f, 0x43172f60),
        	        X64Word_create(0x84c87814, 0xa1f0ab72), X64Word_create(0x8cc70208, 0x1a6439ec),
        	        X64Word_create(0x90befffa, 0x23631e28), X64Word_create(0xa4506ceb, 0xde82bde9),
        	        X64Word_create(0xbef9a3f7, 0xb2c67915), X64Word_create(0xc67178f2, 0xe372532b),
        	        X64Word_create(0xca273ece, 0xea26619c), X64Word_create(0xd186b8c7, 0x21c0c207),
        	        X64Word_create(0xeada7dd6, 0xcde0eb1e), X64Word_create(0xf57d4f7f, 0xee6ed178),
        	        X64Word_create(0x06f067aa, 0x72176fba), X64Word_create(0x0a637dc5, 0xa2c898a6),
        	        X64Word_create(0x113f9804, 0xbef90dae), X64Word_create(0x1b710b35, 0x131c471b),
        	        X64Word_create(0x28db77f5, 0x23047d84), X64Word_create(0x32caab7b, 0x40c72493),
        	        X64Word_create(0x3c9ebe0a, 0x15c9bebc), X64Word_create(0x431d67c4, 0x9c100d4c),
        	        X64Word_create(0x4cc5d4be, 0xcb3e42b6), X64Word_create(0x597f299c, 0xfc657e2a),
        	        X64Word_create(0x5fcb6fab, 0x3ad6faec), X64Word_create(0x6c44198c, 0x4a475817)
        	    ];

        	    // Reusable objects
        	    var W = [];
        	    (function () {
        	        for (var i = 0; i < 80; i++) {
        	            W[i] = X64Word_create();
        	        }
        	    }());

        	    /**
        	     * SHA-512 hash algorithm.
        	     */
        	    var SHA512 = C_algo.SHA512 = Hasher.extend({
        	        _doReset: function () {
        	            this._hash = new X64WordArray.init([
        	                new X64Word.init(0x6a09e667, 0xf3bcc908), new X64Word.init(0xbb67ae85, 0x84caa73b),
        	                new X64Word.init(0x3c6ef372, 0xfe94f82b), new X64Word.init(0xa54ff53a, 0x5f1d36f1),
        	                new X64Word.init(0x510e527f, 0xade682d1), new X64Word.init(0x9b05688c, 0x2b3e6c1f),
        	                new X64Word.init(0x1f83d9ab, 0xfb41bd6b), new X64Word.init(0x5be0cd19, 0x137e2179)
        	            ]);
        	        },

        	        _doProcessBlock: function (M, offset) {
        	            // Shortcuts
        	            var H = this._hash.words;

        	            var H0 = H[0];
        	            var H1 = H[1];
        	            var H2 = H[2];
        	            var H3 = H[3];
        	            var H4 = H[4];
        	            var H5 = H[5];
        	            var H6 = H[6];
        	            var H7 = H[7];

        	            var H0h = H0.high;
        	            var H0l = H0.low;
        	            var H1h = H1.high;
        	            var H1l = H1.low;
        	            var H2h = H2.high;
        	            var H2l = H2.low;
        	            var H3h = H3.high;
        	            var H3l = H3.low;
        	            var H4h = H4.high;
        	            var H4l = H4.low;
        	            var H5h = H5.high;
        	            var H5l = H5.low;
        	            var H6h = H6.high;
        	            var H6l = H6.low;
        	            var H7h = H7.high;
        	            var H7l = H7.low;

        	            // Working variables
        	            var ah = H0h;
        	            var al = H0l;
        	            var bh = H1h;
        	            var bl = H1l;
        	            var ch = H2h;
        	            var cl = H2l;
        	            var dh = H3h;
        	            var dl = H3l;
        	            var eh = H4h;
        	            var el = H4l;
        	            var fh = H5h;
        	            var fl = H5l;
        	            var gh = H6h;
        	            var gl = H6l;
        	            var hh = H7h;
        	            var hl = H7l;

        	            // Rounds
        	            for (var i = 0; i < 80; i++) {
        	                // Shortcut
        	                var Wi = W[i];

        	                // Extend message
        	                if (i < 16) {
        	                    var Wih = Wi.high = M[offset + i * 2]     | 0;
        	                    var Wil = Wi.low  = M[offset + i * 2 + 1] | 0;
        	                } else {
        	                    // Gamma0
        	                    var gamma0x  = W[i - 15];
        	                    var gamma0xh = gamma0x.high;
        	                    var gamma0xl = gamma0x.low;
        	                    var gamma0h  = ((gamma0xh >>> 1) | (gamma0xl << 31)) ^ ((gamma0xh >>> 8) | (gamma0xl << 24)) ^ (gamma0xh >>> 7);
        	                    var gamma0l  = ((gamma0xl >>> 1) | (gamma0xh << 31)) ^ ((gamma0xl >>> 8) | (gamma0xh << 24)) ^ ((gamma0xl >>> 7) | (gamma0xh << 25));

        	                    // Gamma1
        	                    var gamma1x  = W[i - 2];
        	                    var gamma1xh = gamma1x.high;
        	                    var gamma1xl = gamma1x.low;
        	                    var gamma1h  = ((gamma1xh >>> 19) | (gamma1xl << 13)) ^ ((gamma1xh << 3) | (gamma1xl >>> 29)) ^ (gamma1xh >>> 6);
        	                    var gamma1l  = ((gamma1xl >>> 19) | (gamma1xh << 13)) ^ ((gamma1xl << 3) | (gamma1xh >>> 29)) ^ ((gamma1xl >>> 6) | (gamma1xh << 26));

        	                    // W[i] = gamma0 + W[i - 7] + gamma1 + W[i - 16]
        	                    var Wi7  = W[i - 7];
        	                    var Wi7h = Wi7.high;
        	                    var Wi7l = Wi7.low;

        	                    var Wi16  = W[i - 16];
        	                    var Wi16h = Wi16.high;
        	                    var Wi16l = Wi16.low;

        	                    var Wil = gamma0l + Wi7l;
        	                    var Wih = gamma0h + Wi7h + ((Wil >>> 0) < (gamma0l >>> 0) ? 1 : 0);
        	                    var Wil = Wil + gamma1l;
        	                    var Wih = Wih + gamma1h + ((Wil >>> 0) < (gamma1l >>> 0) ? 1 : 0);
        	                    var Wil = Wil + Wi16l;
        	                    var Wih = Wih + Wi16h + ((Wil >>> 0) < (Wi16l >>> 0) ? 1 : 0);

        	                    Wi.high = Wih;
        	                    Wi.low  = Wil;
        	                }

        	                var chh  = (eh & fh) ^ (~eh & gh);
        	                var chl  = (el & fl) ^ (~el & gl);
        	                var majh = (ah & bh) ^ (ah & ch) ^ (bh & ch);
        	                var majl = (al & bl) ^ (al & cl) ^ (bl & cl);

        	                var sigma0h = ((ah >>> 28) | (al << 4))  ^ ((ah << 30)  | (al >>> 2)) ^ ((ah << 25) | (al >>> 7));
        	                var sigma0l = ((al >>> 28) | (ah << 4))  ^ ((al << 30)  | (ah >>> 2)) ^ ((al << 25) | (ah >>> 7));
        	                var sigma1h = ((eh >>> 14) | (el << 18)) ^ ((eh >>> 18) | (el << 14)) ^ ((eh << 23) | (el >>> 9));
        	                var sigma1l = ((el >>> 14) | (eh << 18)) ^ ((el >>> 18) | (eh << 14)) ^ ((el << 23) | (eh >>> 9));

        	                // t1 = h + sigma1 + ch + K[i] + W[i]
        	                var Ki  = K[i];
        	                var Kih = Ki.high;
        	                var Kil = Ki.low;

        	                var t1l = hl + sigma1l;
        	                var t1h = hh + sigma1h + ((t1l >>> 0) < (hl >>> 0) ? 1 : 0);
        	                var t1l = t1l + chl;
        	                var t1h = t1h + chh + ((t1l >>> 0) < (chl >>> 0) ? 1 : 0);
        	                var t1l = t1l + Kil;
        	                var t1h = t1h + Kih + ((t1l >>> 0) < (Kil >>> 0) ? 1 : 0);
        	                var t1l = t1l + Wil;
        	                var t1h = t1h + Wih + ((t1l >>> 0) < (Wil >>> 0) ? 1 : 0);

        	                // t2 = sigma0 + maj
        	                var t2l = sigma0l + majl;
        	                var t2h = sigma0h + majh + ((t2l >>> 0) < (sigma0l >>> 0) ? 1 : 0);

        	                // Update working variables
        	                hh = gh;
        	                hl = gl;
        	                gh = fh;
        	                gl = fl;
        	                fh = eh;
        	                fl = el;
        	                el = (dl + t1l) | 0;
        	                eh = (dh + t1h + ((el >>> 0) < (dl >>> 0) ? 1 : 0)) | 0;
        	                dh = ch;
        	                dl = cl;
        	                ch = bh;
        	                cl = bl;
        	                bh = ah;
        	                bl = al;
        	                al = (t1l + t2l) | 0;
        	                ah = (t1h + t2h + ((al >>> 0) < (t1l >>> 0) ? 1 : 0)) | 0;
        	            }

        	            // Intermediate hash value
        	            H0l = H0.low  = (H0l + al);
        	            H0.high = (H0h + ah + ((H0l >>> 0) < (al >>> 0) ? 1 : 0));
        	            H1l = H1.low  = (H1l + bl);
        	            H1.high = (H1h + bh + ((H1l >>> 0) < (bl >>> 0) ? 1 : 0));
        	            H2l = H2.low  = (H2l + cl);
        	            H2.high = (H2h + ch + ((H2l >>> 0) < (cl >>> 0) ? 1 : 0));
        	            H3l = H3.low  = (H3l + dl);
        	            H3.high = (H3h + dh + ((H3l >>> 0) < (dl >>> 0) ? 1 : 0));
        	            H4l = H4.low  = (H4l + el);
        	            H4.high = (H4h + eh + ((H4l >>> 0) < (el >>> 0) ? 1 : 0));
        	            H5l = H5.low  = (H5l + fl);
        	            H5.high = (H5h + fh + ((H5l >>> 0) < (fl >>> 0) ? 1 : 0));
        	            H6l = H6.low  = (H6l + gl);
        	            H6.high = (H6h + gh + ((H6l >>> 0) < (gl >>> 0) ? 1 : 0));
        	            H7l = H7.low  = (H7l + hl);
        	            H7.high = (H7h + hh + ((H7l >>> 0) < (hl >>> 0) ? 1 : 0));
        	        },

        	        _doFinalize: function () {
        	            // Shortcuts
        	            var data = this._data;
        	            var dataWords = data.words;

        	            var nBitsTotal = this._nDataBytes * 8;
        	            var nBitsLeft = data.sigBytes * 8;

        	            // Add padding
        	            dataWords[nBitsLeft >>> 5] |= 0x80 << (24 - nBitsLeft % 32);
        	            dataWords[(((nBitsLeft + 128) >>> 10) << 5) + 30] = Math.floor(nBitsTotal / 0x100000000);
        	            dataWords[(((nBitsLeft + 128) >>> 10) << 5) + 31] = nBitsTotal;
        	            data.sigBytes = dataWords.length * 4;

        	            // Hash final blocks
        	            this._process();

        	            // Convert hash to 32-bit word array before returning
        	            var hash = this._hash.toX32();

        	            // Return final computed hash
        	            return hash;
        	        },

        	        clone: function () {
        	            var clone = Hasher.clone.call(this);
        	            clone._hash = this._hash.clone();

        	            return clone;
        	        },

        	        blockSize: 1024/32
        	    });

        	    /**
        	     * Shortcut function to the hasher's object interface.
        	     *
        	     * @param {WordArray|string} message The message to hash.
        	     *
        	     * @return {WordArray} The hash.
        	     *
        	     * @static
        	     *
        	     * @example
        	     *
        	     *     var hash = CryptoJS.SHA512('message');
        	     *     var hash = CryptoJS.SHA512(wordArray);
        	     */
        	    C.SHA512 = Hasher._createHelper(SHA512);

        	    /**
        	     * Shortcut function to the HMAC's object interface.
        	     *
        	     * @param {WordArray|string} message The message to hash.
        	     * @param {WordArray|string} key The secret key.
        	     *
        	     * @return {WordArray} The HMAC.
        	     *
        	     * @static
        	     *
        	     * @example
        	     *
        	     *     var hmac = CryptoJS.HmacSHA512(message, key);
        	     */
        	    C.HmacSHA512 = Hasher._createHmacHelper(SHA512);
        	}());


        	return CryptoJS.SHA512;

        }));
        });

        var sha384 = createCommonjsModule(function (module, exports) {
        (function (root, factory, undef) {
        	{
        		// CommonJS
        		module.exports = exports = factory(core, x64Core, sha512);
        	}
        }(commonjsGlobal, function (CryptoJS) {

        	(function () {
        	    // Shortcuts
        	    var C = CryptoJS;
        	    var C_x64 = C.x64;
        	    var X64Word = C_x64.Word;
        	    var X64WordArray = C_x64.WordArray;
        	    var C_algo = C.algo;
        	    var SHA512 = C_algo.SHA512;

        	    /**
        	     * SHA-384 hash algorithm.
        	     */
        	    var SHA384 = C_algo.SHA384 = SHA512.extend({
        	        _doReset: function () {
        	            this._hash = new X64WordArray.init([
        	                new X64Word.init(0xcbbb9d5d, 0xc1059ed8), new X64Word.init(0x629a292a, 0x367cd507),
        	                new X64Word.init(0x9159015a, 0x3070dd17), new X64Word.init(0x152fecd8, 0xf70e5939),
        	                new X64Word.init(0x67332667, 0xffc00b31), new X64Word.init(0x8eb44a87, 0x68581511),
        	                new X64Word.init(0xdb0c2e0d, 0x64f98fa7), new X64Word.init(0x47b5481d, 0xbefa4fa4)
        	            ]);
        	        },

        	        _doFinalize: function () {
        	            var hash = SHA512._doFinalize.call(this);

        	            hash.sigBytes -= 16;

        	            return hash;
        	        }
        	    });

        	    /**
        	     * Shortcut function to the hasher's object interface.
        	     *
        	     * @param {WordArray|string} message The message to hash.
        	     *
        	     * @return {WordArray} The hash.
        	     *
        	     * @static
        	     *
        	     * @example
        	     *
        	     *     var hash = CryptoJS.SHA384('message');
        	     *     var hash = CryptoJS.SHA384(wordArray);
        	     */
        	    C.SHA384 = SHA512._createHelper(SHA384);

        	    /**
        	     * Shortcut function to the HMAC's object interface.
        	     *
        	     * @param {WordArray|string} message The message to hash.
        	     * @param {WordArray|string} key The secret key.
        	     *
        	     * @return {WordArray} The HMAC.
        	     *
        	     * @static
        	     *
        	     * @example
        	     *
        	     *     var hmac = CryptoJS.HmacSHA384(message, key);
        	     */
        	    C.HmacSHA384 = SHA512._createHmacHelper(SHA384);
        	}());


        	return CryptoJS.SHA384;

        }));
        });

        var sha3 = createCommonjsModule(function (module, exports) {
        (function (root, factory, undef) {
        	{
        		// CommonJS
        		module.exports = exports = factory(core, x64Core);
        	}
        }(commonjsGlobal, function (CryptoJS) {

        	(function (Math) {
        	    // Shortcuts
        	    var C = CryptoJS;
        	    var C_lib = C.lib;
        	    var WordArray = C_lib.WordArray;
        	    var Hasher = C_lib.Hasher;
        	    var C_x64 = C.x64;
        	    var X64Word = C_x64.Word;
        	    var C_algo = C.algo;

        	    // Constants tables
        	    var RHO_OFFSETS = [];
        	    var PI_INDEXES  = [];
        	    var ROUND_CONSTANTS = [];

        	    // Compute Constants
        	    (function () {
        	        // Compute rho offset constants
        	        var x = 1, y = 0;
        	        for (var t = 0; t < 24; t++) {
        	            RHO_OFFSETS[x + 5 * y] = ((t + 1) * (t + 2) / 2) % 64;

        	            var newX = y % 5;
        	            var newY = (2 * x + 3 * y) % 5;
        	            x = newX;
        	            y = newY;
        	        }

        	        // Compute pi index constants
        	        for (var x = 0; x < 5; x++) {
        	            for (var y = 0; y < 5; y++) {
        	                PI_INDEXES[x + 5 * y] = y + ((2 * x + 3 * y) % 5) * 5;
        	            }
        	        }

        	        // Compute round constants
        	        var LFSR = 0x01;
        	        for (var i = 0; i < 24; i++) {
        	            var roundConstantMsw = 0;
        	            var roundConstantLsw = 0;

        	            for (var j = 0; j < 7; j++) {
        	                if (LFSR & 0x01) {
        	                    var bitPosition = (1 << j) - 1;
        	                    if (bitPosition < 32) {
        	                        roundConstantLsw ^= 1 << bitPosition;
        	                    } else /* if (bitPosition >= 32) */ {
        	                        roundConstantMsw ^= 1 << (bitPosition - 32);
        	                    }
        	                }

        	                // Compute next LFSR
        	                if (LFSR & 0x80) {
        	                    // Primitive polynomial over GF(2): x^8 + x^6 + x^5 + x^4 + 1
        	                    LFSR = (LFSR << 1) ^ 0x71;
        	                } else {
        	                    LFSR <<= 1;
        	                }
        	            }

        	            ROUND_CONSTANTS[i] = X64Word.create(roundConstantMsw, roundConstantLsw);
        	        }
        	    }());

        	    // Reusable objects for temporary values
        	    var T = [];
        	    (function () {
        	        for (var i = 0; i < 25; i++) {
        	            T[i] = X64Word.create();
        	        }
        	    }());

        	    /**
        	     * SHA-3 hash algorithm.
        	     */
        	    var SHA3 = C_algo.SHA3 = Hasher.extend({
        	        /**
        	         * Configuration options.
        	         *
        	         * @property {number} outputLength
        	         *   The desired number of bits in the output hash.
        	         *   Only values permitted are: 224, 256, 384, 512.
        	         *   Default: 512
        	         */
        	        cfg: Hasher.cfg.extend({
        	            outputLength: 512
        	        }),

        	        _doReset: function () {
        	            var state = this._state = [];
        	            for (var i = 0; i < 25; i++) {
        	                state[i] = new X64Word.init();
        	            }

        	            this.blockSize = (1600 - 2 * this.cfg.outputLength) / 32;
        	        },

        	        _doProcessBlock: function (M, offset) {
        	            // Shortcuts
        	            var state = this._state;
        	            var nBlockSizeLanes = this.blockSize / 2;

        	            // Absorb
        	            for (var i = 0; i < nBlockSizeLanes; i++) {
        	                // Shortcuts
        	                var M2i  = M[offset + 2 * i];
        	                var M2i1 = M[offset + 2 * i + 1];

        	                // Swap endian
        	                M2i = (
        	                    (((M2i << 8)  | (M2i >>> 24)) & 0x00ff00ff) |
        	                    (((M2i << 24) | (M2i >>> 8))  & 0xff00ff00)
        	                );
        	                M2i1 = (
        	                    (((M2i1 << 8)  | (M2i1 >>> 24)) & 0x00ff00ff) |
        	                    (((M2i1 << 24) | (M2i1 >>> 8))  & 0xff00ff00)
        	                );

        	                // Absorb message into state
        	                var lane = state[i];
        	                lane.high ^= M2i1;
        	                lane.low  ^= M2i;
        	            }

        	            // Rounds
        	            for (var round = 0; round < 24; round++) {
        	                // Theta
        	                for (var x = 0; x < 5; x++) {
        	                    // Mix column lanes
        	                    var tMsw = 0, tLsw = 0;
        	                    for (var y = 0; y < 5; y++) {
        	                        var lane = state[x + 5 * y];
        	                        tMsw ^= lane.high;
        	                        tLsw ^= lane.low;
        	                    }

        	                    // Temporary values
        	                    var Tx = T[x];
        	                    Tx.high = tMsw;
        	                    Tx.low  = tLsw;
        	                }
        	                for (var x = 0; x < 5; x++) {
        	                    // Shortcuts
        	                    var Tx4 = T[(x + 4) % 5];
        	                    var Tx1 = T[(x + 1) % 5];
        	                    var Tx1Msw = Tx1.high;
        	                    var Tx1Lsw = Tx1.low;

        	                    // Mix surrounding columns
        	                    var tMsw = Tx4.high ^ ((Tx1Msw << 1) | (Tx1Lsw >>> 31));
        	                    var tLsw = Tx4.low  ^ ((Tx1Lsw << 1) | (Tx1Msw >>> 31));
        	                    for (var y = 0; y < 5; y++) {
        	                        var lane = state[x + 5 * y];
        	                        lane.high ^= tMsw;
        	                        lane.low  ^= tLsw;
        	                    }
        	                }

        	                // Rho Pi
        	                for (var laneIndex = 1; laneIndex < 25; laneIndex++) {
        	                    // Shortcuts
        	                    var lane = state[laneIndex];
        	                    var laneMsw = lane.high;
        	                    var laneLsw = lane.low;
        	                    var rhoOffset = RHO_OFFSETS[laneIndex];

        	                    // Rotate lanes
        	                    if (rhoOffset < 32) {
        	                        var tMsw = (laneMsw << rhoOffset) | (laneLsw >>> (32 - rhoOffset));
        	                        var tLsw = (laneLsw << rhoOffset) | (laneMsw >>> (32 - rhoOffset));
        	                    } else /* if (rhoOffset >= 32) */ {
        	                        var tMsw = (laneLsw << (rhoOffset - 32)) | (laneMsw >>> (64 - rhoOffset));
        	                        var tLsw = (laneMsw << (rhoOffset - 32)) | (laneLsw >>> (64 - rhoOffset));
        	                    }

        	                    // Transpose lanes
        	                    var TPiLane = T[PI_INDEXES[laneIndex]];
        	                    TPiLane.high = tMsw;
        	                    TPiLane.low  = tLsw;
        	                }

        	                // Rho pi at x = y = 0
        	                var T0 = T[0];
        	                var state0 = state[0];
        	                T0.high = state0.high;
        	                T0.low  = state0.low;

        	                // Chi
        	                for (var x = 0; x < 5; x++) {
        	                    for (var y = 0; y < 5; y++) {
        	                        // Shortcuts
        	                        var laneIndex = x + 5 * y;
        	                        var lane = state[laneIndex];
        	                        var TLane = T[laneIndex];
        	                        var Tx1Lane = T[((x + 1) % 5) + 5 * y];
        	                        var Tx2Lane = T[((x + 2) % 5) + 5 * y];

        	                        // Mix rows
        	                        lane.high = TLane.high ^ (~Tx1Lane.high & Tx2Lane.high);
        	                        lane.low  = TLane.low  ^ (~Tx1Lane.low  & Tx2Lane.low);
        	                    }
        	                }

        	                // Iota
        	                var lane = state[0];
        	                var roundConstant = ROUND_CONSTANTS[round];
        	                lane.high ^= roundConstant.high;
        	                lane.low  ^= roundConstant.low;	            }
        	        },

        	        _doFinalize: function () {
        	            // Shortcuts
        	            var data = this._data;
        	            var dataWords = data.words;
        	            var nBitsTotal = this._nDataBytes * 8;
        	            var nBitsLeft = data.sigBytes * 8;
        	            var blockSizeBits = this.blockSize * 32;

        	            // Add padding
        	            dataWords[nBitsLeft >>> 5] |= 0x1 << (24 - nBitsLeft % 32);
        	            dataWords[((Math.ceil((nBitsLeft + 1) / blockSizeBits) * blockSizeBits) >>> 5) - 1] |= 0x80;
        	            data.sigBytes = dataWords.length * 4;

        	            // Hash final blocks
        	            this._process();

        	            // Shortcuts
        	            var state = this._state;
        	            var outputLengthBytes = this.cfg.outputLength / 8;
        	            var outputLengthLanes = outputLengthBytes / 8;

        	            // Squeeze
        	            var hashWords = [];
        	            for (var i = 0; i < outputLengthLanes; i++) {
        	                // Shortcuts
        	                var lane = state[i];
        	                var laneMsw = lane.high;
        	                var laneLsw = lane.low;

        	                // Swap endian
        	                laneMsw = (
        	                    (((laneMsw << 8)  | (laneMsw >>> 24)) & 0x00ff00ff) |
        	                    (((laneMsw << 24) | (laneMsw >>> 8))  & 0xff00ff00)
        	                );
        	                laneLsw = (
        	                    (((laneLsw << 8)  | (laneLsw >>> 24)) & 0x00ff00ff) |
        	                    (((laneLsw << 24) | (laneLsw >>> 8))  & 0xff00ff00)
        	                );

        	                // Squeeze state to retrieve hash
        	                hashWords.push(laneLsw);
        	                hashWords.push(laneMsw);
        	            }

        	            // Return final computed hash
        	            return new WordArray.init(hashWords, outputLengthBytes);
        	        },

        	        clone: function () {
        	            var clone = Hasher.clone.call(this);

        	            var state = clone._state = this._state.slice(0);
        	            for (var i = 0; i < 25; i++) {
        	                state[i] = state[i].clone();
        	            }

        	            return clone;
        	        }
        	    });

        	    /**
        	     * Shortcut function to the hasher's object interface.
        	     *
        	     * @param {WordArray|string} message The message to hash.
        	     *
        	     * @return {WordArray} The hash.
        	     *
        	     * @static
        	     *
        	     * @example
        	     *
        	     *     var hash = CryptoJS.SHA3('message');
        	     *     var hash = CryptoJS.SHA3(wordArray);
        	     */
        	    C.SHA3 = Hasher._createHelper(SHA3);

        	    /**
        	     * Shortcut function to the HMAC's object interface.
        	     *
        	     * @param {WordArray|string} message The message to hash.
        	     * @param {WordArray|string} key The secret key.
        	     *
        	     * @return {WordArray} The HMAC.
        	     *
        	     * @static
        	     *
        	     * @example
        	     *
        	     *     var hmac = CryptoJS.HmacSHA3(message, key);
        	     */
        	    C.HmacSHA3 = Hasher._createHmacHelper(SHA3);
        	}(Math));


        	return CryptoJS.SHA3;

        }));
        });

        var ripemd160 = createCommonjsModule(function (module, exports) {
        (function (root, factory) {
        	{
        		// CommonJS
        		module.exports = exports = factory(core);
        	}
        }(commonjsGlobal, function (CryptoJS) {

        	/** @preserve
        	(c) 2012 by Cédric Mesnil. All rights reserved.

        	Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

        	    - Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
        	    - Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

        	THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
        	*/

        	(function (Math) {
        	    // Shortcuts
        	    var C = CryptoJS;
        	    var C_lib = C.lib;
        	    var WordArray = C_lib.WordArray;
        	    var Hasher = C_lib.Hasher;
        	    var C_algo = C.algo;

        	    // Constants table
        	    var _zl = WordArray.create([
        	        0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14, 15,
        	        7,  4, 13,  1, 10,  6, 15,  3, 12,  0,  9,  5,  2, 14, 11,  8,
        	        3, 10, 14,  4,  9, 15,  8,  1,  2,  7,  0,  6, 13, 11,  5, 12,
        	        1,  9, 11, 10,  0,  8, 12,  4, 13,  3,  7, 15, 14,  5,  6,  2,
        	        4,  0,  5,  9,  7, 12,  2, 10, 14,  1,  3,  8, 11,  6, 15, 13]);
        	    var _zr = WordArray.create([
        	        5, 14,  7,  0,  9,  2, 11,  4, 13,  6, 15,  8,  1, 10,  3, 12,
        	        6, 11,  3,  7,  0, 13,  5, 10, 14, 15,  8, 12,  4,  9,  1,  2,
        	        15,  5,  1,  3,  7, 14,  6,  9, 11,  8, 12,  2, 10,  0,  4, 13,
        	        8,  6,  4,  1,  3, 11, 15,  0,  5, 12,  2, 13,  9,  7, 10, 14,
        	        12, 15, 10,  4,  1,  5,  8,  7,  6,  2, 13, 14,  0,  3,  9, 11]);
        	    var _sl = WordArray.create([
        	         11, 14, 15, 12,  5,  8,  7,  9, 11, 13, 14, 15,  6,  7,  9,  8,
        	        7, 6,   8, 13, 11,  9,  7, 15,  7, 12, 15,  9, 11,  7, 13, 12,
        	        11, 13,  6,  7, 14,  9, 13, 15, 14,  8, 13,  6,  5, 12,  7,  5,
        	          11, 12, 14, 15, 14, 15,  9,  8,  9, 14,  5,  6,  8,  6,  5, 12,
        	        9, 15,  5, 11,  6,  8, 13, 12,  5, 12, 13, 14, 11,  8,  5,  6 ]);
        	    var _sr = WordArray.create([
        	        8,  9,  9, 11, 13, 15, 15,  5,  7,  7,  8, 11, 14, 14, 12,  6,
        	        9, 13, 15,  7, 12,  8,  9, 11,  7,  7, 12,  7,  6, 15, 13, 11,
        	        9,  7, 15, 11,  8,  6,  6, 14, 12, 13,  5, 14, 13, 13,  7,  5,
        	        15,  5,  8, 11, 14, 14,  6, 14,  6,  9, 12,  9, 12,  5, 15,  8,
        	        8,  5, 12,  9, 12,  5, 14,  6,  8, 13,  6,  5, 15, 13, 11, 11 ]);

        	    var _hl =  WordArray.create([ 0x00000000, 0x5A827999, 0x6ED9EBA1, 0x8F1BBCDC, 0xA953FD4E]);
        	    var _hr =  WordArray.create([ 0x50A28BE6, 0x5C4DD124, 0x6D703EF3, 0x7A6D76E9, 0x00000000]);

        	    /**
        	     * RIPEMD160 hash algorithm.
        	     */
        	    var RIPEMD160 = C_algo.RIPEMD160 = Hasher.extend({
        	        _doReset: function () {
        	            this._hash  = WordArray.create([0x67452301, 0xEFCDAB89, 0x98BADCFE, 0x10325476, 0xC3D2E1F0]);
        	        },

        	        _doProcessBlock: function (M, offset) {

        	            // Swap endian
        	            for (var i = 0; i < 16; i++) {
        	                // Shortcuts
        	                var offset_i = offset + i;
        	                var M_offset_i = M[offset_i];

        	                // Swap
        	                M[offset_i] = (
        	                    (((M_offset_i << 8)  | (M_offset_i >>> 24)) & 0x00ff00ff) |
        	                    (((M_offset_i << 24) | (M_offset_i >>> 8))  & 0xff00ff00)
        	                );
        	            }
        	            // Shortcut
        	            var H  = this._hash.words;
        	            var hl = _hl.words;
        	            var hr = _hr.words;
        	            var zl = _zl.words;
        	            var zr = _zr.words;
        	            var sl = _sl.words;
        	            var sr = _sr.words;

        	            // Working variables
        	            var al, bl, cl, dl, el;
        	            var ar, br, cr, dr, er;

        	            ar = al = H[0];
        	            br = bl = H[1];
        	            cr = cl = H[2];
        	            dr = dl = H[3];
        	            er = el = H[4];
        	            // Computation
        	            var t;
        	            for (var i = 0; i < 80; i += 1) {
        	                t = (al +  M[offset+zl[i]])|0;
        	                if (i<16){
        		            t +=  f1(bl,cl,dl) + hl[0];
        	                } else if (i<32) {
        		            t +=  f2(bl,cl,dl) + hl[1];
        	                } else if (i<48) {
        		            t +=  f3(bl,cl,dl) + hl[2];
        	                } else if (i<64) {
        		            t +=  f4(bl,cl,dl) + hl[3];
        	                } else {// if (i<80) {
        		            t +=  f5(bl,cl,dl) + hl[4];
        	                }
        	                t = t|0;
        	                t =  rotl(t,sl[i]);
        	                t = (t+el)|0;
        	                al = el;
        	                el = dl;
        	                dl = rotl(cl, 10);
        	                cl = bl;
        	                bl = t;

        	                t = (ar + M[offset+zr[i]])|0;
        	                if (i<16){
        		            t +=  f5(br,cr,dr) + hr[0];
        	                } else if (i<32) {
        		            t +=  f4(br,cr,dr) + hr[1];
        	                } else if (i<48) {
        		            t +=  f3(br,cr,dr) + hr[2];
        	                } else if (i<64) {
        		            t +=  f2(br,cr,dr) + hr[3];
        	                } else {// if (i<80) {
        		            t +=  f1(br,cr,dr) + hr[4];
        	                }
        	                t = t|0;
        	                t =  rotl(t,sr[i]) ;
        	                t = (t+er)|0;
        	                ar = er;
        	                er = dr;
        	                dr = rotl(cr, 10);
        	                cr = br;
        	                br = t;
        	            }
        	            // Intermediate hash value
        	            t    = (H[1] + cl + dr)|0;
        	            H[1] = (H[2] + dl + er)|0;
        	            H[2] = (H[3] + el + ar)|0;
        	            H[3] = (H[4] + al + br)|0;
        	            H[4] = (H[0] + bl + cr)|0;
        	            H[0] =  t;
        	        },

        	        _doFinalize: function () {
        	            // Shortcuts
        	            var data = this._data;
        	            var dataWords = data.words;

        	            var nBitsTotal = this._nDataBytes * 8;
        	            var nBitsLeft = data.sigBytes * 8;

        	            // Add padding
        	            dataWords[nBitsLeft >>> 5] |= 0x80 << (24 - nBitsLeft % 32);
        	            dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 14] = (
        	                (((nBitsTotal << 8)  | (nBitsTotal >>> 24)) & 0x00ff00ff) |
        	                (((nBitsTotal << 24) | (nBitsTotal >>> 8))  & 0xff00ff00)
        	            );
        	            data.sigBytes = (dataWords.length + 1) * 4;

        	            // Hash final blocks
        	            this._process();

        	            // Shortcuts
        	            var hash = this._hash;
        	            var H = hash.words;

        	            // Swap endian
        	            for (var i = 0; i < 5; i++) {
        	                // Shortcut
        	                var H_i = H[i];

        	                // Swap
        	                H[i] = (((H_i << 8)  | (H_i >>> 24)) & 0x00ff00ff) |
        	                       (((H_i << 24) | (H_i >>> 8))  & 0xff00ff00);
        	            }

        	            // Return final computed hash
        	            return hash;
        	        },

        	        clone: function () {
        	            var clone = Hasher.clone.call(this);
        	            clone._hash = this._hash.clone();

        	            return clone;
        	        }
        	    });


        	    function f1(x, y, z) {
        	        return ((x) ^ (y) ^ (z));

        	    }

        	    function f2(x, y, z) {
        	        return (((x)&(y)) | ((~x)&(z)));
        	    }

        	    function f3(x, y, z) {
        	        return (((x) | (~(y))) ^ (z));
        	    }

        	    function f4(x, y, z) {
        	        return (((x) & (z)) | ((y)&(~(z))));
        	    }

        	    function f5(x, y, z) {
        	        return ((x) ^ ((y) |(~(z))));

        	    }

        	    function rotl(x,n) {
        	        return (x<<n) | (x>>>(32-n));
        	    }


        	    /**
        	     * Shortcut function to the hasher's object interface.
        	     *
        	     * @param {WordArray|string} message The message to hash.
        	     *
        	     * @return {WordArray} The hash.
        	     *
        	     * @static
        	     *
        	     * @example
        	     *
        	     *     var hash = CryptoJS.RIPEMD160('message');
        	     *     var hash = CryptoJS.RIPEMD160(wordArray);
        	     */
        	    C.RIPEMD160 = Hasher._createHelper(RIPEMD160);

        	    /**
        	     * Shortcut function to the HMAC's object interface.
        	     *
        	     * @param {WordArray|string} message The message to hash.
        	     * @param {WordArray|string} key The secret key.
        	     *
        	     * @return {WordArray} The HMAC.
        	     *
        	     * @static
        	     *
        	     * @example
        	     *
        	     *     var hmac = CryptoJS.HmacRIPEMD160(message, key);
        	     */
        	    C.HmacRIPEMD160 = Hasher._createHmacHelper(RIPEMD160);
        	}());


        	return CryptoJS.RIPEMD160;

        }));
        });

        var hmac = createCommonjsModule(function (module, exports) {
        (function (root, factory) {
        	{
        		// CommonJS
        		module.exports = exports = factory(core);
        	}
        }(commonjsGlobal, function (CryptoJS) {

        	(function () {
        	    // Shortcuts
        	    var C = CryptoJS;
        	    var C_lib = C.lib;
        	    var Base = C_lib.Base;
        	    var C_enc = C.enc;
        	    var Utf8 = C_enc.Utf8;
        	    var C_algo = C.algo;

        	    /**
        	     * HMAC algorithm.
        	     */
        	    var HMAC = C_algo.HMAC = Base.extend({
        	        /**
        	         * Initializes a newly created HMAC.
        	         *
        	         * @param {Hasher} hasher The hash algorithm to use.
        	         * @param {WordArray|string} key The secret key.
        	         *
        	         * @example
        	         *
        	         *     var hmacHasher = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA256, key);
        	         */
        	        init: function (hasher, key) {
        	            // Init hasher
        	            hasher = this._hasher = new hasher.init();

        	            // Convert string to WordArray, else assume WordArray already
        	            if (typeof key == 'string') {
        	                key = Utf8.parse(key);
        	            }

        	            // Shortcuts
        	            var hasherBlockSize = hasher.blockSize;
        	            var hasherBlockSizeBytes = hasherBlockSize * 4;

        	            // Allow arbitrary length keys
        	            if (key.sigBytes > hasherBlockSizeBytes) {
        	                key = hasher.finalize(key);
        	            }

        	            // Clamp excess bits
        	            key.clamp();

        	            // Clone key for inner and outer pads
        	            var oKey = this._oKey = key.clone();
        	            var iKey = this._iKey = key.clone();

        	            // Shortcuts
        	            var oKeyWords = oKey.words;
        	            var iKeyWords = iKey.words;

        	            // XOR keys with pad constants
        	            for (var i = 0; i < hasherBlockSize; i++) {
        	                oKeyWords[i] ^= 0x5c5c5c5c;
        	                iKeyWords[i] ^= 0x36363636;
        	            }
        	            oKey.sigBytes = iKey.sigBytes = hasherBlockSizeBytes;

        	            // Set initial values
        	            this.reset();
        	        },

        	        /**
        	         * Resets this HMAC to its initial state.
        	         *
        	         * @example
        	         *
        	         *     hmacHasher.reset();
        	         */
        	        reset: function () {
        	            // Shortcut
        	            var hasher = this._hasher;

        	            // Reset
        	            hasher.reset();
        	            hasher.update(this._iKey);
        	        },

        	        /**
        	         * Updates this HMAC with a message.
        	         *
        	         * @param {WordArray|string} messageUpdate The message to append.
        	         *
        	         * @return {HMAC} This HMAC instance.
        	         *
        	         * @example
        	         *
        	         *     hmacHasher.update('message');
        	         *     hmacHasher.update(wordArray);
        	         */
        	        update: function (messageUpdate) {
        	            this._hasher.update(messageUpdate);

        	            // Chainable
        	            return this;
        	        },

        	        /**
        	         * Finalizes the HMAC computation.
        	         * Note that the finalize operation is effectively a destructive, read-once operation.
        	         *
        	         * @param {WordArray|string} messageUpdate (Optional) A final message update.
        	         *
        	         * @return {WordArray} The HMAC.
        	         *
        	         * @example
        	         *
        	         *     var hmac = hmacHasher.finalize();
        	         *     var hmac = hmacHasher.finalize('message');
        	         *     var hmac = hmacHasher.finalize(wordArray);
        	         */
        	        finalize: function (messageUpdate) {
        	            // Shortcut
        	            var hasher = this._hasher;

        	            // Compute HMAC
        	            var innerHash = hasher.finalize(messageUpdate);
        	            hasher.reset();
        	            var hmac = hasher.finalize(this._oKey.clone().concat(innerHash));

        	            return hmac;
        	        }
        	    });
        	}());


        }));
        });

        var pbkdf2 = createCommonjsModule(function (module, exports) {
        (function (root, factory, undef) {
        	{
        		// CommonJS
        		module.exports = exports = factory(core, sha1, hmac);
        	}
        }(commonjsGlobal, function (CryptoJS) {

        	(function () {
        	    // Shortcuts
        	    var C = CryptoJS;
        	    var C_lib = C.lib;
        	    var Base = C_lib.Base;
        	    var WordArray = C_lib.WordArray;
        	    var C_algo = C.algo;
        	    var SHA1 = C_algo.SHA1;
        	    var HMAC = C_algo.HMAC;

        	    /**
        	     * Password-Based Key Derivation Function 2 algorithm.
        	     */
        	    var PBKDF2 = C_algo.PBKDF2 = Base.extend({
        	        /**
        	         * Configuration options.
        	         *
        	         * @property {number} keySize The key size in words to generate. Default: 4 (128 bits)
        	         * @property {Hasher} hasher The hasher to use. Default: SHA1
        	         * @property {number} iterations The number of iterations to perform. Default: 1
        	         */
        	        cfg: Base.extend({
        	            keySize: 128/32,
        	            hasher: SHA1,
        	            iterations: 1
        	        }),

        	        /**
        	         * Initializes a newly created key derivation function.
        	         *
        	         * @param {Object} cfg (Optional) The configuration options to use for the derivation.
        	         *
        	         * @example
        	         *
        	         *     var kdf = CryptoJS.algo.PBKDF2.create();
        	         *     var kdf = CryptoJS.algo.PBKDF2.create({ keySize: 8 });
        	         *     var kdf = CryptoJS.algo.PBKDF2.create({ keySize: 8, iterations: 1000 });
        	         */
        	        init: function (cfg) {
        	            this.cfg = this.cfg.extend(cfg);
        	        },

        	        /**
        	         * Computes the Password-Based Key Derivation Function 2.
        	         *
        	         * @param {WordArray|string} password The password.
        	         * @param {WordArray|string} salt A salt.
        	         *
        	         * @return {WordArray} The derived key.
        	         *
        	         * @example
        	         *
        	         *     var key = kdf.compute(password, salt);
        	         */
        	        compute: function (password, salt) {
        	            // Shortcut
        	            var cfg = this.cfg;

        	            // Init HMAC
        	            var hmac = HMAC.create(cfg.hasher, password);

        	            // Initial values
        	            var derivedKey = WordArray.create();
        	            var blockIndex = WordArray.create([0x00000001]);

        	            // Shortcuts
        	            var derivedKeyWords = derivedKey.words;
        	            var blockIndexWords = blockIndex.words;
        	            var keySize = cfg.keySize;
        	            var iterations = cfg.iterations;

        	            // Generate key
        	            while (derivedKeyWords.length < keySize) {
        	                var block = hmac.update(salt).finalize(blockIndex);
        	                hmac.reset();

        	                // Shortcuts
        	                var blockWords = block.words;
        	                var blockWordsLength = blockWords.length;

        	                // Iterations
        	                var intermediate = block;
        	                for (var i = 1; i < iterations; i++) {
        	                    intermediate = hmac.finalize(intermediate);
        	                    hmac.reset();

        	                    // Shortcut
        	                    var intermediateWords = intermediate.words;

        	                    // XOR intermediate with block
        	                    for (var j = 0; j < blockWordsLength; j++) {
        	                        blockWords[j] ^= intermediateWords[j];
        	                    }
        	                }

        	                derivedKey.concat(block);
        	                blockIndexWords[0]++;
        	            }
        	            derivedKey.sigBytes = keySize * 4;

        	            return derivedKey;
        	        }
        	    });

        	    /**
        	     * Computes the Password-Based Key Derivation Function 2.
        	     *
        	     * @param {WordArray|string} password The password.
        	     * @param {WordArray|string} salt A salt.
        	     * @param {Object} cfg (Optional) The configuration options to use for this computation.
        	     *
        	     * @return {WordArray} The derived key.
        	     *
        	     * @static
        	     *
        	     * @example
        	     *
        	     *     var key = CryptoJS.PBKDF2(password, salt);
        	     *     var key = CryptoJS.PBKDF2(password, salt, { keySize: 8 });
        	     *     var key = CryptoJS.PBKDF2(password, salt, { keySize: 8, iterations: 1000 });
        	     */
        	    C.PBKDF2 = function (password, salt, cfg) {
        	        return PBKDF2.create(cfg).compute(password, salt);
        	    };
        	}());


        	return CryptoJS.PBKDF2;

        }));
        });

        var evpkdf = createCommonjsModule(function (module, exports) {
        (function (root, factory, undef) {
        	{
        		// CommonJS
        		module.exports = exports = factory(core, sha1, hmac);
        	}
        }(commonjsGlobal, function (CryptoJS) {

        	(function () {
        	    // Shortcuts
        	    var C = CryptoJS;
        	    var C_lib = C.lib;
        	    var Base = C_lib.Base;
        	    var WordArray = C_lib.WordArray;
        	    var C_algo = C.algo;
        	    var MD5 = C_algo.MD5;

        	    /**
        	     * This key derivation function is meant to conform with EVP_BytesToKey.
        	     * www.openssl.org/docs/crypto/EVP_BytesToKey.html
        	     */
        	    var EvpKDF = C_algo.EvpKDF = Base.extend({
        	        /**
        	         * Configuration options.
        	         *
        	         * @property {number} keySize The key size in words to generate. Default: 4 (128 bits)
        	         * @property {Hasher} hasher The hash algorithm to use. Default: MD5
        	         * @property {number} iterations The number of iterations to perform. Default: 1
        	         */
        	        cfg: Base.extend({
        	            keySize: 128/32,
        	            hasher: MD5,
        	            iterations: 1
        	        }),

        	        /**
        	         * Initializes a newly created key derivation function.
        	         *
        	         * @param {Object} cfg (Optional) The configuration options to use for the derivation.
        	         *
        	         * @example
        	         *
        	         *     var kdf = CryptoJS.algo.EvpKDF.create();
        	         *     var kdf = CryptoJS.algo.EvpKDF.create({ keySize: 8 });
        	         *     var kdf = CryptoJS.algo.EvpKDF.create({ keySize: 8, iterations: 1000 });
        	         */
        	        init: function (cfg) {
        	            this.cfg = this.cfg.extend(cfg);
        	        },

        	        /**
        	         * Derives a key from a password.
        	         *
        	         * @param {WordArray|string} password The password.
        	         * @param {WordArray|string} salt A salt.
        	         *
        	         * @return {WordArray} The derived key.
        	         *
        	         * @example
        	         *
        	         *     var key = kdf.compute(password, salt);
        	         */
        	        compute: function (password, salt) {
        	            // Shortcut
        	            var cfg = this.cfg;

        	            // Init hasher
        	            var hasher = cfg.hasher.create();

        	            // Initial values
        	            var derivedKey = WordArray.create();

        	            // Shortcuts
        	            var derivedKeyWords = derivedKey.words;
        	            var keySize = cfg.keySize;
        	            var iterations = cfg.iterations;

        	            // Generate key
        	            while (derivedKeyWords.length < keySize) {
        	                if (block) {
        	                    hasher.update(block);
        	                }
        	                var block = hasher.update(password).finalize(salt);
        	                hasher.reset();

        	                // Iterations
        	                for (var i = 1; i < iterations; i++) {
        	                    block = hasher.finalize(block);
        	                    hasher.reset();
        	                }

        	                derivedKey.concat(block);
        	            }
        	            derivedKey.sigBytes = keySize * 4;

        	            return derivedKey;
        	        }
        	    });

        	    /**
        	     * Derives a key from a password.
        	     *
        	     * @param {WordArray|string} password The password.
        	     * @param {WordArray|string} salt A salt.
        	     * @param {Object} cfg (Optional) The configuration options to use for this computation.
        	     *
        	     * @return {WordArray} The derived key.
        	     *
        	     * @static
        	     *
        	     * @example
        	     *
        	     *     var key = CryptoJS.EvpKDF(password, salt);
        	     *     var key = CryptoJS.EvpKDF(password, salt, { keySize: 8 });
        	     *     var key = CryptoJS.EvpKDF(password, salt, { keySize: 8, iterations: 1000 });
        	     */
        	    C.EvpKDF = function (password, salt, cfg) {
        	        return EvpKDF.create(cfg).compute(password, salt);
        	    };
        	}());


        	return CryptoJS.EvpKDF;

        }));
        });

        var cipherCore = createCommonjsModule(function (module, exports) {
        (function (root, factory, undef) {
        	{
        		// CommonJS
        		module.exports = exports = factory(core, evpkdf);
        	}
        }(commonjsGlobal, function (CryptoJS) {

        	/**
        	 * Cipher core components.
        	 */
        	CryptoJS.lib.Cipher || (function (undefined$1) {
        	    // Shortcuts
        	    var C = CryptoJS;
        	    var C_lib = C.lib;
        	    var Base = C_lib.Base;
        	    var WordArray = C_lib.WordArray;
        	    var BufferedBlockAlgorithm = C_lib.BufferedBlockAlgorithm;
        	    var C_enc = C.enc;
        	    var Utf8 = C_enc.Utf8;
        	    var Base64 = C_enc.Base64;
        	    var C_algo = C.algo;
        	    var EvpKDF = C_algo.EvpKDF;

        	    /**
        	     * Abstract base cipher template.
        	     *
        	     * @property {number} keySize This cipher's key size. Default: 4 (128 bits)
        	     * @property {number} ivSize This cipher's IV size. Default: 4 (128 bits)
        	     * @property {number} _ENC_XFORM_MODE A constant representing encryption mode.
        	     * @property {number} _DEC_XFORM_MODE A constant representing decryption mode.
        	     */
        	    var Cipher = C_lib.Cipher = BufferedBlockAlgorithm.extend({
        	        /**
        	         * Configuration options.
        	         *
        	         * @property {WordArray} iv The IV to use for this operation.
        	         */
        	        cfg: Base.extend(),

        	        /**
        	         * Creates this cipher in encryption mode.
        	         *
        	         * @param {WordArray} key The key.
        	         * @param {Object} cfg (Optional) The configuration options to use for this operation.
        	         *
        	         * @return {Cipher} A cipher instance.
        	         *
        	         * @static
        	         *
        	         * @example
        	         *
        	         *     var cipher = CryptoJS.algo.AES.createEncryptor(keyWordArray, { iv: ivWordArray });
        	         */
        	        createEncryptor: function (key, cfg) {
        	            return this.create(this._ENC_XFORM_MODE, key, cfg);
        	        },

        	        /**
        	         * Creates this cipher in decryption mode.
        	         *
        	         * @param {WordArray} key The key.
        	         * @param {Object} cfg (Optional) The configuration options to use for this operation.
        	         *
        	         * @return {Cipher} A cipher instance.
        	         *
        	         * @static
        	         *
        	         * @example
        	         *
        	         *     var cipher = CryptoJS.algo.AES.createDecryptor(keyWordArray, { iv: ivWordArray });
        	         */
        	        createDecryptor: function (key, cfg) {
        	            return this.create(this._DEC_XFORM_MODE, key, cfg);
        	        },

        	        /**
        	         * Initializes a newly created cipher.
        	         *
        	         * @param {number} xformMode Either the encryption or decryption transormation mode constant.
        	         * @param {WordArray} key The key.
        	         * @param {Object} cfg (Optional) The configuration options to use for this operation.
        	         *
        	         * @example
        	         *
        	         *     var cipher = CryptoJS.algo.AES.create(CryptoJS.algo.AES._ENC_XFORM_MODE, keyWordArray, { iv: ivWordArray });
        	         */
        	        init: function (xformMode, key, cfg) {
        	            // Apply config defaults
        	            this.cfg = this.cfg.extend(cfg);

        	            // Store transform mode and key
        	            this._xformMode = xformMode;
        	            this._key = key;

        	            // Set initial values
        	            this.reset();
        	        },

        	        /**
        	         * Resets this cipher to its initial state.
        	         *
        	         * @example
        	         *
        	         *     cipher.reset();
        	         */
        	        reset: function () {
        	            // Reset data buffer
        	            BufferedBlockAlgorithm.reset.call(this);

        	            // Perform concrete-cipher logic
        	            this._doReset();
        	        },

        	        /**
        	         * Adds data to be encrypted or decrypted.
        	         *
        	         * @param {WordArray|string} dataUpdate The data to encrypt or decrypt.
        	         *
        	         * @return {WordArray} The data after processing.
        	         *
        	         * @example
        	         *
        	         *     var encrypted = cipher.process('data');
        	         *     var encrypted = cipher.process(wordArray);
        	         */
        	        process: function (dataUpdate) {
        	            // Append
        	            this._append(dataUpdate);

        	            // Process available blocks
        	            return this._process();
        	        },

        	        /**
        	         * Finalizes the encryption or decryption process.
        	         * Note that the finalize operation is effectively a destructive, read-once operation.
        	         *
        	         * @param {WordArray|string} dataUpdate The final data to encrypt or decrypt.
        	         *
        	         * @return {WordArray} The data after final processing.
        	         *
        	         * @example
        	         *
        	         *     var encrypted = cipher.finalize();
        	         *     var encrypted = cipher.finalize('data');
        	         *     var encrypted = cipher.finalize(wordArray);
        	         */
        	        finalize: function (dataUpdate) {
        	            // Final data update
        	            if (dataUpdate) {
        	                this._append(dataUpdate);
        	            }

        	            // Perform concrete-cipher logic
        	            var finalProcessedData = this._doFinalize();

        	            return finalProcessedData;
        	        },

        	        keySize: 128/32,

        	        ivSize: 128/32,

        	        _ENC_XFORM_MODE: 1,

        	        _DEC_XFORM_MODE: 2,

        	        /**
        	         * Creates shortcut functions to a cipher's object interface.
        	         *
        	         * @param {Cipher} cipher The cipher to create a helper for.
        	         *
        	         * @return {Object} An object with encrypt and decrypt shortcut functions.
        	         *
        	         * @static
        	         *
        	         * @example
        	         *
        	         *     var AES = CryptoJS.lib.Cipher._createHelper(CryptoJS.algo.AES);
        	         */
        	        _createHelper: (function () {
        	            function selectCipherStrategy(key) {
        	                if (typeof key == 'string') {
        	                    return PasswordBasedCipher;
        	                } else {
        	                    return SerializableCipher;
        	                }
        	            }

        	            return function (cipher) {
        	                return {
        	                    encrypt: function (message, key, cfg) {
        	                        return selectCipherStrategy(key).encrypt(cipher, message, key, cfg);
        	                    },

        	                    decrypt: function (ciphertext, key, cfg) {
        	                        return selectCipherStrategy(key).decrypt(cipher, ciphertext, key, cfg);
        	                    }
        	                };
        	            };
        	        }())
        	    });

        	    /**
        	     * Abstract base stream cipher template.
        	     *
        	     * @property {number} blockSize The number of 32-bit words this cipher operates on. Default: 1 (32 bits)
        	     */
        	    var StreamCipher = C_lib.StreamCipher = Cipher.extend({
        	        _doFinalize: function () {
        	            // Process partial blocks
        	            var finalProcessedBlocks = this._process(!!'flush');

        	            return finalProcessedBlocks;
        	        },

        	        blockSize: 1
        	    });

        	    /**
        	     * Mode namespace.
        	     */
        	    var C_mode = C.mode = {};

        	    /**
        	     * Abstract base block cipher mode template.
        	     */
        	    var BlockCipherMode = C_lib.BlockCipherMode = Base.extend({
        	        /**
        	         * Creates this mode for encryption.
        	         *
        	         * @param {Cipher} cipher A block cipher instance.
        	         * @param {Array} iv The IV words.
        	         *
        	         * @static
        	         *
        	         * @example
        	         *
        	         *     var mode = CryptoJS.mode.CBC.createEncryptor(cipher, iv.words);
        	         */
        	        createEncryptor: function (cipher, iv) {
        	            return this.Encryptor.create(cipher, iv);
        	        },

        	        /**
        	         * Creates this mode for decryption.
        	         *
        	         * @param {Cipher} cipher A block cipher instance.
        	         * @param {Array} iv The IV words.
        	         *
        	         * @static
        	         *
        	         * @example
        	         *
        	         *     var mode = CryptoJS.mode.CBC.createDecryptor(cipher, iv.words);
        	         */
        	        createDecryptor: function (cipher, iv) {
        	            return this.Decryptor.create(cipher, iv);
        	        },

        	        /**
        	         * Initializes a newly created mode.
        	         *
        	         * @param {Cipher} cipher A block cipher instance.
        	         * @param {Array} iv The IV words.
        	         *
        	         * @example
        	         *
        	         *     var mode = CryptoJS.mode.CBC.Encryptor.create(cipher, iv.words);
        	         */
        	        init: function (cipher, iv) {
        	            this._cipher = cipher;
        	            this._iv = iv;
        	        }
        	    });

        	    /**
        	     * Cipher Block Chaining mode.
        	     */
        	    var CBC = C_mode.CBC = (function () {
        	        /**
        	         * Abstract base CBC mode.
        	         */
        	        var CBC = BlockCipherMode.extend();

        	        /**
        	         * CBC encryptor.
        	         */
        	        CBC.Encryptor = CBC.extend({
        	            /**
        	             * Processes the data block at offset.
        	             *
        	             * @param {Array} words The data words to operate on.
        	             * @param {number} offset The offset where the block starts.
        	             *
        	             * @example
        	             *
        	             *     mode.processBlock(data.words, offset);
        	             */
        	            processBlock: function (words, offset) {
        	                // Shortcuts
        	                var cipher = this._cipher;
        	                var blockSize = cipher.blockSize;

        	                // XOR and encrypt
        	                xorBlock.call(this, words, offset, blockSize);
        	                cipher.encryptBlock(words, offset);

        	                // Remember this block to use with next block
        	                this._prevBlock = words.slice(offset, offset + blockSize);
        	            }
        	        });

        	        /**
        	         * CBC decryptor.
        	         */
        	        CBC.Decryptor = CBC.extend({
        	            /**
        	             * Processes the data block at offset.
        	             *
        	             * @param {Array} words The data words to operate on.
        	             * @param {number} offset The offset where the block starts.
        	             *
        	             * @example
        	             *
        	             *     mode.processBlock(data.words, offset);
        	             */
        	            processBlock: function (words, offset) {
        	                // Shortcuts
        	                var cipher = this._cipher;
        	                var blockSize = cipher.blockSize;

        	                // Remember this block to use with next block
        	                var thisBlock = words.slice(offset, offset + blockSize);

        	                // Decrypt and XOR
        	                cipher.decryptBlock(words, offset);
        	                xorBlock.call(this, words, offset, blockSize);

        	                // This block becomes the previous block
        	                this._prevBlock = thisBlock;
        	            }
        	        });

        	        function xorBlock(words, offset, blockSize) {
        	            // Shortcut
        	            var iv = this._iv;

        	            // Choose mixing block
        	            if (iv) {
        	                var block = iv;

        	                // Remove IV for subsequent blocks
        	                this._iv = undefined$1;
        	            } else {
        	                var block = this._prevBlock;
        	            }

        	            // XOR blocks
        	            for (var i = 0; i < blockSize; i++) {
        	                words[offset + i] ^= block[i];
        	            }
        	        }

        	        return CBC;
        	    }());

        	    /**
        	     * Padding namespace.
        	     */
        	    var C_pad = C.pad = {};

        	    /**
        	     * PKCS #5/7 padding strategy.
        	     */
        	    var Pkcs7 = C_pad.Pkcs7 = {
        	        /**
        	         * Pads data using the algorithm defined in PKCS #5/7.
        	         *
        	         * @param {WordArray} data The data to pad.
        	         * @param {number} blockSize The multiple that the data should be padded to.
        	         *
        	         * @static
        	         *
        	         * @example
        	         *
        	         *     CryptoJS.pad.Pkcs7.pad(wordArray, 4);
        	         */
        	        pad: function (data, blockSize) {
        	            // Shortcut
        	            var blockSizeBytes = blockSize * 4;

        	            // Count padding bytes
        	            var nPaddingBytes = blockSizeBytes - data.sigBytes % blockSizeBytes;

        	            // Create padding word
        	            var paddingWord = (nPaddingBytes << 24) | (nPaddingBytes << 16) | (nPaddingBytes << 8) | nPaddingBytes;

        	            // Create padding
        	            var paddingWords = [];
        	            for (var i = 0; i < nPaddingBytes; i += 4) {
        	                paddingWords.push(paddingWord);
        	            }
        	            var padding = WordArray.create(paddingWords, nPaddingBytes);

        	            // Add padding
        	            data.concat(padding);
        	        },

        	        /**
        	         * Unpads data that had been padded using the algorithm defined in PKCS #5/7.
        	         *
        	         * @param {WordArray} data The data to unpad.
        	         *
        	         * @static
        	         *
        	         * @example
        	         *
        	         *     CryptoJS.pad.Pkcs7.unpad(wordArray);
        	         */
        	        unpad: function (data) {
        	            // Get number of padding bytes from last byte
        	            var nPaddingBytes = data.words[(data.sigBytes - 1) >>> 2] & 0xff;

        	            // Remove padding
        	            data.sigBytes -= nPaddingBytes;
        	        }
        	    };

        	    /**
        	     * Abstract base block cipher template.
        	     *
        	     * @property {number} blockSize The number of 32-bit words this cipher operates on. Default: 4 (128 bits)
        	     */
        	    var BlockCipher = C_lib.BlockCipher = Cipher.extend({
        	        /**
        	         * Configuration options.
        	         *
        	         * @property {Mode} mode The block mode to use. Default: CBC
        	         * @property {Padding} padding The padding strategy to use. Default: Pkcs7
        	         */
        	        cfg: Cipher.cfg.extend({
        	            mode: CBC,
        	            padding: Pkcs7
        	        }),

        	        reset: function () {
        	            // Reset cipher
        	            Cipher.reset.call(this);

        	            // Shortcuts
        	            var cfg = this.cfg;
        	            var iv = cfg.iv;
        	            var mode = cfg.mode;

        	            // Reset block mode
        	            if (this._xformMode == this._ENC_XFORM_MODE) {
        	                var modeCreator = mode.createEncryptor;
        	            } else /* if (this._xformMode == this._DEC_XFORM_MODE) */ {
        	                var modeCreator = mode.createDecryptor;
        	                // Keep at least one block in the buffer for unpadding
        	                this._minBufferSize = 1;
        	            }

        	            if (this._mode && this._mode.__creator == modeCreator) {
        	                this._mode.init(this, iv && iv.words);
        	            } else {
        	                this._mode = modeCreator.call(mode, this, iv && iv.words);
        	                this._mode.__creator = modeCreator;
        	            }
        	        },

        	        _doProcessBlock: function (words, offset) {
        	            this._mode.processBlock(words, offset);
        	        },

        	        _doFinalize: function () {
        	            // Shortcut
        	            var padding = this.cfg.padding;

        	            // Finalize
        	            if (this._xformMode == this._ENC_XFORM_MODE) {
        	                // Pad data
        	                padding.pad(this._data, this.blockSize);

        	                // Process final blocks
        	                var finalProcessedBlocks = this._process(!!'flush');
        	            } else /* if (this._xformMode == this._DEC_XFORM_MODE) */ {
        	                // Process final blocks
        	                var finalProcessedBlocks = this._process(!!'flush');

        	                // Unpad data
        	                padding.unpad(finalProcessedBlocks);
        	            }

        	            return finalProcessedBlocks;
        	        },

        	        blockSize: 128/32
        	    });

        	    /**
        	     * A collection of cipher parameters.
        	     *
        	     * @property {WordArray} ciphertext The raw ciphertext.
        	     * @property {WordArray} key The key to this ciphertext.
        	     * @property {WordArray} iv The IV used in the ciphering operation.
        	     * @property {WordArray} salt The salt used with a key derivation function.
        	     * @property {Cipher} algorithm The cipher algorithm.
        	     * @property {Mode} mode The block mode used in the ciphering operation.
        	     * @property {Padding} padding The padding scheme used in the ciphering operation.
        	     * @property {number} blockSize The block size of the cipher.
        	     * @property {Format} formatter The default formatting strategy to convert this cipher params object to a string.
        	     */
        	    var CipherParams = C_lib.CipherParams = Base.extend({
        	        /**
        	         * Initializes a newly created cipher params object.
        	         *
        	         * @param {Object} cipherParams An object with any of the possible cipher parameters.
        	         *
        	         * @example
        	         *
        	         *     var cipherParams = CryptoJS.lib.CipherParams.create({
        	         *         ciphertext: ciphertextWordArray,
        	         *         key: keyWordArray,
        	         *         iv: ivWordArray,
        	         *         salt: saltWordArray,
        	         *         algorithm: CryptoJS.algo.AES,
        	         *         mode: CryptoJS.mode.CBC,
        	         *         padding: CryptoJS.pad.PKCS7,
        	         *         blockSize: 4,
        	         *         formatter: CryptoJS.format.OpenSSL
        	         *     });
        	         */
        	        init: function (cipherParams) {
        	            this.mixIn(cipherParams);
        	        },

        	        /**
        	         * Converts this cipher params object to a string.
        	         *
        	         * @param {Format} formatter (Optional) The formatting strategy to use.
        	         *
        	         * @return {string} The stringified cipher params.
        	         *
        	         * @throws Error If neither the formatter nor the default formatter is set.
        	         *
        	         * @example
        	         *
        	         *     var string = cipherParams + '';
        	         *     var string = cipherParams.toString();
        	         *     var string = cipherParams.toString(CryptoJS.format.OpenSSL);
        	         */
        	        toString: function (formatter) {
        	            return (formatter || this.formatter).stringify(this);
        	        }
        	    });

        	    /**
        	     * Format namespace.
        	     */
        	    var C_format = C.format = {};

        	    /**
        	     * OpenSSL formatting strategy.
        	     */
        	    var OpenSSLFormatter = C_format.OpenSSL = {
        	        /**
        	         * Converts a cipher params object to an OpenSSL-compatible string.
        	         *
        	         * @param {CipherParams} cipherParams The cipher params object.
        	         *
        	         * @return {string} The OpenSSL-compatible string.
        	         *
        	         * @static
        	         *
        	         * @example
        	         *
        	         *     var openSSLString = CryptoJS.format.OpenSSL.stringify(cipherParams);
        	         */
        	        stringify: function (cipherParams) {
        	            // Shortcuts
        	            var ciphertext = cipherParams.ciphertext;
        	            var salt = cipherParams.salt;

        	            // Format
        	            if (salt) {
        	                var wordArray = WordArray.create([0x53616c74, 0x65645f5f]).concat(salt).concat(ciphertext);
        	            } else {
        	                var wordArray = ciphertext;
        	            }

        	            return wordArray.toString(Base64);
        	        },

        	        /**
        	         * Converts an OpenSSL-compatible string to a cipher params object.
        	         *
        	         * @param {string} openSSLStr The OpenSSL-compatible string.
        	         *
        	         * @return {CipherParams} The cipher params object.
        	         *
        	         * @static
        	         *
        	         * @example
        	         *
        	         *     var cipherParams = CryptoJS.format.OpenSSL.parse(openSSLString);
        	         */
        	        parse: function (openSSLStr) {
        	            // Parse base64
        	            var ciphertext = Base64.parse(openSSLStr);

        	            // Shortcut
        	            var ciphertextWords = ciphertext.words;

        	            // Test for salt
        	            if (ciphertextWords[0] == 0x53616c74 && ciphertextWords[1] == 0x65645f5f) {
        	                // Extract salt
        	                var salt = WordArray.create(ciphertextWords.slice(2, 4));

        	                // Remove salt from ciphertext
        	                ciphertextWords.splice(0, 4);
        	                ciphertext.sigBytes -= 16;
        	            }

        	            return CipherParams.create({ ciphertext: ciphertext, salt: salt });
        	        }
        	    };

        	    /**
        	     * A cipher wrapper that returns ciphertext as a serializable cipher params object.
        	     */
        	    var SerializableCipher = C_lib.SerializableCipher = Base.extend({
        	        /**
        	         * Configuration options.
        	         *
        	         * @property {Formatter} format The formatting strategy to convert cipher param objects to and from a string. Default: OpenSSL
        	         */
        	        cfg: Base.extend({
        	            format: OpenSSLFormatter
        	        }),

        	        /**
        	         * Encrypts a message.
        	         *
        	         * @param {Cipher} cipher The cipher algorithm to use.
        	         * @param {WordArray|string} message The message to encrypt.
        	         * @param {WordArray} key The key.
        	         * @param {Object} cfg (Optional) The configuration options to use for this operation.
        	         *
        	         * @return {CipherParams} A cipher params object.
        	         *
        	         * @static
        	         *
        	         * @example
        	         *
        	         *     var ciphertextParams = CryptoJS.lib.SerializableCipher.encrypt(CryptoJS.algo.AES, message, key);
        	         *     var ciphertextParams = CryptoJS.lib.SerializableCipher.encrypt(CryptoJS.algo.AES, message, key, { iv: iv });
        	         *     var ciphertextParams = CryptoJS.lib.SerializableCipher.encrypt(CryptoJS.algo.AES, message, key, { iv: iv, format: CryptoJS.format.OpenSSL });
        	         */
        	        encrypt: function (cipher, message, key, cfg) {
        	            // Apply config defaults
        	            cfg = this.cfg.extend(cfg);

        	            // Encrypt
        	            var encryptor = cipher.createEncryptor(key, cfg);
        	            var ciphertext = encryptor.finalize(message);

        	            // Shortcut
        	            var cipherCfg = encryptor.cfg;

        	            // Create and return serializable cipher params
        	            return CipherParams.create({
        	                ciphertext: ciphertext,
        	                key: key,
        	                iv: cipherCfg.iv,
        	                algorithm: cipher,
        	                mode: cipherCfg.mode,
        	                padding: cipherCfg.padding,
        	                blockSize: cipher.blockSize,
        	                formatter: cfg.format
        	            });
        	        },

        	        /**
        	         * Decrypts serialized ciphertext.
        	         *
        	         * @param {Cipher} cipher The cipher algorithm to use.
        	         * @param {CipherParams|string} ciphertext The ciphertext to decrypt.
        	         * @param {WordArray} key The key.
        	         * @param {Object} cfg (Optional) The configuration options to use for this operation.
        	         *
        	         * @return {WordArray} The plaintext.
        	         *
        	         * @static
        	         *
        	         * @example
        	         *
        	         *     var plaintext = CryptoJS.lib.SerializableCipher.decrypt(CryptoJS.algo.AES, formattedCiphertext, key, { iv: iv, format: CryptoJS.format.OpenSSL });
        	         *     var plaintext = CryptoJS.lib.SerializableCipher.decrypt(CryptoJS.algo.AES, ciphertextParams, key, { iv: iv, format: CryptoJS.format.OpenSSL });
        	         */
        	        decrypt: function (cipher, ciphertext, key, cfg) {
        	            // Apply config defaults
        	            cfg = this.cfg.extend(cfg);

        	            // Convert string to CipherParams
        	            ciphertext = this._parse(ciphertext, cfg.format);

        	            // Decrypt
        	            var plaintext = cipher.createDecryptor(key, cfg).finalize(ciphertext.ciphertext);

        	            return plaintext;
        	        },

        	        /**
        	         * Converts serialized ciphertext to CipherParams,
        	         * else assumed CipherParams already and returns ciphertext unchanged.
        	         *
        	         * @param {CipherParams|string} ciphertext The ciphertext.
        	         * @param {Formatter} format The formatting strategy to use to parse serialized ciphertext.
        	         *
        	         * @return {CipherParams} The unserialized ciphertext.
        	         *
        	         * @static
        	         *
        	         * @example
        	         *
        	         *     var ciphertextParams = CryptoJS.lib.SerializableCipher._parse(ciphertextStringOrParams, format);
        	         */
        	        _parse: function (ciphertext, format) {
        	            if (typeof ciphertext == 'string') {
        	                return format.parse(ciphertext, this);
        	            } else {
        	                return ciphertext;
        	            }
        	        }
        	    });

        	    /**
        	     * Key derivation function namespace.
        	     */
        	    var C_kdf = C.kdf = {};

        	    /**
        	     * OpenSSL key derivation function.
        	     */
        	    var OpenSSLKdf = C_kdf.OpenSSL = {
        	        /**
        	         * Derives a key and IV from a password.
        	         *
        	         * @param {string} password The password to derive from.
        	         * @param {number} keySize The size in words of the key to generate.
        	         * @param {number} ivSize The size in words of the IV to generate.
        	         * @param {WordArray|string} salt (Optional) A 64-bit salt to use. If omitted, a salt will be generated randomly.
        	         *
        	         * @return {CipherParams} A cipher params object with the key, IV, and salt.
        	         *
        	         * @static
        	         *
        	         * @example
        	         *
        	         *     var derivedParams = CryptoJS.kdf.OpenSSL.execute('Password', 256/32, 128/32);
        	         *     var derivedParams = CryptoJS.kdf.OpenSSL.execute('Password', 256/32, 128/32, 'saltsalt');
        	         */
        	        execute: function (password, keySize, ivSize, salt) {
        	            // Generate random salt
        	            if (!salt) {
        	                salt = WordArray.random(64/8);
        	            }

        	            // Derive key and IV
        	            var key = EvpKDF.create({ keySize: keySize + ivSize }).compute(password, salt);

        	            // Separate key and IV
        	            var iv = WordArray.create(key.words.slice(keySize), ivSize * 4);
        	            key.sigBytes = keySize * 4;

        	            // Return params
        	            return CipherParams.create({ key: key, iv: iv, salt: salt });
        	        }
        	    };

        	    /**
        	     * A serializable cipher wrapper that derives the key from a password,
        	     * and returns ciphertext as a serializable cipher params object.
        	     */
        	    var PasswordBasedCipher = C_lib.PasswordBasedCipher = SerializableCipher.extend({
        	        /**
        	         * Configuration options.
        	         *
        	         * @property {KDF} kdf The key derivation function to use to generate a key and IV from a password. Default: OpenSSL
        	         */
        	        cfg: SerializableCipher.cfg.extend({
        	            kdf: OpenSSLKdf
        	        }),

        	        /**
        	         * Encrypts a message using a password.
        	         *
        	         * @param {Cipher} cipher The cipher algorithm to use.
        	         * @param {WordArray|string} message The message to encrypt.
        	         * @param {string} password The password.
        	         * @param {Object} cfg (Optional) The configuration options to use for this operation.
        	         *
        	         * @return {CipherParams} A cipher params object.
        	         *
        	         * @static
        	         *
        	         * @example
        	         *
        	         *     var ciphertextParams = CryptoJS.lib.PasswordBasedCipher.encrypt(CryptoJS.algo.AES, message, 'password');
        	         *     var ciphertextParams = CryptoJS.lib.PasswordBasedCipher.encrypt(CryptoJS.algo.AES, message, 'password', { format: CryptoJS.format.OpenSSL });
        	         */
        	        encrypt: function (cipher, message, password, cfg) {
        	            // Apply config defaults
        	            cfg = this.cfg.extend(cfg);

        	            // Derive key and other params
        	            var derivedParams = cfg.kdf.execute(password, cipher.keySize, cipher.ivSize);

        	            // Add IV to config
        	            cfg.iv = derivedParams.iv;

        	            // Encrypt
        	            var ciphertext = SerializableCipher.encrypt.call(this, cipher, message, derivedParams.key, cfg);

        	            // Mix in derived params
        	            ciphertext.mixIn(derivedParams);

        	            return ciphertext;
        	        },

        	        /**
        	         * Decrypts serialized ciphertext using a password.
        	         *
        	         * @param {Cipher} cipher The cipher algorithm to use.
        	         * @param {CipherParams|string} ciphertext The ciphertext to decrypt.
        	         * @param {string} password The password.
        	         * @param {Object} cfg (Optional) The configuration options to use for this operation.
        	         *
        	         * @return {WordArray} The plaintext.
        	         *
        	         * @static
        	         *
        	         * @example
        	         *
        	         *     var plaintext = CryptoJS.lib.PasswordBasedCipher.decrypt(CryptoJS.algo.AES, formattedCiphertext, 'password', { format: CryptoJS.format.OpenSSL });
        	         *     var plaintext = CryptoJS.lib.PasswordBasedCipher.decrypt(CryptoJS.algo.AES, ciphertextParams, 'password', { format: CryptoJS.format.OpenSSL });
        	         */
        	        decrypt: function (cipher, ciphertext, password, cfg) {
        	            // Apply config defaults
        	            cfg = this.cfg.extend(cfg);

        	            // Convert string to CipherParams
        	            ciphertext = this._parse(ciphertext, cfg.format);

        	            // Derive key and other params
        	            var derivedParams = cfg.kdf.execute(password, cipher.keySize, cipher.ivSize, ciphertext.salt);

        	            // Add IV to config
        	            cfg.iv = derivedParams.iv;

        	            // Decrypt
        	            var plaintext = SerializableCipher.decrypt.call(this, cipher, ciphertext, derivedParams.key, cfg);

        	            return plaintext;
        	        }
        	    });
        	}());


        }));
        });

        var modeCfb = createCommonjsModule(function (module, exports) {
        (function (root, factory, undef) {
        	{
        		// CommonJS
        		module.exports = exports = factory(core, cipherCore);
        	}
        }(commonjsGlobal, function (CryptoJS) {

        	/**
        	 * Cipher Feedback block mode.
        	 */
        	CryptoJS.mode.CFB = (function () {
        	    var CFB = CryptoJS.lib.BlockCipherMode.extend();

        	    CFB.Encryptor = CFB.extend({
        	        processBlock: function (words, offset) {
        	            // Shortcuts
        	            var cipher = this._cipher;
        	            var blockSize = cipher.blockSize;

        	            generateKeystreamAndEncrypt.call(this, words, offset, blockSize, cipher);

        	            // Remember this block to use with next block
        	            this._prevBlock = words.slice(offset, offset + blockSize);
        	        }
        	    });

        	    CFB.Decryptor = CFB.extend({
        	        processBlock: function (words, offset) {
        	            // Shortcuts
        	            var cipher = this._cipher;
        	            var blockSize = cipher.blockSize;

        	            // Remember this block to use with next block
        	            var thisBlock = words.slice(offset, offset + blockSize);

        	            generateKeystreamAndEncrypt.call(this, words, offset, blockSize, cipher);

        	            // This block becomes the previous block
        	            this._prevBlock = thisBlock;
        	        }
        	    });

        	    function generateKeystreamAndEncrypt(words, offset, blockSize, cipher) {
        	        // Shortcut
        	        var iv = this._iv;

        	        // Generate keystream
        	        if (iv) {
        	            var keystream = iv.slice(0);

        	            // Remove IV for subsequent blocks
        	            this._iv = undefined;
        	        } else {
        	            var keystream = this._prevBlock;
        	        }
        	        cipher.encryptBlock(keystream, 0);

        	        // Encrypt
        	        for (var i = 0; i < blockSize; i++) {
        	            words[offset + i] ^= keystream[i];
        	        }
        	    }

        	    return CFB;
        	}());


        	return CryptoJS.mode.CFB;

        }));
        });

        var modeCtr = createCommonjsModule(function (module, exports) {
        (function (root, factory, undef) {
        	{
        		// CommonJS
        		module.exports = exports = factory(core, cipherCore);
        	}
        }(commonjsGlobal, function (CryptoJS) {

        	/**
        	 * Counter block mode.
        	 */
        	CryptoJS.mode.CTR = (function () {
        	    var CTR = CryptoJS.lib.BlockCipherMode.extend();

        	    var Encryptor = CTR.Encryptor = CTR.extend({
        	        processBlock: function (words, offset) {
        	            // Shortcuts
        	            var cipher = this._cipher;
        	            var blockSize = cipher.blockSize;
        	            var iv = this._iv;
        	            var counter = this._counter;

        	            // Generate keystream
        	            if (iv) {
        	                counter = this._counter = iv.slice(0);

        	                // Remove IV for subsequent blocks
        	                this._iv = undefined;
        	            }
        	            var keystream = counter.slice(0);
        	            cipher.encryptBlock(keystream, 0);

        	            // Increment counter
        	            counter[blockSize - 1] = (counter[blockSize - 1] + 1) | 0;

        	            // Encrypt
        	            for (var i = 0; i < blockSize; i++) {
        	                words[offset + i] ^= keystream[i];
        	            }
        	        }
        	    });

        	    CTR.Decryptor = Encryptor;

        	    return CTR;
        	}());


        	return CryptoJS.mode.CTR;

        }));
        });

        var modeCtrGladman = createCommonjsModule(function (module, exports) {
        (function (root, factory, undef) {
        	{
        		// CommonJS
        		module.exports = exports = factory(core, cipherCore);
        	}
        }(commonjsGlobal, function (CryptoJS) {

        	/** @preserve
        	 * Counter block mode compatible with  Dr Brian Gladman fileenc.c
        	 * derived from CryptoJS.mode.CTR
        	 * Jan Hruby jhruby.web@gmail.com
        	 */
        	CryptoJS.mode.CTRGladman = (function () {
        	    var CTRGladman = CryptoJS.lib.BlockCipherMode.extend();

        		function incWord(word)
        		{
        			if (((word >> 24) & 0xff) === 0xff) { //overflow
        			var b1 = (word >> 16)&0xff;
        			var b2 = (word >> 8)&0xff;
        			var b3 = word & 0xff;

        			if (b1 === 0xff) // overflow b1
        			{
        			b1 = 0;
        			if (b2 === 0xff)
        			{
        				b2 = 0;
        				if (b3 === 0xff)
        				{
        					b3 = 0;
        				}
        				else
        				{
        					++b3;
        				}
        			}
        			else
        			{
        				++b2;
        			}
        			}
        			else
        			{
        			++b1;
        			}

        			word = 0;
        			word += (b1 << 16);
        			word += (b2 << 8);
        			word += b3;
        			}
        			else
        			{
        			word += (0x01 << 24);
        			}
        			return word;
        		}

        		function incCounter(counter)
        		{
        			if ((counter[0] = incWord(counter[0])) === 0)
        			{
        				// encr_data in fileenc.c from  Dr Brian Gladman's counts only with DWORD j < 8
        				counter[1] = incWord(counter[1]);
        			}
        			return counter;
        		}

        	    var Encryptor = CTRGladman.Encryptor = CTRGladman.extend({
        	        processBlock: function (words, offset) {
        	            // Shortcuts
        	            var cipher = this._cipher;
        	            var blockSize = cipher.blockSize;
        	            var iv = this._iv;
        	            var counter = this._counter;

        	            // Generate keystream
        	            if (iv) {
        	                counter = this._counter = iv.slice(0);

        	                // Remove IV for subsequent blocks
        	                this._iv = undefined;
        	            }

        				incCounter(counter);

        				var keystream = counter.slice(0);
        	            cipher.encryptBlock(keystream, 0);

        	            // Encrypt
        	            for (var i = 0; i < blockSize; i++) {
        	                words[offset + i] ^= keystream[i];
        	            }
        	        }
        	    });

        	    CTRGladman.Decryptor = Encryptor;

        	    return CTRGladman;
        	}());




        	return CryptoJS.mode.CTRGladman;

        }));
        });

        var modeOfb = createCommonjsModule(function (module, exports) {
        (function (root, factory, undef) {
        	{
        		// CommonJS
        		module.exports = exports = factory(core, cipherCore);
        	}
        }(commonjsGlobal, function (CryptoJS) {

        	/**
        	 * Output Feedback block mode.
        	 */
        	CryptoJS.mode.OFB = (function () {
        	    var OFB = CryptoJS.lib.BlockCipherMode.extend();

        	    var Encryptor = OFB.Encryptor = OFB.extend({
        	        processBlock: function (words, offset) {
        	            // Shortcuts
        	            var cipher = this._cipher;
        	            var blockSize = cipher.blockSize;
        	            var iv = this._iv;
        	            var keystream = this._keystream;

        	            // Generate keystream
        	            if (iv) {
        	                keystream = this._keystream = iv.slice(0);

        	                // Remove IV for subsequent blocks
        	                this._iv = undefined;
        	            }
        	            cipher.encryptBlock(keystream, 0);

        	            // Encrypt
        	            for (var i = 0; i < blockSize; i++) {
        	                words[offset + i] ^= keystream[i];
        	            }
        	        }
        	    });

        	    OFB.Decryptor = Encryptor;

        	    return OFB;
        	}());


        	return CryptoJS.mode.OFB;

        }));
        });

        var modeEcb = createCommonjsModule(function (module, exports) {
        (function (root, factory, undef) {
        	{
        		// CommonJS
        		module.exports = exports = factory(core, cipherCore);
        	}
        }(commonjsGlobal, function (CryptoJS) {

        	/**
        	 * Electronic Codebook block mode.
        	 */
        	CryptoJS.mode.ECB = (function () {
        	    var ECB = CryptoJS.lib.BlockCipherMode.extend();

        	    ECB.Encryptor = ECB.extend({
        	        processBlock: function (words, offset) {
        	            this._cipher.encryptBlock(words, offset);
        	        }
        	    });

        	    ECB.Decryptor = ECB.extend({
        	        processBlock: function (words, offset) {
        	            this._cipher.decryptBlock(words, offset);
        	        }
        	    });

        	    return ECB;
        	}());


        	return CryptoJS.mode.ECB;

        }));
        });

        var padAnsix923 = createCommonjsModule(function (module, exports) {
        (function (root, factory, undef) {
        	{
        		// CommonJS
        		module.exports = exports = factory(core, cipherCore);
        	}
        }(commonjsGlobal, function (CryptoJS) {

        	/**
        	 * ANSI X.923 padding strategy.
        	 */
        	CryptoJS.pad.AnsiX923 = {
        	    pad: function (data, blockSize) {
        	        // Shortcuts
        	        var dataSigBytes = data.sigBytes;
        	        var blockSizeBytes = blockSize * 4;

        	        // Count padding bytes
        	        var nPaddingBytes = blockSizeBytes - dataSigBytes % blockSizeBytes;

        	        // Compute last byte position
        	        var lastBytePos = dataSigBytes + nPaddingBytes - 1;

        	        // Pad
        	        data.clamp();
        	        data.words[lastBytePos >>> 2] |= nPaddingBytes << (24 - (lastBytePos % 4) * 8);
        	        data.sigBytes += nPaddingBytes;
        	    },

        	    unpad: function (data) {
        	        // Get number of padding bytes from last byte
        	        var nPaddingBytes = data.words[(data.sigBytes - 1) >>> 2] & 0xff;

        	        // Remove padding
        	        data.sigBytes -= nPaddingBytes;
        	    }
        	};


        	return CryptoJS.pad.Ansix923;

        }));
        });

        var padIso10126 = createCommonjsModule(function (module, exports) {
        (function (root, factory, undef) {
        	{
        		// CommonJS
        		module.exports = exports = factory(core, cipherCore);
        	}
        }(commonjsGlobal, function (CryptoJS) {

        	/**
        	 * ISO 10126 padding strategy.
        	 */
        	CryptoJS.pad.Iso10126 = {
        	    pad: function (data, blockSize) {
        	        // Shortcut
        	        var blockSizeBytes = blockSize * 4;

        	        // Count padding bytes
        	        var nPaddingBytes = blockSizeBytes - data.sigBytes % blockSizeBytes;

        	        // Pad
        	        data.concat(CryptoJS.lib.WordArray.random(nPaddingBytes - 1)).
        	             concat(CryptoJS.lib.WordArray.create([nPaddingBytes << 24], 1));
        	    },

        	    unpad: function (data) {
        	        // Get number of padding bytes from last byte
        	        var nPaddingBytes = data.words[(data.sigBytes - 1) >>> 2] & 0xff;

        	        // Remove padding
        	        data.sigBytes -= nPaddingBytes;
        	    }
        	};


        	return CryptoJS.pad.Iso10126;

        }));
        });

        var padIso97971 = createCommonjsModule(function (module, exports) {
        (function (root, factory, undef) {
        	{
        		// CommonJS
        		module.exports = exports = factory(core, cipherCore);
        	}
        }(commonjsGlobal, function (CryptoJS) {

        	/**
        	 * ISO/IEC 9797-1 Padding Method 2.
        	 */
        	CryptoJS.pad.Iso97971 = {
        	    pad: function (data, blockSize) {
        	        // Add 0x80 byte
        	        data.concat(CryptoJS.lib.WordArray.create([0x80000000], 1));

        	        // Zero pad the rest
        	        CryptoJS.pad.ZeroPadding.pad(data, blockSize);
        	    },

        	    unpad: function (data) {
        	        // Remove zero padding
        	        CryptoJS.pad.ZeroPadding.unpad(data);

        	        // Remove one more byte -- the 0x80 byte
        	        data.sigBytes--;
        	    }
        	};


        	return CryptoJS.pad.Iso97971;

        }));
        });

        var padZeropadding = createCommonjsModule(function (module, exports) {
        (function (root, factory, undef) {
        	{
        		// CommonJS
        		module.exports = exports = factory(core, cipherCore);
        	}
        }(commonjsGlobal, function (CryptoJS) {

        	/**
        	 * Zero padding strategy.
        	 */
        	CryptoJS.pad.ZeroPadding = {
        	    pad: function (data, blockSize) {
        	        // Shortcut
        	        var blockSizeBytes = blockSize * 4;

        	        // Pad
        	        data.clamp();
        	        data.sigBytes += blockSizeBytes - ((data.sigBytes % blockSizeBytes) || blockSizeBytes);
        	    },

        	    unpad: function (data) {
        	        // Shortcut
        	        var dataWords = data.words;

        	        // Unpad
        	        var i = data.sigBytes - 1;
        	        while (!((dataWords[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff)) {
        	            i--;
        	        }
        	        data.sigBytes = i + 1;
        	    }
        	};


        	return CryptoJS.pad.ZeroPadding;

        }));
        });

        var padNopadding = createCommonjsModule(function (module, exports) {
        (function (root, factory, undef) {
        	{
        		// CommonJS
        		module.exports = exports = factory(core, cipherCore);
        	}
        }(commonjsGlobal, function (CryptoJS) {

        	/**
        	 * A noop padding strategy.
        	 */
        	CryptoJS.pad.NoPadding = {
        	    pad: function () {
        	    },

        	    unpad: function () {
        	    }
        	};


        	return CryptoJS.pad.NoPadding;

        }));
        });

        var formatHex = createCommonjsModule(function (module, exports) {
        (function (root, factory, undef) {
        	{
        		// CommonJS
        		module.exports = exports = factory(core, cipherCore);
        	}
        }(commonjsGlobal, function (CryptoJS) {

        	(function (undefined$1) {
        	    // Shortcuts
        	    var C = CryptoJS;
        	    var C_lib = C.lib;
        	    var CipherParams = C_lib.CipherParams;
        	    var C_enc = C.enc;
        	    var Hex = C_enc.Hex;
        	    var C_format = C.format;

        	    var HexFormatter = C_format.Hex = {
        	        /**
        	         * Converts the ciphertext of a cipher params object to a hexadecimally encoded string.
        	         *
        	         * @param {CipherParams} cipherParams The cipher params object.
        	         *
        	         * @return {string} The hexadecimally encoded string.
        	         *
        	         * @static
        	         *
        	         * @example
        	         *
        	         *     var hexString = CryptoJS.format.Hex.stringify(cipherParams);
        	         */
        	        stringify: function (cipherParams) {
        	            return cipherParams.ciphertext.toString(Hex);
        	        },

        	        /**
        	         * Converts a hexadecimally encoded ciphertext string to a cipher params object.
        	         *
        	         * @param {string} input The hexadecimally encoded string.
        	         *
        	         * @return {CipherParams} The cipher params object.
        	         *
        	         * @static
        	         *
        	         * @example
        	         *
        	         *     var cipherParams = CryptoJS.format.Hex.parse(hexString);
        	         */
        	        parse: function (input) {
        	            var ciphertext = Hex.parse(input);
        	            return CipherParams.create({ ciphertext: ciphertext });
        	        }
        	    };
        	}());


        	return CryptoJS.format.Hex;

        }));
        });

        var aes = createCommonjsModule(function (module, exports) {
        (function (root, factory, undef) {
        	{
        		// CommonJS
        		module.exports = exports = factory(core, encBase64, md5, evpkdf, cipherCore);
        	}
        }(commonjsGlobal, function (CryptoJS) {

        	(function () {
        	    // Shortcuts
        	    var C = CryptoJS;
        	    var C_lib = C.lib;
        	    var BlockCipher = C_lib.BlockCipher;
        	    var C_algo = C.algo;

        	    // Lookup tables
        	    var SBOX = [];
        	    var INV_SBOX = [];
        	    var SUB_MIX_0 = [];
        	    var SUB_MIX_1 = [];
        	    var SUB_MIX_2 = [];
        	    var SUB_MIX_3 = [];
        	    var INV_SUB_MIX_0 = [];
        	    var INV_SUB_MIX_1 = [];
        	    var INV_SUB_MIX_2 = [];
        	    var INV_SUB_MIX_3 = [];

        	    // Compute lookup tables
        	    (function () {
        	        // Compute double table
        	        var d = [];
        	        for (var i = 0; i < 256; i++) {
        	            if (i < 128) {
        	                d[i] = i << 1;
        	            } else {
        	                d[i] = (i << 1) ^ 0x11b;
        	            }
        	        }

        	        // Walk GF(2^8)
        	        var x = 0;
        	        var xi = 0;
        	        for (var i = 0; i < 256; i++) {
        	            // Compute sbox
        	            var sx = xi ^ (xi << 1) ^ (xi << 2) ^ (xi << 3) ^ (xi << 4);
        	            sx = (sx >>> 8) ^ (sx & 0xff) ^ 0x63;
        	            SBOX[x] = sx;
        	            INV_SBOX[sx] = x;

        	            // Compute multiplication
        	            var x2 = d[x];
        	            var x4 = d[x2];
        	            var x8 = d[x4];

        	            // Compute sub bytes, mix columns tables
        	            var t = (d[sx] * 0x101) ^ (sx * 0x1010100);
        	            SUB_MIX_0[x] = (t << 24) | (t >>> 8);
        	            SUB_MIX_1[x] = (t << 16) | (t >>> 16);
        	            SUB_MIX_2[x] = (t << 8)  | (t >>> 24);
        	            SUB_MIX_3[x] = t;

        	            // Compute inv sub bytes, inv mix columns tables
        	            var t = (x8 * 0x1010101) ^ (x4 * 0x10001) ^ (x2 * 0x101) ^ (x * 0x1010100);
        	            INV_SUB_MIX_0[sx] = (t << 24) | (t >>> 8);
        	            INV_SUB_MIX_1[sx] = (t << 16) | (t >>> 16);
        	            INV_SUB_MIX_2[sx] = (t << 8)  | (t >>> 24);
        	            INV_SUB_MIX_3[sx] = t;

        	            // Compute next counter
        	            if (!x) {
        	                x = xi = 1;
        	            } else {
        	                x = x2 ^ d[d[d[x8 ^ x2]]];
        	                xi ^= d[d[xi]];
        	            }
        	        }
        	    }());

        	    // Precomputed Rcon lookup
        	    var RCON = [0x00, 0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36];

        	    /**
        	     * AES block cipher algorithm.
        	     */
        	    var AES = C_algo.AES = BlockCipher.extend({
        	        _doReset: function () {
        	            // Skip reset of nRounds has been set before and key did not change
        	            if (this._nRounds && this._keyPriorReset === this._key) {
        	                return;
        	            }

        	            // Shortcuts
        	            var key = this._keyPriorReset = this._key;
        	            var keyWords = key.words;
        	            var keySize = key.sigBytes / 4;

        	            // Compute number of rounds
        	            var nRounds = this._nRounds = keySize + 6;

        	            // Compute number of key schedule rows
        	            var ksRows = (nRounds + 1) * 4;

        	            // Compute key schedule
        	            var keySchedule = this._keySchedule = [];
        	            for (var ksRow = 0; ksRow < ksRows; ksRow++) {
        	                if (ksRow < keySize) {
        	                    keySchedule[ksRow] = keyWords[ksRow];
        	                } else {
        	                    var t = keySchedule[ksRow - 1];

        	                    if (!(ksRow % keySize)) {
        	                        // Rot word
        	                        t = (t << 8) | (t >>> 24);

        	                        // Sub word
        	                        t = (SBOX[t >>> 24] << 24) | (SBOX[(t >>> 16) & 0xff] << 16) | (SBOX[(t >>> 8) & 0xff] << 8) | SBOX[t & 0xff];

        	                        // Mix Rcon
        	                        t ^= RCON[(ksRow / keySize) | 0] << 24;
        	                    } else if (keySize > 6 && ksRow % keySize == 4) {
        	                        // Sub word
        	                        t = (SBOX[t >>> 24] << 24) | (SBOX[(t >>> 16) & 0xff] << 16) | (SBOX[(t >>> 8) & 0xff] << 8) | SBOX[t & 0xff];
        	                    }

        	                    keySchedule[ksRow] = keySchedule[ksRow - keySize] ^ t;
        	                }
        	            }

        	            // Compute inv key schedule
        	            var invKeySchedule = this._invKeySchedule = [];
        	            for (var invKsRow = 0; invKsRow < ksRows; invKsRow++) {
        	                var ksRow = ksRows - invKsRow;

        	                if (invKsRow % 4) {
        	                    var t = keySchedule[ksRow];
        	                } else {
        	                    var t = keySchedule[ksRow - 4];
        	                }

        	                if (invKsRow < 4 || ksRow <= 4) {
        	                    invKeySchedule[invKsRow] = t;
        	                } else {
        	                    invKeySchedule[invKsRow] = INV_SUB_MIX_0[SBOX[t >>> 24]] ^ INV_SUB_MIX_1[SBOX[(t >>> 16) & 0xff]] ^
        	                                               INV_SUB_MIX_2[SBOX[(t >>> 8) & 0xff]] ^ INV_SUB_MIX_3[SBOX[t & 0xff]];
        	                }
        	            }
        	        },

        	        encryptBlock: function (M, offset) {
        	            this._doCryptBlock(M, offset, this._keySchedule, SUB_MIX_0, SUB_MIX_1, SUB_MIX_2, SUB_MIX_3, SBOX);
        	        },

        	        decryptBlock: function (M, offset) {
        	            // Swap 2nd and 4th rows
        	            var t = M[offset + 1];
        	            M[offset + 1] = M[offset + 3];
        	            M[offset + 3] = t;

        	            this._doCryptBlock(M, offset, this._invKeySchedule, INV_SUB_MIX_0, INV_SUB_MIX_1, INV_SUB_MIX_2, INV_SUB_MIX_3, INV_SBOX);

        	            // Inv swap 2nd and 4th rows
        	            var t = M[offset + 1];
        	            M[offset + 1] = M[offset + 3];
        	            M[offset + 3] = t;
        	        },

        	        _doCryptBlock: function (M, offset, keySchedule, SUB_MIX_0, SUB_MIX_1, SUB_MIX_2, SUB_MIX_3, SBOX) {
        	            // Shortcut
        	            var nRounds = this._nRounds;

        	            // Get input, add round key
        	            var s0 = M[offset]     ^ keySchedule[0];
        	            var s1 = M[offset + 1] ^ keySchedule[1];
        	            var s2 = M[offset + 2] ^ keySchedule[2];
        	            var s3 = M[offset + 3] ^ keySchedule[3];

        	            // Key schedule row counter
        	            var ksRow = 4;

        	            // Rounds
        	            for (var round = 1; round < nRounds; round++) {
        	                // Shift rows, sub bytes, mix columns, add round key
        	                var t0 = SUB_MIX_0[s0 >>> 24] ^ SUB_MIX_1[(s1 >>> 16) & 0xff] ^ SUB_MIX_2[(s2 >>> 8) & 0xff] ^ SUB_MIX_3[s3 & 0xff] ^ keySchedule[ksRow++];
        	                var t1 = SUB_MIX_0[s1 >>> 24] ^ SUB_MIX_1[(s2 >>> 16) & 0xff] ^ SUB_MIX_2[(s3 >>> 8) & 0xff] ^ SUB_MIX_3[s0 & 0xff] ^ keySchedule[ksRow++];
        	                var t2 = SUB_MIX_0[s2 >>> 24] ^ SUB_MIX_1[(s3 >>> 16) & 0xff] ^ SUB_MIX_2[(s0 >>> 8) & 0xff] ^ SUB_MIX_3[s1 & 0xff] ^ keySchedule[ksRow++];
        	                var t3 = SUB_MIX_0[s3 >>> 24] ^ SUB_MIX_1[(s0 >>> 16) & 0xff] ^ SUB_MIX_2[(s1 >>> 8) & 0xff] ^ SUB_MIX_3[s2 & 0xff] ^ keySchedule[ksRow++];

        	                // Update state
        	                s0 = t0;
        	                s1 = t1;
        	                s2 = t2;
        	                s3 = t3;
        	            }

        	            // Shift rows, sub bytes, add round key
        	            var t0 = ((SBOX[s0 >>> 24] << 24) | (SBOX[(s1 >>> 16) & 0xff] << 16) | (SBOX[(s2 >>> 8) & 0xff] << 8) | SBOX[s3 & 0xff]) ^ keySchedule[ksRow++];
        	            var t1 = ((SBOX[s1 >>> 24] << 24) | (SBOX[(s2 >>> 16) & 0xff] << 16) | (SBOX[(s3 >>> 8) & 0xff] << 8) | SBOX[s0 & 0xff]) ^ keySchedule[ksRow++];
        	            var t2 = ((SBOX[s2 >>> 24] << 24) | (SBOX[(s3 >>> 16) & 0xff] << 16) | (SBOX[(s0 >>> 8) & 0xff] << 8) | SBOX[s1 & 0xff]) ^ keySchedule[ksRow++];
        	            var t3 = ((SBOX[s3 >>> 24] << 24) | (SBOX[(s0 >>> 16) & 0xff] << 16) | (SBOX[(s1 >>> 8) & 0xff] << 8) | SBOX[s2 & 0xff]) ^ keySchedule[ksRow++];

        	            // Set output
        	            M[offset]     = t0;
        	            M[offset + 1] = t1;
        	            M[offset + 2] = t2;
        	            M[offset + 3] = t3;
        	        },

        	        keySize: 256/32
        	    });

        	    /**
        	     * Shortcut functions to the cipher's object interface.
        	     *
        	     * @example
        	     *
        	     *     var ciphertext = CryptoJS.AES.encrypt(message, key, cfg);
        	     *     var plaintext  = CryptoJS.AES.decrypt(ciphertext, key, cfg);
        	     */
        	    C.AES = BlockCipher._createHelper(AES);
        	}());


        	return CryptoJS.AES;

        }));
        });

        var tripledes = createCommonjsModule(function (module, exports) {
        (function (root, factory, undef) {
        	{
        		// CommonJS
        		module.exports = exports = factory(core, encBase64, md5, evpkdf, cipherCore);
        	}
        }(commonjsGlobal, function (CryptoJS) {

        	(function () {
        	    // Shortcuts
        	    var C = CryptoJS;
        	    var C_lib = C.lib;
        	    var WordArray = C_lib.WordArray;
        	    var BlockCipher = C_lib.BlockCipher;
        	    var C_algo = C.algo;

        	    // Permuted Choice 1 constants
        	    var PC1 = [
        	        57, 49, 41, 33, 25, 17, 9,  1,
        	        58, 50, 42, 34, 26, 18, 10, 2,
        	        59, 51, 43, 35, 27, 19, 11, 3,
        	        60, 52, 44, 36, 63, 55, 47, 39,
        	        31, 23, 15, 7,  62, 54, 46, 38,
        	        30, 22, 14, 6,  61, 53, 45, 37,
        	        29, 21, 13, 5,  28, 20, 12, 4
        	    ];

        	    // Permuted Choice 2 constants
        	    var PC2 = [
        	        14, 17, 11, 24, 1,  5,
        	        3,  28, 15, 6,  21, 10,
        	        23, 19, 12, 4,  26, 8,
        	        16, 7,  27, 20, 13, 2,
        	        41, 52, 31, 37, 47, 55,
        	        30, 40, 51, 45, 33, 48,
        	        44, 49, 39, 56, 34, 53,
        	        46, 42, 50, 36, 29, 32
        	    ];

        	    // Cumulative bit shift constants
        	    var BIT_SHIFTS = [1,  2,  4,  6,  8,  10, 12, 14, 15, 17, 19, 21, 23, 25, 27, 28];

        	    // SBOXes and round permutation constants
        	    var SBOX_P = [
        	        {
        	            0x0: 0x808200,
        	            0x10000000: 0x8000,
        	            0x20000000: 0x808002,
        	            0x30000000: 0x2,
        	            0x40000000: 0x200,
        	            0x50000000: 0x808202,
        	            0x60000000: 0x800202,
        	            0x70000000: 0x800000,
        	            0x80000000: 0x202,
        	            0x90000000: 0x800200,
        	            0xa0000000: 0x8200,
        	            0xb0000000: 0x808000,
        	            0xc0000000: 0x8002,
        	            0xd0000000: 0x800002,
        	            0xe0000000: 0x0,
        	            0xf0000000: 0x8202,
        	            0x8000000: 0x0,
        	            0x18000000: 0x808202,
        	            0x28000000: 0x8202,
        	            0x38000000: 0x8000,
        	            0x48000000: 0x808200,
        	            0x58000000: 0x200,
        	            0x68000000: 0x808002,
        	            0x78000000: 0x2,
        	            0x88000000: 0x800200,
        	            0x98000000: 0x8200,
        	            0xa8000000: 0x808000,
        	            0xb8000000: 0x800202,
        	            0xc8000000: 0x800002,
        	            0xd8000000: 0x8002,
        	            0xe8000000: 0x202,
        	            0xf8000000: 0x800000,
        	            0x1: 0x8000,
        	            0x10000001: 0x2,
        	            0x20000001: 0x808200,
        	            0x30000001: 0x800000,
        	            0x40000001: 0x808002,
        	            0x50000001: 0x8200,
        	            0x60000001: 0x200,
        	            0x70000001: 0x800202,
        	            0x80000001: 0x808202,
        	            0x90000001: 0x808000,
        	            0xa0000001: 0x800002,
        	            0xb0000001: 0x8202,
        	            0xc0000001: 0x202,
        	            0xd0000001: 0x800200,
        	            0xe0000001: 0x8002,
        	            0xf0000001: 0x0,
        	            0x8000001: 0x808202,
        	            0x18000001: 0x808000,
        	            0x28000001: 0x800000,
        	            0x38000001: 0x200,
        	            0x48000001: 0x8000,
        	            0x58000001: 0x800002,
        	            0x68000001: 0x2,
        	            0x78000001: 0x8202,
        	            0x88000001: 0x8002,
        	            0x98000001: 0x800202,
        	            0xa8000001: 0x202,
        	            0xb8000001: 0x808200,
        	            0xc8000001: 0x800200,
        	            0xd8000001: 0x0,
        	            0xe8000001: 0x8200,
        	            0xf8000001: 0x808002
        	        },
        	        {
        	            0x0: 0x40084010,
        	            0x1000000: 0x4000,
        	            0x2000000: 0x80000,
        	            0x3000000: 0x40080010,
        	            0x4000000: 0x40000010,
        	            0x5000000: 0x40084000,
        	            0x6000000: 0x40004000,
        	            0x7000000: 0x10,
        	            0x8000000: 0x84000,
        	            0x9000000: 0x40004010,
        	            0xa000000: 0x40000000,
        	            0xb000000: 0x84010,
        	            0xc000000: 0x80010,
        	            0xd000000: 0x0,
        	            0xe000000: 0x4010,
        	            0xf000000: 0x40080000,
        	            0x800000: 0x40004000,
        	            0x1800000: 0x84010,
        	            0x2800000: 0x10,
        	            0x3800000: 0x40004010,
        	            0x4800000: 0x40084010,
        	            0x5800000: 0x40000000,
        	            0x6800000: 0x80000,
        	            0x7800000: 0x40080010,
        	            0x8800000: 0x80010,
        	            0x9800000: 0x0,
        	            0xa800000: 0x4000,
        	            0xb800000: 0x40080000,
        	            0xc800000: 0x40000010,
        	            0xd800000: 0x84000,
        	            0xe800000: 0x40084000,
        	            0xf800000: 0x4010,
        	            0x10000000: 0x0,
        	            0x11000000: 0x40080010,
        	            0x12000000: 0x40004010,
        	            0x13000000: 0x40084000,
        	            0x14000000: 0x40080000,
        	            0x15000000: 0x10,
        	            0x16000000: 0x84010,
        	            0x17000000: 0x4000,
        	            0x18000000: 0x4010,
        	            0x19000000: 0x80000,
        	            0x1a000000: 0x80010,
        	            0x1b000000: 0x40000010,
        	            0x1c000000: 0x84000,
        	            0x1d000000: 0x40004000,
        	            0x1e000000: 0x40000000,
        	            0x1f000000: 0x40084010,
        	            0x10800000: 0x84010,
        	            0x11800000: 0x80000,
        	            0x12800000: 0x40080000,
        	            0x13800000: 0x4000,
        	            0x14800000: 0x40004000,
        	            0x15800000: 0x40084010,
        	            0x16800000: 0x10,
        	            0x17800000: 0x40000000,
        	            0x18800000: 0x40084000,
        	            0x19800000: 0x40000010,
        	            0x1a800000: 0x40004010,
        	            0x1b800000: 0x80010,
        	            0x1c800000: 0x0,
        	            0x1d800000: 0x4010,
        	            0x1e800000: 0x40080010,
        	            0x1f800000: 0x84000
        	        },
        	        {
        	            0x0: 0x104,
        	            0x100000: 0x0,
        	            0x200000: 0x4000100,
        	            0x300000: 0x10104,
        	            0x400000: 0x10004,
        	            0x500000: 0x4000004,
        	            0x600000: 0x4010104,
        	            0x700000: 0x4010000,
        	            0x800000: 0x4000000,
        	            0x900000: 0x4010100,
        	            0xa00000: 0x10100,
        	            0xb00000: 0x4010004,
        	            0xc00000: 0x4000104,
        	            0xd00000: 0x10000,
        	            0xe00000: 0x4,
        	            0xf00000: 0x100,
        	            0x80000: 0x4010100,
        	            0x180000: 0x4010004,
        	            0x280000: 0x0,
        	            0x380000: 0x4000100,
        	            0x480000: 0x4000004,
        	            0x580000: 0x10000,
        	            0x680000: 0x10004,
        	            0x780000: 0x104,
        	            0x880000: 0x4,
        	            0x980000: 0x100,
        	            0xa80000: 0x4010000,
        	            0xb80000: 0x10104,
        	            0xc80000: 0x10100,
        	            0xd80000: 0x4000104,
        	            0xe80000: 0x4010104,
        	            0xf80000: 0x4000000,
        	            0x1000000: 0x4010100,
        	            0x1100000: 0x10004,
        	            0x1200000: 0x10000,
        	            0x1300000: 0x4000100,
        	            0x1400000: 0x100,
        	            0x1500000: 0x4010104,
        	            0x1600000: 0x4000004,
        	            0x1700000: 0x0,
        	            0x1800000: 0x4000104,
        	            0x1900000: 0x4000000,
        	            0x1a00000: 0x4,
        	            0x1b00000: 0x10100,
        	            0x1c00000: 0x4010000,
        	            0x1d00000: 0x104,
        	            0x1e00000: 0x10104,
        	            0x1f00000: 0x4010004,
        	            0x1080000: 0x4000000,
        	            0x1180000: 0x104,
        	            0x1280000: 0x4010100,
        	            0x1380000: 0x0,
        	            0x1480000: 0x10004,
        	            0x1580000: 0x4000100,
        	            0x1680000: 0x100,
        	            0x1780000: 0x4010004,
        	            0x1880000: 0x10000,
        	            0x1980000: 0x4010104,
        	            0x1a80000: 0x10104,
        	            0x1b80000: 0x4000004,
        	            0x1c80000: 0x4000104,
        	            0x1d80000: 0x4010000,
        	            0x1e80000: 0x4,
        	            0x1f80000: 0x10100
        	        },
        	        {
        	            0x0: 0x80401000,
        	            0x10000: 0x80001040,
        	            0x20000: 0x401040,
        	            0x30000: 0x80400000,
        	            0x40000: 0x0,
        	            0x50000: 0x401000,
        	            0x60000: 0x80000040,
        	            0x70000: 0x400040,
        	            0x80000: 0x80000000,
        	            0x90000: 0x400000,
        	            0xa0000: 0x40,
        	            0xb0000: 0x80001000,
        	            0xc0000: 0x80400040,
        	            0xd0000: 0x1040,
        	            0xe0000: 0x1000,
        	            0xf0000: 0x80401040,
        	            0x8000: 0x80001040,
        	            0x18000: 0x40,
        	            0x28000: 0x80400040,
        	            0x38000: 0x80001000,
        	            0x48000: 0x401000,
        	            0x58000: 0x80401040,
        	            0x68000: 0x0,
        	            0x78000: 0x80400000,
        	            0x88000: 0x1000,
        	            0x98000: 0x80401000,
        	            0xa8000: 0x400000,
        	            0xb8000: 0x1040,
        	            0xc8000: 0x80000000,
        	            0xd8000: 0x400040,
        	            0xe8000: 0x401040,
        	            0xf8000: 0x80000040,
        	            0x100000: 0x400040,
        	            0x110000: 0x401000,
        	            0x120000: 0x80000040,
        	            0x130000: 0x0,
        	            0x140000: 0x1040,
        	            0x150000: 0x80400040,
        	            0x160000: 0x80401000,
        	            0x170000: 0x80001040,
        	            0x180000: 0x80401040,
        	            0x190000: 0x80000000,
        	            0x1a0000: 0x80400000,
        	            0x1b0000: 0x401040,
        	            0x1c0000: 0x80001000,
        	            0x1d0000: 0x400000,
        	            0x1e0000: 0x40,
        	            0x1f0000: 0x1000,
        	            0x108000: 0x80400000,
        	            0x118000: 0x80401040,
        	            0x128000: 0x0,
        	            0x138000: 0x401000,
        	            0x148000: 0x400040,
        	            0x158000: 0x80000000,
        	            0x168000: 0x80001040,
        	            0x178000: 0x40,
        	            0x188000: 0x80000040,
        	            0x198000: 0x1000,
        	            0x1a8000: 0x80001000,
        	            0x1b8000: 0x80400040,
        	            0x1c8000: 0x1040,
        	            0x1d8000: 0x80401000,
        	            0x1e8000: 0x400000,
        	            0x1f8000: 0x401040
        	        },
        	        {
        	            0x0: 0x80,
        	            0x1000: 0x1040000,
        	            0x2000: 0x40000,
        	            0x3000: 0x20000000,
        	            0x4000: 0x20040080,
        	            0x5000: 0x1000080,
        	            0x6000: 0x21000080,
        	            0x7000: 0x40080,
        	            0x8000: 0x1000000,
        	            0x9000: 0x20040000,
        	            0xa000: 0x20000080,
        	            0xb000: 0x21040080,
        	            0xc000: 0x21040000,
        	            0xd000: 0x0,
        	            0xe000: 0x1040080,
        	            0xf000: 0x21000000,
        	            0x800: 0x1040080,
        	            0x1800: 0x21000080,
        	            0x2800: 0x80,
        	            0x3800: 0x1040000,
        	            0x4800: 0x40000,
        	            0x5800: 0x20040080,
        	            0x6800: 0x21040000,
        	            0x7800: 0x20000000,
        	            0x8800: 0x20040000,
        	            0x9800: 0x0,
        	            0xa800: 0x21040080,
        	            0xb800: 0x1000080,
        	            0xc800: 0x20000080,
        	            0xd800: 0x21000000,
        	            0xe800: 0x1000000,
        	            0xf800: 0x40080,
        	            0x10000: 0x40000,
        	            0x11000: 0x80,
        	            0x12000: 0x20000000,
        	            0x13000: 0x21000080,
        	            0x14000: 0x1000080,
        	            0x15000: 0x21040000,
        	            0x16000: 0x20040080,
        	            0x17000: 0x1000000,
        	            0x18000: 0x21040080,
        	            0x19000: 0x21000000,
        	            0x1a000: 0x1040000,
        	            0x1b000: 0x20040000,
        	            0x1c000: 0x40080,
        	            0x1d000: 0x20000080,
        	            0x1e000: 0x0,
        	            0x1f000: 0x1040080,
        	            0x10800: 0x21000080,
        	            0x11800: 0x1000000,
        	            0x12800: 0x1040000,
        	            0x13800: 0x20040080,
        	            0x14800: 0x20000000,
        	            0x15800: 0x1040080,
        	            0x16800: 0x80,
        	            0x17800: 0x21040000,
        	            0x18800: 0x40080,
        	            0x19800: 0x21040080,
        	            0x1a800: 0x0,
        	            0x1b800: 0x21000000,
        	            0x1c800: 0x1000080,
        	            0x1d800: 0x40000,
        	            0x1e800: 0x20040000,
        	            0x1f800: 0x20000080
        	        },
        	        {
        	            0x0: 0x10000008,
        	            0x100: 0x2000,
        	            0x200: 0x10200000,
        	            0x300: 0x10202008,
        	            0x400: 0x10002000,
        	            0x500: 0x200000,
        	            0x600: 0x200008,
        	            0x700: 0x10000000,
        	            0x800: 0x0,
        	            0x900: 0x10002008,
        	            0xa00: 0x202000,
        	            0xb00: 0x8,
        	            0xc00: 0x10200008,
        	            0xd00: 0x202008,
        	            0xe00: 0x2008,
        	            0xf00: 0x10202000,
        	            0x80: 0x10200000,
        	            0x180: 0x10202008,
        	            0x280: 0x8,
        	            0x380: 0x200000,
        	            0x480: 0x202008,
        	            0x580: 0x10000008,
        	            0x680: 0x10002000,
        	            0x780: 0x2008,
        	            0x880: 0x200008,
        	            0x980: 0x2000,
        	            0xa80: 0x10002008,
        	            0xb80: 0x10200008,
        	            0xc80: 0x0,
        	            0xd80: 0x10202000,
        	            0xe80: 0x202000,
        	            0xf80: 0x10000000,
        	            0x1000: 0x10002000,
        	            0x1100: 0x10200008,
        	            0x1200: 0x10202008,
        	            0x1300: 0x2008,
        	            0x1400: 0x200000,
        	            0x1500: 0x10000000,
        	            0x1600: 0x10000008,
        	            0x1700: 0x202000,
        	            0x1800: 0x202008,
        	            0x1900: 0x0,
        	            0x1a00: 0x8,
        	            0x1b00: 0x10200000,
        	            0x1c00: 0x2000,
        	            0x1d00: 0x10002008,
        	            0x1e00: 0x10202000,
        	            0x1f00: 0x200008,
        	            0x1080: 0x8,
        	            0x1180: 0x202000,
        	            0x1280: 0x200000,
        	            0x1380: 0x10000008,
        	            0x1480: 0x10002000,
        	            0x1580: 0x2008,
        	            0x1680: 0x10202008,
        	            0x1780: 0x10200000,
        	            0x1880: 0x10202000,
        	            0x1980: 0x10200008,
        	            0x1a80: 0x2000,
        	            0x1b80: 0x202008,
        	            0x1c80: 0x200008,
        	            0x1d80: 0x0,
        	            0x1e80: 0x10000000,
        	            0x1f80: 0x10002008
        	        },
        	        {
        	            0x0: 0x100000,
        	            0x10: 0x2000401,
        	            0x20: 0x400,
        	            0x30: 0x100401,
        	            0x40: 0x2100401,
        	            0x50: 0x0,
        	            0x60: 0x1,
        	            0x70: 0x2100001,
        	            0x80: 0x2000400,
        	            0x90: 0x100001,
        	            0xa0: 0x2000001,
        	            0xb0: 0x2100400,
        	            0xc0: 0x2100000,
        	            0xd0: 0x401,
        	            0xe0: 0x100400,
        	            0xf0: 0x2000000,
        	            0x8: 0x2100001,
        	            0x18: 0x0,
        	            0x28: 0x2000401,
        	            0x38: 0x2100400,
        	            0x48: 0x100000,
        	            0x58: 0x2000001,
        	            0x68: 0x2000000,
        	            0x78: 0x401,
        	            0x88: 0x100401,
        	            0x98: 0x2000400,
        	            0xa8: 0x2100000,
        	            0xb8: 0x100001,
        	            0xc8: 0x400,
        	            0xd8: 0x2100401,
        	            0xe8: 0x1,
        	            0xf8: 0x100400,
        	            0x100: 0x2000000,
        	            0x110: 0x100000,
        	            0x120: 0x2000401,
        	            0x130: 0x2100001,
        	            0x140: 0x100001,
        	            0x150: 0x2000400,
        	            0x160: 0x2100400,
        	            0x170: 0x100401,
        	            0x180: 0x401,
        	            0x190: 0x2100401,
        	            0x1a0: 0x100400,
        	            0x1b0: 0x1,
        	            0x1c0: 0x0,
        	            0x1d0: 0x2100000,
        	            0x1e0: 0x2000001,
        	            0x1f0: 0x400,
        	            0x108: 0x100400,
        	            0x118: 0x2000401,
        	            0x128: 0x2100001,
        	            0x138: 0x1,
        	            0x148: 0x2000000,
        	            0x158: 0x100000,
        	            0x168: 0x401,
        	            0x178: 0x2100400,
        	            0x188: 0x2000001,
        	            0x198: 0x2100000,
        	            0x1a8: 0x0,
        	            0x1b8: 0x2100401,
        	            0x1c8: 0x100401,
        	            0x1d8: 0x400,
        	            0x1e8: 0x2000400,
        	            0x1f8: 0x100001
        	        },
        	        {
        	            0x0: 0x8000820,
        	            0x1: 0x20000,
        	            0x2: 0x8000000,
        	            0x3: 0x20,
        	            0x4: 0x20020,
        	            0x5: 0x8020820,
        	            0x6: 0x8020800,
        	            0x7: 0x800,
        	            0x8: 0x8020000,
        	            0x9: 0x8000800,
        	            0xa: 0x20800,
        	            0xb: 0x8020020,
        	            0xc: 0x820,
        	            0xd: 0x0,
        	            0xe: 0x8000020,
        	            0xf: 0x20820,
        	            0x80000000: 0x800,
        	            0x80000001: 0x8020820,
        	            0x80000002: 0x8000820,
        	            0x80000003: 0x8000000,
        	            0x80000004: 0x8020000,
        	            0x80000005: 0x20800,
        	            0x80000006: 0x20820,
        	            0x80000007: 0x20,
        	            0x80000008: 0x8000020,
        	            0x80000009: 0x820,
        	            0x8000000a: 0x20020,
        	            0x8000000b: 0x8020800,
        	            0x8000000c: 0x0,
        	            0x8000000d: 0x8020020,
        	            0x8000000e: 0x8000800,
        	            0x8000000f: 0x20000,
        	            0x10: 0x20820,
        	            0x11: 0x8020800,
        	            0x12: 0x20,
        	            0x13: 0x800,
        	            0x14: 0x8000800,
        	            0x15: 0x8000020,
        	            0x16: 0x8020020,
        	            0x17: 0x20000,
        	            0x18: 0x0,
        	            0x19: 0x20020,
        	            0x1a: 0x8020000,
        	            0x1b: 0x8000820,
        	            0x1c: 0x8020820,
        	            0x1d: 0x20800,
        	            0x1e: 0x820,
        	            0x1f: 0x8000000,
        	            0x80000010: 0x20000,
        	            0x80000011: 0x800,
        	            0x80000012: 0x8020020,
        	            0x80000013: 0x20820,
        	            0x80000014: 0x20,
        	            0x80000015: 0x8020000,
        	            0x80000016: 0x8000000,
        	            0x80000017: 0x8000820,
        	            0x80000018: 0x8020820,
        	            0x80000019: 0x8000020,
        	            0x8000001a: 0x8000800,
        	            0x8000001b: 0x0,
        	            0x8000001c: 0x20800,
        	            0x8000001d: 0x820,
        	            0x8000001e: 0x20020,
        	            0x8000001f: 0x8020800
        	        }
        	    ];

        	    // Masks that select the SBOX input
        	    var SBOX_MASK = [
        	        0xf8000001, 0x1f800000, 0x01f80000, 0x001f8000,
        	        0x0001f800, 0x00001f80, 0x000001f8, 0x8000001f
        	    ];

        	    /**
        	     * DES block cipher algorithm.
        	     */
        	    var DES = C_algo.DES = BlockCipher.extend({
        	        _doReset: function () {
        	            // Shortcuts
        	            var key = this._key;
        	            var keyWords = key.words;

        	            // Select 56 bits according to PC1
        	            var keyBits = [];
        	            for (var i = 0; i < 56; i++) {
        	                var keyBitPos = PC1[i] - 1;
        	                keyBits[i] = (keyWords[keyBitPos >>> 5] >>> (31 - keyBitPos % 32)) & 1;
        	            }

        	            // Assemble 16 subkeys
        	            var subKeys = this._subKeys = [];
        	            for (var nSubKey = 0; nSubKey < 16; nSubKey++) {
        	                // Create subkey
        	                var subKey = subKeys[nSubKey] = [];

        	                // Shortcut
        	                var bitShift = BIT_SHIFTS[nSubKey];

        	                // Select 48 bits according to PC2
        	                for (var i = 0; i < 24; i++) {
        	                    // Select from the left 28 key bits
        	                    subKey[(i / 6) | 0] |= keyBits[((PC2[i] - 1) + bitShift) % 28] << (31 - i % 6);

        	                    // Select from the right 28 key bits
        	                    subKey[4 + ((i / 6) | 0)] |= keyBits[28 + (((PC2[i + 24] - 1) + bitShift) % 28)] << (31 - i % 6);
        	                }

        	                // Since each subkey is applied to an expanded 32-bit input,
        	                // the subkey can be broken into 8 values scaled to 32-bits,
        	                // which allows the key to be used without expansion
        	                subKey[0] = (subKey[0] << 1) | (subKey[0] >>> 31);
        	                for (var i = 1; i < 7; i++) {
        	                    subKey[i] = subKey[i] >>> ((i - 1) * 4 + 3);
        	                }
        	                subKey[7] = (subKey[7] << 5) | (subKey[7] >>> 27);
        	            }

        	            // Compute inverse subkeys
        	            var invSubKeys = this._invSubKeys = [];
        	            for (var i = 0; i < 16; i++) {
        	                invSubKeys[i] = subKeys[15 - i];
        	            }
        	        },

        	        encryptBlock: function (M, offset) {
        	            this._doCryptBlock(M, offset, this._subKeys);
        	        },

        	        decryptBlock: function (M, offset) {
        	            this._doCryptBlock(M, offset, this._invSubKeys);
        	        },

        	        _doCryptBlock: function (M, offset, subKeys) {
        	            // Get input
        	            this._lBlock = M[offset];
        	            this._rBlock = M[offset + 1];

        	            // Initial permutation
        	            exchangeLR.call(this, 4,  0x0f0f0f0f);
        	            exchangeLR.call(this, 16, 0x0000ffff);
        	            exchangeRL.call(this, 2,  0x33333333);
        	            exchangeRL.call(this, 8,  0x00ff00ff);
        	            exchangeLR.call(this, 1,  0x55555555);

        	            // Rounds
        	            for (var round = 0; round < 16; round++) {
        	                // Shortcuts
        	                var subKey = subKeys[round];
        	                var lBlock = this._lBlock;
        	                var rBlock = this._rBlock;

        	                // Feistel function
        	                var f = 0;
        	                for (var i = 0; i < 8; i++) {
        	                    f |= SBOX_P[i][((rBlock ^ subKey[i]) & SBOX_MASK[i]) >>> 0];
        	                }
        	                this._lBlock = rBlock;
        	                this._rBlock = lBlock ^ f;
        	            }

        	            // Undo swap from last round
        	            var t = this._lBlock;
        	            this._lBlock = this._rBlock;
        	            this._rBlock = t;

        	            // Final permutation
        	            exchangeLR.call(this, 1,  0x55555555);
        	            exchangeRL.call(this, 8,  0x00ff00ff);
        	            exchangeRL.call(this, 2,  0x33333333);
        	            exchangeLR.call(this, 16, 0x0000ffff);
        	            exchangeLR.call(this, 4,  0x0f0f0f0f);

        	            // Set output
        	            M[offset] = this._lBlock;
        	            M[offset + 1] = this._rBlock;
        	        },

        	        keySize: 64/32,

        	        ivSize: 64/32,

        	        blockSize: 64/32
        	    });

        	    // Swap bits across the left and right words
        	    function exchangeLR(offset, mask) {
        	        var t = ((this._lBlock >>> offset) ^ this._rBlock) & mask;
        	        this._rBlock ^= t;
        	        this._lBlock ^= t << offset;
        	    }

        	    function exchangeRL(offset, mask) {
        	        var t = ((this._rBlock >>> offset) ^ this._lBlock) & mask;
        	        this._lBlock ^= t;
        	        this._rBlock ^= t << offset;
        	    }

        	    /**
        	     * Shortcut functions to the cipher's object interface.
        	     *
        	     * @example
        	     *
        	     *     var ciphertext = CryptoJS.DES.encrypt(message, key, cfg);
        	     *     var plaintext  = CryptoJS.DES.decrypt(ciphertext, key, cfg);
        	     */
        	    C.DES = BlockCipher._createHelper(DES);

        	    /**
        	     * Triple-DES block cipher algorithm.
        	     */
        	    var TripleDES = C_algo.TripleDES = BlockCipher.extend({
        	        _doReset: function () {
        	            // Shortcuts
        	            var key = this._key;
        	            var keyWords = key.words;

        	            // Create DES instances
        	            this._des1 = DES.createEncryptor(WordArray.create(keyWords.slice(0, 2)));
        	            this._des2 = DES.createEncryptor(WordArray.create(keyWords.slice(2, 4)));
        	            this._des3 = DES.createEncryptor(WordArray.create(keyWords.slice(4, 6)));
        	        },

        	        encryptBlock: function (M, offset) {
        	            this._des1.encryptBlock(M, offset);
        	            this._des2.decryptBlock(M, offset);
        	            this._des3.encryptBlock(M, offset);
        	        },

        	        decryptBlock: function (M, offset) {
        	            this._des3.decryptBlock(M, offset);
        	            this._des2.encryptBlock(M, offset);
        	            this._des1.decryptBlock(M, offset);
        	        },

        	        keySize: 192/32,

        	        ivSize: 64/32,

        	        blockSize: 64/32
        	    });

        	    /**
        	     * Shortcut functions to the cipher's object interface.
        	     *
        	     * @example
        	     *
        	     *     var ciphertext = CryptoJS.TripleDES.encrypt(message, key, cfg);
        	     *     var plaintext  = CryptoJS.TripleDES.decrypt(ciphertext, key, cfg);
        	     */
        	    C.TripleDES = BlockCipher._createHelper(TripleDES);
        	}());


        	return CryptoJS.TripleDES;

        }));
        });

        var rc4 = createCommonjsModule(function (module, exports) {
        (function (root, factory, undef) {
        	{
        		// CommonJS
        		module.exports = exports = factory(core, encBase64, md5, evpkdf, cipherCore);
        	}
        }(commonjsGlobal, function (CryptoJS) {

        	(function () {
        	    // Shortcuts
        	    var C = CryptoJS;
        	    var C_lib = C.lib;
        	    var StreamCipher = C_lib.StreamCipher;
        	    var C_algo = C.algo;

        	    /**
        	     * RC4 stream cipher algorithm.
        	     */
        	    var RC4 = C_algo.RC4 = StreamCipher.extend({
        	        _doReset: function () {
        	            // Shortcuts
        	            var key = this._key;
        	            var keyWords = key.words;
        	            var keySigBytes = key.sigBytes;

        	            // Init sbox
        	            var S = this._S = [];
        	            for (var i = 0; i < 256; i++) {
        	                S[i] = i;
        	            }

        	            // Key setup
        	            for (var i = 0, j = 0; i < 256; i++) {
        	                var keyByteIndex = i % keySigBytes;
        	                var keyByte = (keyWords[keyByteIndex >>> 2] >>> (24 - (keyByteIndex % 4) * 8)) & 0xff;

        	                j = (j + S[i] + keyByte) % 256;

        	                // Swap
        	                var t = S[i];
        	                S[i] = S[j];
        	                S[j] = t;
        	            }

        	            // Counters
        	            this._i = this._j = 0;
        	        },

        	        _doProcessBlock: function (M, offset) {
        	            M[offset] ^= generateKeystreamWord.call(this);
        	        },

        	        keySize: 256/32,

        	        ivSize: 0
        	    });

        	    function generateKeystreamWord() {
        	        // Shortcuts
        	        var S = this._S;
        	        var i = this._i;
        	        var j = this._j;

        	        // Generate keystream word
        	        var keystreamWord = 0;
        	        for (var n = 0; n < 4; n++) {
        	            i = (i + 1) % 256;
        	            j = (j + S[i]) % 256;

        	            // Swap
        	            var t = S[i];
        	            S[i] = S[j];
        	            S[j] = t;

        	            keystreamWord |= S[(S[i] + S[j]) % 256] << (24 - n * 8);
        	        }

        	        // Update counters
        	        this._i = i;
        	        this._j = j;

        	        return keystreamWord;
        	    }

        	    /**
        	     * Shortcut functions to the cipher's object interface.
        	     *
        	     * @example
        	     *
        	     *     var ciphertext = CryptoJS.RC4.encrypt(message, key, cfg);
        	     *     var plaintext  = CryptoJS.RC4.decrypt(ciphertext, key, cfg);
        	     */
        	    C.RC4 = StreamCipher._createHelper(RC4);

        	    /**
        	     * Modified RC4 stream cipher algorithm.
        	     */
        	    var RC4Drop = C_algo.RC4Drop = RC4.extend({
        	        /**
        	         * Configuration options.
        	         *
        	         * @property {number} drop The number of keystream words to drop. Default 192
        	         */
        	        cfg: RC4.cfg.extend({
        	            drop: 192
        	        }),

        	        _doReset: function () {
        	            RC4._doReset.call(this);

        	            // Drop
        	            for (var i = this.cfg.drop; i > 0; i--) {
        	                generateKeystreamWord.call(this);
        	            }
        	        }
        	    });

        	    /**
        	     * Shortcut functions to the cipher's object interface.
        	     *
        	     * @example
        	     *
        	     *     var ciphertext = CryptoJS.RC4Drop.encrypt(message, key, cfg);
        	     *     var plaintext  = CryptoJS.RC4Drop.decrypt(ciphertext, key, cfg);
        	     */
        	    C.RC4Drop = StreamCipher._createHelper(RC4Drop);
        	}());


        	return CryptoJS.RC4;

        }));
        });

        var rabbit = createCommonjsModule(function (module, exports) {
        (function (root, factory, undef) {
        	{
        		// CommonJS
        		module.exports = exports = factory(core, encBase64, md5, evpkdf, cipherCore);
        	}
        }(commonjsGlobal, function (CryptoJS) {

        	(function () {
        	    // Shortcuts
        	    var C = CryptoJS;
        	    var C_lib = C.lib;
        	    var StreamCipher = C_lib.StreamCipher;
        	    var C_algo = C.algo;

        	    // Reusable objects
        	    var S  = [];
        	    var C_ = [];
        	    var G  = [];

        	    /**
        	     * Rabbit stream cipher algorithm
        	     */
        	    var Rabbit = C_algo.Rabbit = StreamCipher.extend({
        	        _doReset: function () {
        	            // Shortcuts
        	            var K = this._key.words;
        	            var iv = this.cfg.iv;

        	            // Swap endian
        	            for (var i = 0; i < 4; i++) {
        	                K[i] = (((K[i] << 8)  | (K[i] >>> 24)) & 0x00ff00ff) |
        	                       (((K[i] << 24) | (K[i] >>> 8))  & 0xff00ff00);
        	            }

        	            // Generate initial state values
        	            var X = this._X = [
        	                K[0], (K[3] << 16) | (K[2] >>> 16),
        	                K[1], (K[0] << 16) | (K[3] >>> 16),
        	                K[2], (K[1] << 16) | (K[0] >>> 16),
        	                K[3], (K[2] << 16) | (K[1] >>> 16)
        	            ];

        	            // Generate initial counter values
        	            var C = this._C = [
        	                (K[2] << 16) | (K[2] >>> 16), (K[0] & 0xffff0000) | (K[1] & 0x0000ffff),
        	                (K[3] << 16) | (K[3] >>> 16), (K[1] & 0xffff0000) | (K[2] & 0x0000ffff),
        	                (K[0] << 16) | (K[0] >>> 16), (K[2] & 0xffff0000) | (K[3] & 0x0000ffff),
        	                (K[1] << 16) | (K[1] >>> 16), (K[3] & 0xffff0000) | (K[0] & 0x0000ffff)
        	            ];

        	            // Carry bit
        	            this._b = 0;

        	            // Iterate the system four times
        	            for (var i = 0; i < 4; i++) {
        	                nextState.call(this);
        	            }

        	            // Modify the counters
        	            for (var i = 0; i < 8; i++) {
        	                C[i] ^= X[(i + 4) & 7];
        	            }

        	            // IV setup
        	            if (iv) {
        	                // Shortcuts
        	                var IV = iv.words;
        	                var IV_0 = IV[0];
        	                var IV_1 = IV[1];

        	                // Generate four subvectors
        	                var i0 = (((IV_0 << 8) | (IV_0 >>> 24)) & 0x00ff00ff) | (((IV_0 << 24) | (IV_0 >>> 8)) & 0xff00ff00);
        	                var i2 = (((IV_1 << 8) | (IV_1 >>> 24)) & 0x00ff00ff) | (((IV_1 << 24) | (IV_1 >>> 8)) & 0xff00ff00);
        	                var i1 = (i0 >>> 16) | (i2 & 0xffff0000);
        	                var i3 = (i2 << 16)  | (i0 & 0x0000ffff);

        	                // Modify counter values
        	                C[0] ^= i0;
        	                C[1] ^= i1;
        	                C[2] ^= i2;
        	                C[3] ^= i3;
        	                C[4] ^= i0;
        	                C[5] ^= i1;
        	                C[6] ^= i2;
        	                C[7] ^= i3;

        	                // Iterate the system four times
        	                for (var i = 0; i < 4; i++) {
        	                    nextState.call(this);
        	                }
        	            }
        	        },

        	        _doProcessBlock: function (M, offset) {
        	            // Shortcut
        	            var X = this._X;

        	            // Iterate the system
        	            nextState.call(this);

        	            // Generate four keystream words
        	            S[0] = X[0] ^ (X[5] >>> 16) ^ (X[3] << 16);
        	            S[1] = X[2] ^ (X[7] >>> 16) ^ (X[5] << 16);
        	            S[2] = X[4] ^ (X[1] >>> 16) ^ (X[7] << 16);
        	            S[3] = X[6] ^ (X[3] >>> 16) ^ (X[1] << 16);

        	            for (var i = 0; i < 4; i++) {
        	                // Swap endian
        	                S[i] = (((S[i] << 8)  | (S[i] >>> 24)) & 0x00ff00ff) |
        	                       (((S[i] << 24) | (S[i] >>> 8))  & 0xff00ff00);

        	                // Encrypt
        	                M[offset + i] ^= S[i];
        	            }
        	        },

        	        blockSize: 128/32,

        	        ivSize: 64/32
        	    });

        	    function nextState() {
        	        // Shortcuts
        	        var X = this._X;
        	        var C = this._C;

        	        // Save old counter values
        	        for (var i = 0; i < 8; i++) {
        	            C_[i] = C[i];
        	        }

        	        // Calculate new counter values
        	        C[0] = (C[0] + 0x4d34d34d + this._b) | 0;
        	        C[1] = (C[1] + 0xd34d34d3 + ((C[0] >>> 0) < (C_[0] >>> 0) ? 1 : 0)) | 0;
        	        C[2] = (C[2] + 0x34d34d34 + ((C[1] >>> 0) < (C_[1] >>> 0) ? 1 : 0)) | 0;
        	        C[3] = (C[3] + 0x4d34d34d + ((C[2] >>> 0) < (C_[2] >>> 0) ? 1 : 0)) | 0;
        	        C[4] = (C[4] + 0xd34d34d3 + ((C[3] >>> 0) < (C_[3] >>> 0) ? 1 : 0)) | 0;
        	        C[5] = (C[5] + 0x34d34d34 + ((C[4] >>> 0) < (C_[4] >>> 0) ? 1 : 0)) | 0;
        	        C[6] = (C[6] + 0x4d34d34d + ((C[5] >>> 0) < (C_[5] >>> 0) ? 1 : 0)) | 0;
        	        C[7] = (C[7] + 0xd34d34d3 + ((C[6] >>> 0) < (C_[6] >>> 0) ? 1 : 0)) | 0;
        	        this._b = (C[7] >>> 0) < (C_[7] >>> 0) ? 1 : 0;

        	        // Calculate the g-values
        	        for (var i = 0; i < 8; i++) {
        	            var gx = X[i] + C[i];

        	            // Construct high and low argument for squaring
        	            var ga = gx & 0xffff;
        	            var gb = gx >>> 16;

        	            // Calculate high and low result of squaring
        	            var gh = ((((ga * ga) >>> 17) + ga * gb) >>> 15) + gb * gb;
        	            var gl = (((gx & 0xffff0000) * gx) | 0) + (((gx & 0x0000ffff) * gx) | 0);

        	            // High XOR low
        	            G[i] = gh ^ gl;
        	        }

        	        // Calculate new state values
        	        X[0] = (G[0] + ((G[7] << 16) | (G[7] >>> 16)) + ((G[6] << 16) | (G[6] >>> 16))) | 0;
        	        X[1] = (G[1] + ((G[0] << 8)  | (G[0] >>> 24)) + G[7]) | 0;
        	        X[2] = (G[2] + ((G[1] << 16) | (G[1] >>> 16)) + ((G[0] << 16) | (G[0] >>> 16))) | 0;
        	        X[3] = (G[3] + ((G[2] << 8)  | (G[2] >>> 24)) + G[1]) | 0;
        	        X[4] = (G[4] + ((G[3] << 16) | (G[3] >>> 16)) + ((G[2] << 16) | (G[2] >>> 16))) | 0;
        	        X[5] = (G[5] + ((G[4] << 8)  | (G[4] >>> 24)) + G[3]) | 0;
        	        X[6] = (G[6] + ((G[5] << 16) | (G[5] >>> 16)) + ((G[4] << 16) | (G[4] >>> 16))) | 0;
        	        X[7] = (G[7] + ((G[6] << 8)  | (G[6] >>> 24)) + G[5]) | 0;
        	    }

        	    /**
        	     * Shortcut functions to the cipher's object interface.
        	     *
        	     * @example
        	     *
        	     *     var ciphertext = CryptoJS.Rabbit.encrypt(message, key, cfg);
        	     *     var plaintext  = CryptoJS.Rabbit.decrypt(ciphertext, key, cfg);
        	     */
        	    C.Rabbit = StreamCipher._createHelper(Rabbit);
        	}());


        	return CryptoJS.Rabbit;

        }));
        });

        var rabbitLegacy = createCommonjsModule(function (module, exports) {
        (function (root, factory, undef) {
        	{
        		// CommonJS
        		module.exports = exports = factory(core, encBase64, md5, evpkdf, cipherCore);
        	}
        }(commonjsGlobal, function (CryptoJS) {

        	(function () {
        	    // Shortcuts
        	    var C = CryptoJS;
        	    var C_lib = C.lib;
        	    var StreamCipher = C_lib.StreamCipher;
        	    var C_algo = C.algo;

        	    // Reusable objects
        	    var S  = [];
        	    var C_ = [];
        	    var G  = [];

        	    /**
        	     * Rabbit stream cipher algorithm.
        	     *
        	     * This is a legacy version that neglected to convert the key to little-endian.
        	     * This error doesn't affect the cipher's security,
        	     * but it does affect its compatibility with other implementations.
        	     */
        	    var RabbitLegacy = C_algo.RabbitLegacy = StreamCipher.extend({
        	        _doReset: function () {
        	            // Shortcuts
        	            var K = this._key.words;
        	            var iv = this.cfg.iv;

        	            // Generate initial state values
        	            var X = this._X = [
        	                K[0], (K[3] << 16) | (K[2] >>> 16),
        	                K[1], (K[0] << 16) | (K[3] >>> 16),
        	                K[2], (K[1] << 16) | (K[0] >>> 16),
        	                K[3], (K[2] << 16) | (K[1] >>> 16)
        	            ];

        	            // Generate initial counter values
        	            var C = this._C = [
        	                (K[2] << 16) | (K[2] >>> 16), (K[0] & 0xffff0000) | (K[1] & 0x0000ffff),
        	                (K[3] << 16) | (K[3] >>> 16), (K[1] & 0xffff0000) | (K[2] & 0x0000ffff),
        	                (K[0] << 16) | (K[0] >>> 16), (K[2] & 0xffff0000) | (K[3] & 0x0000ffff),
        	                (K[1] << 16) | (K[1] >>> 16), (K[3] & 0xffff0000) | (K[0] & 0x0000ffff)
        	            ];

        	            // Carry bit
        	            this._b = 0;

        	            // Iterate the system four times
        	            for (var i = 0; i < 4; i++) {
        	                nextState.call(this);
        	            }

        	            // Modify the counters
        	            for (var i = 0; i < 8; i++) {
        	                C[i] ^= X[(i + 4) & 7];
        	            }

        	            // IV setup
        	            if (iv) {
        	                // Shortcuts
        	                var IV = iv.words;
        	                var IV_0 = IV[0];
        	                var IV_1 = IV[1];

        	                // Generate four subvectors
        	                var i0 = (((IV_0 << 8) | (IV_0 >>> 24)) & 0x00ff00ff) | (((IV_0 << 24) | (IV_0 >>> 8)) & 0xff00ff00);
        	                var i2 = (((IV_1 << 8) | (IV_1 >>> 24)) & 0x00ff00ff) | (((IV_1 << 24) | (IV_1 >>> 8)) & 0xff00ff00);
        	                var i1 = (i0 >>> 16) | (i2 & 0xffff0000);
        	                var i3 = (i2 << 16)  | (i0 & 0x0000ffff);

        	                // Modify counter values
        	                C[0] ^= i0;
        	                C[1] ^= i1;
        	                C[2] ^= i2;
        	                C[3] ^= i3;
        	                C[4] ^= i0;
        	                C[5] ^= i1;
        	                C[6] ^= i2;
        	                C[7] ^= i3;

        	                // Iterate the system four times
        	                for (var i = 0; i < 4; i++) {
        	                    nextState.call(this);
        	                }
        	            }
        	        },

        	        _doProcessBlock: function (M, offset) {
        	            // Shortcut
        	            var X = this._X;

        	            // Iterate the system
        	            nextState.call(this);

        	            // Generate four keystream words
        	            S[0] = X[0] ^ (X[5] >>> 16) ^ (X[3] << 16);
        	            S[1] = X[2] ^ (X[7] >>> 16) ^ (X[5] << 16);
        	            S[2] = X[4] ^ (X[1] >>> 16) ^ (X[7] << 16);
        	            S[3] = X[6] ^ (X[3] >>> 16) ^ (X[1] << 16);

        	            for (var i = 0; i < 4; i++) {
        	                // Swap endian
        	                S[i] = (((S[i] << 8)  | (S[i] >>> 24)) & 0x00ff00ff) |
        	                       (((S[i] << 24) | (S[i] >>> 8))  & 0xff00ff00);

        	                // Encrypt
        	                M[offset + i] ^= S[i];
        	            }
        	        },

        	        blockSize: 128/32,

        	        ivSize: 64/32
        	    });

        	    function nextState() {
        	        // Shortcuts
        	        var X = this._X;
        	        var C = this._C;

        	        // Save old counter values
        	        for (var i = 0; i < 8; i++) {
        	            C_[i] = C[i];
        	        }

        	        // Calculate new counter values
        	        C[0] = (C[0] + 0x4d34d34d + this._b) | 0;
        	        C[1] = (C[1] + 0xd34d34d3 + ((C[0] >>> 0) < (C_[0] >>> 0) ? 1 : 0)) | 0;
        	        C[2] = (C[2] + 0x34d34d34 + ((C[1] >>> 0) < (C_[1] >>> 0) ? 1 : 0)) | 0;
        	        C[3] = (C[3] + 0x4d34d34d + ((C[2] >>> 0) < (C_[2] >>> 0) ? 1 : 0)) | 0;
        	        C[4] = (C[4] + 0xd34d34d3 + ((C[3] >>> 0) < (C_[3] >>> 0) ? 1 : 0)) | 0;
        	        C[5] = (C[5] + 0x34d34d34 + ((C[4] >>> 0) < (C_[4] >>> 0) ? 1 : 0)) | 0;
        	        C[6] = (C[6] + 0x4d34d34d + ((C[5] >>> 0) < (C_[5] >>> 0) ? 1 : 0)) | 0;
        	        C[7] = (C[7] + 0xd34d34d3 + ((C[6] >>> 0) < (C_[6] >>> 0) ? 1 : 0)) | 0;
        	        this._b = (C[7] >>> 0) < (C_[7] >>> 0) ? 1 : 0;

        	        // Calculate the g-values
        	        for (var i = 0; i < 8; i++) {
        	            var gx = X[i] + C[i];

        	            // Construct high and low argument for squaring
        	            var ga = gx & 0xffff;
        	            var gb = gx >>> 16;

        	            // Calculate high and low result of squaring
        	            var gh = ((((ga * ga) >>> 17) + ga * gb) >>> 15) + gb * gb;
        	            var gl = (((gx & 0xffff0000) * gx) | 0) + (((gx & 0x0000ffff) * gx) | 0);

        	            // High XOR low
        	            G[i] = gh ^ gl;
        	        }

        	        // Calculate new state values
        	        X[0] = (G[0] + ((G[7] << 16) | (G[7] >>> 16)) + ((G[6] << 16) | (G[6] >>> 16))) | 0;
        	        X[1] = (G[1] + ((G[0] << 8)  | (G[0] >>> 24)) + G[7]) | 0;
        	        X[2] = (G[2] + ((G[1] << 16) | (G[1] >>> 16)) + ((G[0] << 16) | (G[0] >>> 16))) | 0;
        	        X[3] = (G[3] + ((G[2] << 8)  | (G[2] >>> 24)) + G[1]) | 0;
        	        X[4] = (G[4] + ((G[3] << 16) | (G[3] >>> 16)) + ((G[2] << 16) | (G[2] >>> 16))) | 0;
        	        X[5] = (G[5] + ((G[4] << 8)  | (G[4] >>> 24)) + G[3]) | 0;
        	        X[6] = (G[6] + ((G[5] << 16) | (G[5] >>> 16)) + ((G[4] << 16) | (G[4] >>> 16))) | 0;
        	        X[7] = (G[7] + ((G[6] << 8)  | (G[6] >>> 24)) + G[5]) | 0;
        	    }

        	    /**
        	     * Shortcut functions to the cipher's object interface.
        	     *
        	     * @example
        	     *
        	     *     var ciphertext = CryptoJS.RabbitLegacy.encrypt(message, key, cfg);
        	     *     var plaintext  = CryptoJS.RabbitLegacy.decrypt(ciphertext, key, cfg);
        	     */
        	    C.RabbitLegacy = StreamCipher._createHelper(RabbitLegacy);
        	}());


        	return CryptoJS.RabbitLegacy;

        }));
        });

        var F__musescoreDownloader_node_modules_cryptoJs = createCommonjsModule(function (module, exports) {
        (function (root, factory, undef) {
        	{
        		// CommonJS
        		module.exports = exports = factory(core, x64Core, libTypedarrays, encUtf16, encBase64, md5, sha1, sha256, sha224, sha512, sha384, sha3, ripemd160, hmac, pbkdf2, evpkdf, cipherCore, modeCfb, modeCtr, modeCtrGladman, modeOfb, modeEcb, padAnsix923, padIso10126, padIso97971, padZeropadding, padNopadding, formatHex, aes, tripledes, rc4, rabbit, rabbitLegacy);
        	}
        }(commonjsGlobal, function (CryptoJS) {

        	return CryptoJS;

        }));
        });

        /**
         * Check if value is in a range group.
         * @param {number} value
         * @param {number[]} rangeGroup
         * @returns {boolean}
         */
        function inRange(value, rangeGroup) {
          if (value < rangeGroup[0]) return false;
          let startRange = 0;
          let endRange = rangeGroup.length / 2;
          while (startRange <= endRange) {
            const middleRange = Math.floor((startRange + endRange) / 2);

            // actual array index
            const arrayIndex = middleRange * 2;

            // Check if value is in range pointed by actual index
            if (
              value >= rangeGroup[arrayIndex] &&
              value <= rangeGroup[arrayIndex + 1]
            ) {
              return true;
            }

            if (value > rangeGroup[arrayIndex + 1]) {
              // Search Right Side Of Array
              startRange = middleRange + 1;
            } else {
              // Search Left Side Of Array
              endRange = middleRange - 1;
            }
          }
          return false;
        }

        /* eslint-disable prettier/prettier */
        /**
         * A.1 Unassigned code points in Unicode 3.2
         * @link https://tools.ietf.org/html/rfc3454#appendix-A.1
         */
        const unassigned_code_points = [
          0x0221,
          0x0221,
          0x0234,
          0x024f,
          0x02ae,
          0x02af,
          0x02ef,
          0x02ff,
          0x0350,
          0x035f,
          0x0370,
          0x0373,
          0x0376,
          0x0379,
          0x037b,
          0x037d,
          0x037f,
          0x0383,
          0x038b,
          0x038b,
          0x038d,
          0x038d,
          0x03a2,
          0x03a2,
          0x03cf,
          0x03cf,
          0x03f7,
          0x03ff,
          0x0487,
          0x0487,
          0x04cf,
          0x04cf,
          0x04f6,
          0x04f7,
          0x04fa,
          0x04ff,
          0x0510,
          0x0530,
          0x0557,
          0x0558,
          0x0560,
          0x0560,
          0x0588,
          0x0588,
          0x058b,
          0x0590,
          0x05a2,
          0x05a2,
          0x05ba,
          0x05ba,
          0x05c5,
          0x05cf,
          0x05eb,
          0x05ef,
          0x05f5,
          0x060b,
          0x060d,
          0x061a,
          0x061c,
          0x061e,
          0x0620,
          0x0620,
          0x063b,
          0x063f,
          0x0656,
          0x065f,
          0x06ee,
          0x06ef,
          0x06ff,
          0x06ff,
          0x070e,
          0x070e,
          0x072d,
          0x072f,
          0x074b,
          0x077f,
          0x07b2,
          0x0900,
          0x0904,
          0x0904,
          0x093a,
          0x093b,
          0x094e,
          0x094f,
          0x0955,
          0x0957,
          0x0971,
          0x0980,
          0x0984,
          0x0984,
          0x098d,
          0x098e,
          0x0991,
          0x0992,
          0x09a9,
          0x09a9,
          0x09b1,
          0x09b1,
          0x09b3,
          0x09b5,
          0x09ba,
          0x09bb,
          0x09bd,
          0x09bd,
          0x09c5,
          0x09c6,
          0x09c9,
          0x09ca,
          0x09ce,
          0x09d6,
          0x09d8,
          0x09db,
          0x09de,
          0x09de,
          0x09e4,
          0x09e5,
          0x09fb,
          0x0a01,
          0x0a03,
          0x0a04,
          0x0a0b,
          0x0a0e,
          0x0a11,
          0x0a12,
          0x0a29,
          0x0a29,
          0x0a31,
          0x0a31,
          0x0a34,
          0x0a34,
          0x0a37,
          0x0a37,
          0x0a3a,
          0x0a3b,
          0x0a3d,
          0x0a3d,
          0x0a43,
          0x0a46,
          0x0a49,
          0x0a4a,
          0x0a4e,
          0x0a58,
          0x0a5d,
          0x0a5d,
          0x0a5f,
          0x0a65,
          0x0a75,
          0x0a80,
          0x0a84,
          0x0a84,
          0x0a8c,
          0x0a8c,
          0x0a8e,
          0x0a8e,
          0x0a92,
          0x0a92,
          0x0aa9,
          0x0aa9,
          0x0ab1,
          0x0ab1,
          0x0ab4,
          0x0ab4,
          0x0aba,
          0x0abb,
          0x0ac6,
          0x0ac6,
          0x0aca,
          0x0aca,
          0x0ace,
          0x0acf,
          0x0ad1,
          0x0adf,
          0x0ae1,
          0x0ae5,
          0x0af0,
          0x0b00,
          0x0b04,
          0x0b04,
          0x0b0d,
          0x0b0e,
          0x0b11,
          0x0b12,
          0x0b29,
          0x0b29,
          0x0b31,
          0x0b31,
          0x0b34,
          0x0b35,
          0x0b3a,
          0x0b3b,
          0x0b44,
          0x0b46,
          0x0b49,
          0x0b4a,
          0x0b4e,
          0x0b55,
          0x0b58,
          0x0b5b,
          0x0b5e,
          0x0b5e,
          0x0b62,
          0x0b65,
          0x0b71,
          0x0b81,
          0x0b84,
          0x0b84,
          0x0b8b,
          0x0b8d,
          0x0b91,
          0x0b91,
          0x0b96,
          0x0b98,
          0x0b9b,
          0x0b9b,
          0x0b9d,
          0x0b9d,
          0x0ba0,
          0x0ba2,
          0x0ba5,
          0x0ba7,
          0x0bab,
          0x0bad,
          0x0bb6,
          0x0bb6,
          0x0bba,
          0x0bbd,
          0x0bc3,
          0x0bc5,
          0x0bc9,
          0x0bc9,
          0x0bce,
          0x0bd6,
          0x0bd8,
          0x0be6,
          0x0bf3,
          0x0c00,
          0x0c04,
          0x0c04,
          0x0c0d,
          0x0c0d,
          0x0c11,
          0x0c11,
          0x0c29,
          0x0c29,
          0x0c34,
          0x0c34,
          0x0c3a,
          0x0c3d,
          0x0c45,
          0x0c45,
          0x0c49,
          0x0c49,
          0x0c4e,
          0x0c54,
          0x0c57,
          0x0c5f,
          0x0c62,
          0x0c65,
          0x0c70,
          0x0c81,
          0x0c84,
          0x0c84,
          0x0c8d,
          0x0c8d,
          0x0c91,
          0x0c91,
          0x0ca9,
          0x0ca9,
          0x0cb4,
          0x0cb4,
          0x0cba,
          0x0cbd,
          0x0cc5,
          0x0cc5,
          0x0cc9,
          0x0cc9,
          0x0cce,
          0x0cd4,
          0x0cd7,
          0x0cdd,
          0x0cdf,
          0x0cdf,
          0x0ce2,
          0x0ce5,
          0x0cf0,
          0x0d01,
          0x0d04,
          0x0d04,
          0x0d0d,
          0x0d0d,
          0x0d11,
          0x0d11,
          0x0d29,
          0x0d29,
          0x0d3a,
          0x0d3d,
          0x0d44,
          0x0d45,
          0x0d49,
          0x0d49,
          0x0d4e,
          0x0d56,
          0x0d58,
          0x0d5f,
          0x0d62,
          0x0d65,
          0x0d70,
          0x0d81,
          0x0d84,
          0x0d84,
          0x0d97,
          0x0d99,
          0x0db2,
          0x0db2,
          0x0dbc,
          0x0dbc,
          0x0dbe,
          0x0dbf,
          0x0dc7,
          0x0dc9,
          0x0dcb,
          0x0dce,
          0x0dd5,
          0x0dd5,
          0x0dd7,
          0x0dd7,
          0x0de0,
          0x0df1,
          0x0df5,
          0x0e00,
          0x0e3b,
          0x0e3e,
          0x0e5c,
          0x0e80,
          0x0e83,
          0x0e83,
          0x0e85,
          0x0e86,
          0x0e89,
          0x0e89,
          0x0e8b,
          0x0e8c,
          0x0e8e,
          0x0e93,
          0x0e98,
          0x0e98,
          0x0ea0,
          0x0ea0,
          0x0ea4,
          0x0ea4,
          0x0ea6,
          0x0ea6,
          0x0ea8,
          0x0ea9,
          0x0eac,
          0x0eac,
          0x0eba,
          0x0eba,
          0x0ebe,
          0x0ebf,
          0x0ec5,
          0x0ec5,
          0x0ec7,
          0x0ec7,
          0x0ece,
          0x0ecf,
          0x0eda,
          0x0edb,
          0x0ede,
          0x0eff,
          0x0f48,
          0x0f48,
          0x0f6b,
          0x0f70,
          0x0f8c,
          0x0f8f,
          0x0f98,
          0x0f98,
          0x0fbd,
          0x0fbd,
          0x0fcd,
          0x0fce,
          0x0fd0,
          0x0fff,
          0x1022,
          0x1022,
          0x1028,
          0x1028,
          0x102b,
          0x102b,
          0x1033,
          0x1035,
          0x103a,
          0x103f,
          0x105a,
          0x109f,
          0x10c6,
          0x10cf,
          0x10f9,
          0x10fa,
          0x10fc,
          0x10ff,
          0x115a,
          0x115e,
          0x11a3,
          0x11a7,
          0x11fa,
          0x11ff,
          0x1207,
          0x1207,
          0x1247,
          0x1247,
          0x1249,
          0x1249,
          0x124e,
          0x124f,
          0x1257,
          0x1257,
          0x1259,
          0x1259,
          0x125e,
          0x125f,
          0x1287,
          0x1287,
          0x1289,
          0x1289,
          0x128e,
          0x128f,
          0x12af,
          0x12af,
          0x12b1,
          0x12b1,
          0x12b6,
          0x12b7,
          0x12bf,
          0x12bf,
          0x12c1,
          0x12c1,
          0x12c6,
          0x12c7,
          0x12cf,
          0x12cf,
          0x12d7,
          0x12d7,
          0x12ef,
          0x12ef,
          0x130f,
          0x130f,
          0x1311,
          0x1311,
          0x1316,
          0x1317,
          0x131f,
          0x131f,
          0x1347,
          0x1347,
          0x135b,
          0x1360,
          0x137d,
          0x139f,
          0x13f5,
          0x1400,
          0x1677,
          0x167f,
          0x169d,
          0x169f,
          0x16f1,
          0x16ff,
          0x170d,
          0x170d,
          0x1715,
          0x171f,
          0x1737,
          0x173f,
          0x1754,
          0x175f,
          0x176d,
          0x176d,
          0x1771,
          0x1771,
          0x1774,
          0x177f,
          0x17dd,
          0x17df,
          0x17ea,
          0x17ff,
          0x180f,
          0x180f,
          0x181a,
          0x181f,
          0x1878,
          0x187f,
          0x18aa,
          0x1dff,
          0x1e9c,
          0x1e9f,
          0x1efa,
          0x1eff,
          0x1f16,
          0x1f17,
          0x1f1e,
          0x1f1f,
          0x1f46,
          0x1f47,
          0x1f4e,
          0x1f4f,
          0x1f58,
          0x1f58,
          0x1f5a,
          0x1f5a,
          0x1f5c,
          0x1f5c,
          0x1f5e,
          0x1f5e,
          0x1f7e,
          0x1f7f,
          0x1fb5,
          0x1fb5,
          0x1fc5,
          0x1fc5,
          0x1fd4,
          0x1fd5,
          0x1fdc,
          0x1fdc,
          0x1ff0,
          0x1ff1,
          0x1ff5,
          0x1ff5,
          0x1fff,
          0x1fff,
          0x2053,
          0x2056,
          0x2058,
          0x205e,
          0x2064,
          0x2069,
          0x2072,
          0x2073,
          0x208f,
          0x209f,
          0x20b2,
          0x20cf,
          0x20eb,
          0x20ff,
          0x213b,
          0x213c,
          0x214c,
          0x2152,
          0x2184,
          0x218f,
          0x23cf,
          0x23ff,
          0x2427,
          0x243f,
          0x244b,
          0x245f,
          0x24ff,
          0x24ff,
          0x2614,
          0x2615,
          0x2618,
          0x2618,
          0x267e,
          0x267f,
          0x268a,
          0x2700,
          0x2705,
          0x2705,
          0x270a,
          0x270b,
          0x2728,
          0x2728,
          0x274c,
          0x274c,
          0x274e,
          0x274e,
          0x2753,
          0x2755,
          0x2757,
          0x2757,
          0x275f,
          0x2760,
          0x2795,
          0x2797,
          0x27b0,
          0x27b0,
          0x27bf,
          0x27cf,
          0x27ec,
          0x27ef,
          0x2b00,
          0x2e7f,
          0x2e9a,
          0x2e9a,
          0x2ef4,
          0x2eff,
          0x2fd6,
          0x2fef,
          0x2ffc,
          0x2fff,
          0x3040,
          0x3040,
          0x3097,
          0x3098,
          0x3100,
          0x3104,
          0x312d,
          0x3130,
          0x318f,
          0x318f,
          0x31b8,
          0x31ef,
          0x321d,
          0x321f,
          0x3244,
          0x3250,
          0x327c,
          0x327e,
          0x32cc,
          0x32cf,
          0x32ff,
          0x32ff,
          0x3377,
          0x337a,
          0x33de,
          0x33df,
          0x33ff,
          0x33ff,
          0x4db6,
          0x4dff,
          0x9fa6,
          0x9fff,
          0xa48d,
          0xa48f,
          0xa4c7,
          0xabff,
          0xd7a4,
          0xd7ff,
          0xfa2e,
          0xfa2f,
          0xfa6b,
          0xfaff,
          0xfb07,
          0xfb12,
          0xfb18,
          0xfb1c,
          0xfb37,
          0xfb37,
          0xfb3d,
          0xfb3d,
          0xfb3f,
          0xfb3f,
          0xfb42,
          0xfb42,
          0xfb45,
          0xfb45,
          0xfbb2,
          0xfbd2,
          0xfd40,
          0xfd4f,
          0xfd90,
          0xfd91,
          0xfdc8,
          0xfdcf,
          0xfdfd,
          0xfdff,
          0xfe10,
          0xfe1f,
          0xfe24,
          0xfe2f,
          0xfe47,
          0xfe48,
          0xfe53,
          0xfe53,
          0xfe67,
          0xfe67,
          0xfe6c,
          0xfe6f,
          0xfe75,
          0xfe75,
          0xfefd,
          0xfefe,
          0xff00,
          0xff00,
          0xffbf,
          0xffc1,
          0xffc8,
          0xffc9,
          0xffd0,
          0xffd1,
          0xffd8,
          0xffd9,
          0xffdd,
          0xffdf,
          0xffe7,
          0xffe7,
          0xffef,
          0xfff8,
          0x10000,
          0x102ff,
          0x1031f,
          0x1031f,
          0x10324,
          0x1032f,
          0x1034b,
          0x103ff,
          0x10426,
          0x10427,
          0x1044e,
          0x1cfff,
          0x1d0f6,
          0x1d0ff,
          0x1d127,
          0x1d129,
          0x1d1de,
          0x1d3ff,
          0x1d455,
          0x1d455,
          0x1d49d,
          0x1d49d,
          0x1d4a0,
          0x1d4a1,
          0x1d4a3,
          0x1d4a4,
          0x1d4a7,
          0x1d4a8,
          0x1d4ad,
          0x1d4ad,
          0x1d4ba,
          0x1d4ba,
          0x1d4bc,
          0x1d4bc,
          0x1d4c1,
          0x1d4c1,
          0x1d4c4,
          0x1d4c4,
          0x1d506,
          0x1d506,
          0x1d50b,
          0x1d50c,
          0x1d515,
          0x1d515,
          0x1d51d,
          0x1d51d,
          0x1d53a,
          0x1d53a,
          0x1d53f,
          0x1d53f,
          0x1d545,
          0x1d545,
          0x1d547,
          0x1d549,
          0x1d551,
          0x1d551,
          0x1d6a4,
          0x1d6a7,
          0x1d7ca,
          0x1d7cd,
          0x1d800,
          0x1fffd,
          0x2a6d7,
          0x2f7ff,
          0x2fa1e,
          0x2fffd,
          0x30000,
          0x3fffd,
          0x40000,
          0x4fffd,
          0x50000,
          0x5fffd,
          0x60000,
          0x6fffd,
          0x70000,
          0x7fffd,
          0x80000,
          0x8fffd,
          0x90000,
          0x9fffd,
          0xa0000,
          0xafffd,
          0xb0000,
          0xbfffd,
          0xc0000,
          0xcfffd,
          0xd0000,
          0xdfffd,
          0xe0000,
          0xe0000,
          0xe0002,
          0xe001f,
          0xe0080,
          0xefffd
        ];
        /* eslint-enable */

        const isUnassignedCodePoint = character =>
          inRange(character, unassigned_code_points);

        /* eslint-disable prettier/prettier */
        /**
         * B.1 Commonly mapped to nothing
         * @link https://tools.ietf.org/html/rfc3454#appendix-B.1
         */
        const commonly_mapped_to_nothing = [
          0x00ad,
          0x00ad,
          0x034f,
          0x034f,
          0x1806,
          0x1806,
          0x180b,
          0x180b,
          0x180c,
          0x180c,
          0x180d,
          0x180d,
          0x200b,
          0x200b,
          0x200c,
          0x200c,
          0x200d,
          0x200d,
          0x2060,
          0x2060,
          0xfe00,
          0xfe00,
          0xfe01,
          0xfe01,
          0xfe02,
          0xfe02,
          0xfe03,
          0xfe03,
          0xfe04,
          0xfe04,
          0xfe05,
          0xfe05,
          0xfe06,
          0xfe06,
          0xfe07,
          0xfe07,
          0xfe08,
          0xfe08,
          0xfe09,
          0xfe09,
          0xfe0a,
          0xfe0a,
          0xfe0b,
          0xfe0b,
          0xfe0c,
          0xfe0c,
          0xfe0d,
          0xfe0d,
          0xfe0e,
          0xfe0e,
          0xfe0f,
          0xfe0f,
          0xfeff,
          0xfeff
        ];
        /* eslint-enable */

        const isCommonlyMappedToNothing = character =>
          inRange(character, commonly_mapped_to_nothing);

        /* eslint-disable prettier/prettier */
        /**
         * C.1.2 Non-ASCII space characters
         * @link https://tools.ietf.org/html/rfc3454#appendix-C.1.2
         */
        const non_ASCII_space_characters = [
          0x00a0,
          0x00a0 /* NO-BREAK SPACE */,
          0x1680,
          0x1680 /* OGHAM SPACE MARK */,
          0x2000,
          0x2000 /* EN QUAD */,
          0x2001,
          0x2001 /* EM QUAD */,
          0x2002,
          0x2002 /* EN SPACE */,
          0x2003,
          0x2003 /* EM SPACE */,
          0x2004,
          0x2004 /* THREE-PER-EM SPACE */,
          0x2005,
          0x2005 /* FOUR-PER-EM SPACE */,
          0x2006,
          0x2006 /* SIX-PER-EM SPACE */,
          0x2007,
          0x2007 /* FIGURE SPACE */,
          0x2008,
          0x2008 /* PUNCTUATION SPACE */,
          0x2009,
          0x2009 /* THIN SPACE */,
          0x200a,
          0x200a /* HAIR SPACE */,
          0x200b,
          0x200b /* ZERO WIDTH SPACE */,
          0x202f,
          0x202f /* NARROW NO-BREAK SPACE */,
          0x205f,
          0x205f /* MEDIUM MATHEMATICAL SPACE */,
          0x3000,
          0x3000 /* IDEOGRAPHIC SPACE */
        ];
        /* eslint-enable */

        const isNonASCIISpaceCharacter = character =>
          inRange(character, non_ASCII_space_characters);

        /* eslint-disable prettier/prettier */
        const non_ASCII_controls_characters = [
          /**
           * C.2.2 Non-ASCII control characters
           * @link https://tools.ietf.org/html/rfc3454#appendix-C.2.2
           */
          0x0080,
          0x009f /* [CONTROL CHARACTERS] */,
          0x06dd,
          0x06dd /* ARABIC END OF AYAH */,
          0x070f,
          0x070f /* SYRIAC ABBREVIATION MARK */,
          0x180e,
          0x180e /* MONGOLIAN VOWEL SEPARATOR */,
          0x200c,
          0x200c /* ZERO WIDTH NON-JOINER */,
          0x200d,
          0x200d /* ZERO WIDTH JOINER */,
          0x2028,
          0x2028 /* LINE SEPARATOR */,
          0x2029,
          0x2029 /* PARAGRAPH SEPARATOR */,
          0x2060,
          0x2060 /* WORD JOINER */,
          0x2061,
          0x2061 /* FUNCTION APPLICATION */,
          0x2062,
          0x2062 /* INVISIBLE TIMES */,
          0x2063,
          0x2063 /* INVISIBLE SEPARATOR */,
          0x206a,
          0x206f /* [CONTROL CHARACTERS] */,
          0xfeff,
          0xfeff /* ZERO WIDTH NO-BREAK SPACE */,
          0xfff9,
          0xfffc /* [CONTROL CHARACTERS] */,
          0x1d173,
          0x1d17a /* [MUSICAL CONTROL CHARACTERS] */
        ];

        const non_character_codepoints = [
          /**
           * C.4 Non-character code points
           * @link https://tools.ietf.org/html/rfc3454#appendix-C.4
           */
          0xfdd0,
          0xfdef /* [NONCHARACTER CODE POINTS] */,
          0xfffe,
          0xffff /* [NONCHARACTER CODE POINTS] */,
          0x1fffe,
          0x1ffff /* [NONCHARACTER CODE POINTS] */,
          0x2fffe,
          0x2ffff /* [NONCHARACTER CODE POINTS] */,
          0x3fffe,
          0x3ffff /* [NONCHARACTER CODE POINTS] */,
          0x4fffe,
          0x4ffff /* [NONCHARACTER CODE POINTS] */,
          0x5fffe,
          0x5ffff /* [NONCHARACTER CODE POINTS] */,
          0x6fffe,
          0x6ffff /* [NONCHARACTER CODE POINTS] */,
          0x7fffe,
          0x7ffff /* [NONCHARACTER CODE POINTS] */,
          0x8fffe,
          0x8ffff /* [NONCHARACTER CODE POINTS] */,
          0x9fffe,
          0x9ffff /* [NONCHARACTER CODE POINTS] */,
          0xafffe,
          0xaffff /* [NONCHARACTER CODE POINTS] */,
          0xbfffe,
          0xbffff /* [NONCHARACTER CODE POINTS] */,
          0xcfffe,
          0xcffff /* [NONCHARACTER CODE POINTS] */,
          0xdfffe,
          0xdffff /* [NONCHARACTER CODE POINTS] */,
          0xefffe,
          0xeffff /* [NONCHARACTER CODE POINTS] */,
          0x10fffe,
          0x10ffff /* [NONCHARACTER CODE POINTS] */
        ];

        /**
         * 2.3.  Prohibited Output
         */
        const prohibited_characters = [
          /**
           * C.2.1 ASCII control characters
           * @link https://tools.ietf.org/html/rfc3454#appendix-C.2.1
           */
          0,
          0x001f /* [CONTROL CHARACTERS] */,
          0x007f,
          0x007f /* DELETE */,

          /**
           * C.8 Change display properties or are deprecated
           * @link https://tools.ietf.org/html/rfc3454#appendix-C.8
           */
          0x0340,
          0x0340 /* COMBINING GRAVE TONE MARK */,
          0x0341,
          0x0341 /* COMBINING ACUTE TONE MARK */,
          0x200e,
          0x200e /* LEFT-TO-RIGHT MARK */,
          0x200f,
          0x200f /* RIGHT-TO-LEFT MARK */,
          0x202a,
          0x202a /* LEFT-TO-RIGHT EMBEDDING */,
          0x202b,
          0x202b /* RIGHT-TO-LEFT EMBEDDING */,
          0x202c,
          0x202c /* POP DIRECTIONAL FORMATTING */,
          0x202d,
          0x202d /* LEFT-TO-RIGHT OVERRIDE */,
          0x202e,
          0x202e /* RIGHT-TO-LEFT OVERRIDE */,
          0x206a,
          0x206a /* INHIBIT SYMMETRIC SWAPPING */,
          0x206b,
          0x206b /* ACTIVATE SYMMETRIC SWAPPING */,
          0x206c,
          0x206c /* INHIBIT ARABIC FORM SHAPING */,
          0x206d,
          0x206d /* ACTIVATE ARABIC FORM SHAPING */,
          0x206e,
          0x206e /* NATIONAL DIGIT SHAPES */,
          0x206f,
          0x206f /* NOMINAL DIGIT SHAPES */,

          /**
           * C.7 Inappropriate for canonical representation
           * @link https://tools.ietf.org/html/rfc3454#appendix-C.7
           */
          0x2ff0,
          0x2ffb /* [IDEOGRAPHIC DESCRIPTION CHARACTERS] */,

          /**
           * C.5 Surrogate codes
           * @link https://tools.ietf.org/html/rfc3454#appendix-C.5
           */
          0xd800,
          0xdfff,

          /**
           * C.3 Private use
           * @link https://tools.ietf.org/html/rfc3454#appendix-C.3
           */
          0xe000,
          0xf8ff /* [PRIVATE USE, PLANE 0] */,

          /**
           * C.6 Inappropriate for plain text
           * @link https://tools.ietf.org/html/rfc3454#appendix-C.6
           */
          0xfff9,
          0xfff9 /* INTERLINEAR ANNOTATION ANCHOR */,
          0xfffa,
          0xfffa /* INTERLINEAR ANNOTATION SEPARATOR */,
          0xfffb,
          0xfffb /* INTERLINEAR ANNOTATION TERMINATOR */,
          0xfffc,
          0xfffc /* OBJECT REPLACEMENT CHARACTER */,
          0xfffd,
          0xfffd /* REPLACEMENT CHARACTER */,

          /**
           * C.9 Tagging characters
           * @link https://tools.ietf.org/html/rfc3454#appendix-C.9
           */
          0xe0001,
          0xe0001 /* LANGUAGE TAG */,
          0xe0020,
          0xe007f /* [TAGGING CHARACTERS] */,

          /**
           * C.3 Private use
           * @link https://tools.ietf.org/html/rfc3454#appendix-C.3
           */

          0xf0000,
          0xffffd /* [PRIVATE USE, PLANE 15] */,
          0x100000,
          0x10fffd /* [PRIVATE USE, PLANE 16] */
        ];
        /* eslint-enable */

        const isProhibitedCharacter = character =>
          inRange(character, non_ASCII_space_characters) ||
          inRange(character, prohibited_characters) ||
          inRange(character, non_ASCII_controls_characters) ||
          inRange(character, non_character_codepoints);

        /* eslint-disable prettier/prettier */
        /**
         * D.1 Characters with bidirectional property "R" or "AL"
         * @link https://tools.ietf.org/html/rfc3454#appendix-D.1
         */
        const bidirectional_r_al = [
          0x05be,
          0x05be,
          0x05c0,
          0x05c0,
          0x05c3,
          0x05c3,
          0x05d0,
          0x05ea,
          0x05f0,
          0x05f4,
          0x061b,
          0x061b,
          0x061f,
          0x061f,
          0x0621,
          0x063a,
          0x0640,
          0x064a,
          0x066d,
          0x066f,
          0x0671,
          0x06d5,
          0x06dd,
          0x06dd,
          0x06e5,
          0x06e6,
          0x06fa,
          0x06fe,
          0x0700,
          0x070d,
          0x0710,
          0x0710,
          0x0712,
          0x072c,
          0x0780,
          0x07a5,
          0x07b1,
          0x07b1,
          0x200f,
          0x200f,
          0xfb1d,
          0xfb1d,
          0xfb1f,
          0xfb28,
          0xfb2a,
          0xfb36,
          0xfb38,
          0xfb3c,
          0xfb3e,
          0xfb3e,
          0xfb40,
          0xfb41,
          0xfb43,
          0xfb44,
          0xfb46,
          0xfbb1,
          0xfbd3,
          0xfd3d,
          0xfd50,
          0xfd8f,
          0xfd92,
          0xfdc7,
          0xfdf0,
          0xfdfc,
          0xfe70,
          0xfe74,
          0xfe76,
          0xfefc
        ];
        /* eslint-enable */

        const isBidirectionalRAL = character => inRange(character, bidirectional_r_al);

        /* eslint-disable prettier/prettier */
        /**
         * D.2 Characters with bidirectional property "L"
         * @link https://tools.ietf.org/html/rfc3454#appendix-D.2
         */
        const bidirectional_l = [
          0x0041,
          0x005a,
          0x0061,
          0x007a,
          0x00aa,
          0x00aa,
          0x00b5,
          0x00b5,
          0x00ba,
          0x00ba,
          0x00c0,
          0x00d6,
          0x00d8,
          0x00f6,
          0x00f8,
          0x0220,
          0x0222,
          0x0233,
          0x0250,
          0x02ad,
          0x02b0,
          0x02b8,
          0x02bb,
          0x02c1,
          0x02d0,
          0x02d1,
          0x02e0,
          0x02e4,
          0x02ee,
          0x02ee,
          0x037a,
          0x037a,
          0x0386,
          0x0386,
          0x0388,
          0x038a,
          0x038c,
          0x038c,
          0x038e,
          0x03a1,
          0x03a3,
          0x03ce,
          0x03d0,
          0x03f5,
          0x0400,
          0x0482,
          0x048a,
          0x04ce,
          0x04d0,
          0x04f5,
          0x04f8,
          0x04f9,
          0x0500,
          0x050f,
          0x0531,
          0x0556,
          0x0559,
          0x055f,
          0x0561,
          0x0587,
          0x0589,
          0x0589,
          0x0903,
          0x0903,
          0x0905,
          0x0939,
          0x093d,
          0x0940,
          0x0949,
          0x094c,
          0x0950,
          0x0950,
          0x0958,
          0x0961,
          0x0964,
          0x0970,
          0x0982,
          0x0983,
          0x0985,
          0x098c,
          0x098f,
          0x0990,
          0x0993,
          0x09a8,
          0x09aa,
          0x09b0,
          0x09b2,
          0x09b2,
          0x09b6,
          0x09b9,
          0x09be,
          0x09c0,
          0x09c7,
          0x09c8,
          0x09cb,
          0x09cc,
          0x09d7,
          0x09d7,
          0x09dc,
          0x09dd,
          0x09df,
          0x09e1,
          0x09e6,
          0x09f1,
          0x09f4,
          0x09fa,
          0x0a05,
          0x0a0a,
          0x0a0f,
          0x0a10,
          0x0a13,
          0x0a28,
          0x0a2a,
          0x0a30,
          0x0a32,
          0x0a33,
          0x0a35,
          0x0a36,
          0x0a38,
          0x0a39,
          0x0a3e,
          0x0a40,
          0x0a59,
          0x0a5c,
          0x0a5e,
          0x0a5e,
          0x0a66,
          0x0a6f,
          0x0a72,
          0x0a74,
          0x0a83,
          0x0a83,
          0x0a85,
          0x0a8b,
          0x0a8d,
          0x0a8d,
          0x0a8f,
          0x0a91,
          0x0a93,
          0x0aa8,
          0x0aaa,
          0x0ab0,
          0x0ab2,
          0x0ab3,
          0x0ab5,
          0x0ab9,
          0x0abd,
          0x0ac0,
          0x0ac9,
          0x0ac9,
          0x0acb,
          0x0acc,
          0x0ad0,
          0x0ad0,
          0x0ae0,
          0x0ae0,
          0x0ae6,
          0x0aef,
          0x0b02,
          0x0b03,
          0x0b05,
          0x0b0c,
          0x0b0f,
          0x0b10,
          0x0b13,
          0x0b28,
          0x0b2a,
          0x0b30,
          0x0b32,
          0x0b33,
          0x0b36,
          0x0b39,
          0x0b3d,
          0x0b3e,
          0x0b40,
          0x0b40,
          0x0b47,
          0x0b48,
          0x0b4b,
          0x0b4c,
          0x0b57,
          0x0b57,
          0x0b5c,
          0x0b5d,
          0x0b5f,
          0x0b61,
          0x0b66,
          0x0b70,
          0x0b83,
          0x0b83,
          0x0b85,
          0x0b8a,
          0x0b8e,
          0x0b90,
          0x0b92,
          0x0b95,
          0x0b99,
          0x0b9a,
          0x0b9c,
          0x0b9c,
          0x0b9e,
          0x0b9f,
          0x0ba3,
          0x0ba4,
          0x0ba8,
          0x0baa,
          0x0bae,
          0x0bb5,
          0x0bb7,
          0x0bb9,
          0x0bbe,
          0x0bbf,
          0x0bc1,
          0x0bc2,
          0x0bc6,
          0x0bc8,
          0x0bca,
          0x0bcc,
          0x0bd7,
          0x0bd7,
          0x0be7,
          0x0bf2,
          0x0c01,
          0x0c03,
          0x0c05,
          0x0c0c,
          0x0c0e,
          0x0c10,
          0x0c12,
          0x0c28,
          0x0c2a,
          0x0c33,
          0x0c35,
          0x0c39,
          0x0c41,
          0x0c44,
          0x0c60,
          0x0c61,
          0x0c66,
          0x0c6f,
          0x0c82,
          0x0c83,
          0x0c85,
          0x0c8c,
          0x0c8e,
          0x0c90,
          0x0c92,
          0x0ca8,
          0x0caa,
          0x0cb3,
          0x0cb5,
          0x0cb9,
          0x0cbe,
          0x0cbe,
          0x0cc0,
          0x0cc4,
          0x0cc7,
          0x0cc8,
          0x0cca,
          0x0ccb,
          0x0cd5,
          0x0cd6,
          0x0cde,
          0x0cde,
          0x0ce0,
          0x0ce1,
          0x0ce6,
          0x0cef,
          0x0d02,
          0x0d03,
          0x0d05,
          0x0d0c,
          0x0d0e,
          0x0d10,
          0x0d12,
          0x0d28,
          0x0d2a,
          0x0d39,
          0x0d3e,
          0x0d40,
          0x0d46,
          0x0d48,
          0x0d4a,
          0x0d4c,
          0x0d57,
          0x0d57,
          0x0d60,
          0x0d61,
          0x0d66,
          0x0d6f,
          0x0d82,
          0x0d83,
          0x0d85,
          0x0d96,
          0x0d9a,
          0x0db1,
          0x0db3,
          0x0dbb,
          0x0dbd,
          0x0dbd,
          0x0dc0,
          0x0dc6,
          0x0dcf,
          0x0dd1,
          0x0dd8,
          0x0ddf,
          0x0df2,
          0x0df4,
          0x0e01,
          0x0e30,
          0x0e32,
          0x0e33,
          0x0e40,
          0x0e46,
          0x0e4f,
          0x0e5b,
          0x0e81,
          0x0e82,
          0x0e84,
          0x0e84,
          0x0e87,
          0x0e88,
          0x0e8a,
          0x0e8a,
          0x0e8d,
          0x0e8d,
          0x0e94,
          0x0e97,
          0x0e99,
          0x0e9f,
          0x0ea1,
          0x0ea3,
          0x0ea5,
          0x0ea5,
          0x0ea7,
          0x0ea7,
          0x0eaa,
          0x0eab,
          0x0ead,
          0x0eb0,
          0x0eb2,
          0x0eb3,
          0x0ebd,
          0x0ebd,
          0x0ec0,
          0x0ec4,
          0x0ec6,
          0x0ec6,
          0x0ed0,
          0x0ed9,
          0x0edc,
          0x0edd,
          0x0f00,
          0x0f17,
          0x0f1a,
          0x0f34,
          0x0f36,
          0x0f36,
          0x0f38,
          0x0f38,
          0x0f3e,
          0x0f47,
          0x0f49,
          0x0f6a,
          0x0f7f,
          0x0f7f,
          0x0f85,
          0x0f85,
          0x0f88,
          0x0f8b,
          0x0fbe,
          0x0fc5,
          0x0fc7,
          0x0fcc,
          0x0fcf,
          0x0fcf,
          0x1000,
          0x1021,
          0x1023,
          0x1027,
          0x1029,
          0x102a,
          0x102c,
          0x102c,
          0x1031,
          0x1031,
          0x1038,
          0x1038,
          0x1040,
          0x1057,
          0x10a0,
          0x10c5,
          0x10d0,
          0x10f8,
          0x10fb,
          0x10fb,
          0x1100,
          0x1159,
          0x115f,
          0x11a2,
          0x11a8,
          0x11f9,
          0x1200,
          0x1206,
          0x1208,
          0x1246,
          0x1248,
          0x1248,
          0x124a,
          0x124d,
          0x1250,
          0x1256,
          0x1258,
          0x1258,
          0x125a,
          0x125d,
          0x1260,
          0x1286,
          0x1288,
          0x1288,
          0x128a,
          0x128d,
          0x1290,
          0x12ae,
          0x12b0,
          0x12b0,
          0x12b2,
          0x12b5,
          0x12b8,
          0x12be,
          0x12c0,
          0x12c0,
          0x12c2,
          0x12c5,
          0x12c8,
          0x12ce,
          0x12d0,
          0x12d6,
          0x12d8,
          0x12ee,
          0x12f0,
          0x130e,
          0x1310,
          0x1310,
          0x1312,
          0x1315,
          0x1318,
          0x131e,
          0x1320,
          0x1346,
          0x1348,
          0x135a,
          0x1361,
          0x137c,
          0x13a0,
          0x13f4,
          0x1401,
          0x1676,
          0x1681,
          0x169a,
          0x16a0,
          0x16f0,
          0x1700,
          0x170c,
          0x170e,
          0x1711,
          0x1720,
          0x1731,
          0x1735,
          0x1736,
          0x1740,
          0x1751,
          0x1760,
          0x176c,
          0x176e,
          0x1770,
          0x1780,
          0x17b6,
          0x17be,
          0x17c5,
          0x17c7,
          0x17c8,
          0x17d4,
          0x17da,
          0x17dc,
          0x17dc,
          0x17e0,
          0x17e9,
          0x1810,
          0x1819,
          0x1820,
          0x1877,
          0x1880,
          0x18a8,
          0x1e00,
          0x1e9b,
          0x1ea0,
          0x1ef9,
          0x1f00,
          0x1f15,
          0x1f18,
          0x1f1d,
          0x1f20,
          0x1f45,
          0x1f48,
          0x1f4d,
          0x1f50,
          0x1f57,
          0x1f59,
          0x1f59,
          0x1f5b,
          0x1f5b,
          0x1f5d,
          0x1f5d,
          0x1f5f,
          0x1f7d,
          0x1f80,
          0x1fb4,
          0x1fb6,
          0x1fbc,
          0x1fbe,
          0x1fbe,
          0x1fc2,
          0x1fc4,
          0x1fc6,
          0x1fcc,
          0x1fd0,
          0x1fd3,
          0x1fd6,
          0x1fdb,
          0x1fe0,
          0x1fec,
          0x1ff2,
          0x1ff4,
          0x1ff6,
          0x1ffc,
          0x200e,
          0x200e,
          0x2071,
          0x2071,
          0x207f,
          0x207f,
          0x2102,
          0x2102,
          0x2107,
          0x2107,
          0x210a,
          0x2113,
          0x2115,
          0x2115,
          0x2119,
          0x211d,
          0x2124,
          0x2124,
          0x2126,
          0x2126,
          0x2128,
          0x2128,
          0x212a,
          0x212d,
          0x212f,
          0x2131,
          0x2133,
          0x2139,
          0x213d,
          0x213f,
          0x2145,
          0x2149,
          0x2160,
          0x2183,
          0x2336,
          0x237a,
          0x2395,
          0x2395,
          0x249c,
          0x24e9,
          0x3005,
          0x3007,
          0x3021,
          0x3029,
          0x3031,
          0x3035,
          0x3038,
          0x303c,
          0x3041,
          0x3096,
          0x309d,
          0x309f,
          0x30a1,
          0x30fa,
          0x30fc,
          0x30ff,
          0x3105,
          0x312c,
          0x3131,
          0x318e,
          0x3190,
          0x31b7,
          0x31f0,
          0x321c,
          0x3220,
          0x3243,
          0x3260,
          0x327b,
          0x327f,
          0x32b0,
          0x32c0,
          0x32cb,
          0x32d0,
          0x32fe,
          0x3300,
          0x3376,
          0x337b,
          0x33dd,
          0x33e0,
          0x33fe,
          0x3400,
          0x4db5,
          0x4e00,
          0x9fa5,
          0xa000,
          0xa48c,
          0xac00,
          0xd7a3,
          0xd800,
          0xfa2d,
          0xfa30,
          0xfa6a,
          0xfb00,
          0xfb06,
          0xfb13,
          0xfb17,
          0xff21,
          0xff3a,
          0xff41,
          0xff5a,
          0xff66,
          0xffbe,
          0xffc2,
          0xffc7,
          0xffca,
          0xffcf,
          0xffd2,
          0xffd7,
          0xffda,
          0xffdc,
          0x10300,
          0x1031e,
          0x10320,
          0x10323,
          0x10330,
          0x1034a,
          0x10400,
          0x10425,
          0x10428,
          0x1044d,
          0x1d000,
          0x1d0f5,
          0x1d100,
          0x1d126,
          0x1d12a,
          0x1d166,
          0x1d16a,
          0x1d172,
          0x1d183,
          0x1d184,
          0x1d18c,
          0x1d1a9,
          0x1d1ae,
          0x1d1dd,
          0x1d400,
          0x1d454,
          0x1d456,
          0x1d49c,
          0x1d49e,
          0x1d49f,
          0x1d4a2,
          0x1d4a2,
          0x1d4a5,
          0x1d4a6,
          0x1d4a9,
          0x1d4ac,
          0x1d4ae,
          0x1d4b9,
          0x1d4bb,
          0x1d4bb,
          0x1d4bd,
          0x1d4c0,
          0x1d4c2,
          0x1d4c3,
          0x1d4c5,
          0x1d505,
          0x1d507,
          0x1d50a,
          0x1d50d,
          0x1d514,
          0x1d516,
          0x1d51c,
          0x1d51e,
          0x1d539,
          0x1d53b,
          0x1d53e,
          0x1d540,
          0x1d544,
          0x1d546,
          0x1d546,
          0x1d54a,
          0x1d550,
          0x1d552,
          0x1d6a3,
          0x1d6a8,
          0x1d7c9,
          0x20000,
          0x2a6d6,
          0x2f800,
          0x2fa1d,
          0xf0000,
          0xffffd,
          0x100000,
          0x10fffd
        ];
        /* eslint-enable */

        const isBidirectionalL = character => inRange(character, bidirectional_l);

        // 2.1.  Mapping

        /**
         * non-ASCII space characters [StringPrep, C.1.2] that can be
         * mapped to SPACE (U+0020)
         */
        const mapping2space = isNonASCIISpaceCharacter;

        /**
         * the "commonly mapped to nothing" characters [StringPrep, B.1]
         * that can be mapped to nothing.
         */
        const mapping2nothing = isCommonlyMappedToNothing;

        // utils
        const getCodePoint = character => character.codePointAt(0);
        const first = x => x[0];
        const last = x => x[x.length - 1];

        /**
         * Convert provided string into an array of Unicode Code Points.
         * Based on https://stackoverflow.com/a/21409165/1556249
         * and https://www.npmjs.com/package/code-point-at.
         * @param {string} input
         * @returns {number[]}
         */
        function toCodePoints(input) {
          const codepoints = [];
          const size = input.length;

          for (let i = 0; i < size; i += 1) {
            const before = input.charCodeAt(i);

            if (before >= 0xd800 && before <= 0xdbff && size > i + 1) {
              const next = input.charCodeAt(i + 1);

              if (next >= 0xdc00 && next <= 0xdfff) {
                codepoints.push((before - 0xd800) * 0x400 + next - 0xdc00 + 0x10000);
                i += 1;
                continue;
              }
            }

            codepoints.push(before);
          }

          return codepoints;
        }

        /**
         * SASLprep.
         * @param {string} input
         * @param {Object} opts
         * @param {boolean} opts.allowUnassigned
         * @returns {string}
         */
        function saslprep(input, opts = {}) {
          if (typeof input !== 'string') {
            throw new TypeError('Expected string.');
          }

          if (input.length === 0) {
            return '';
          }

          // 1. Map
          const mapped_input = toCodePoints(input)
            // 1.1 mapping to space
            .map(character => (mapping2space(character) ? 0x20 : character))
            // 1.2 mapping to nothing
            .filter(character => !mapping2nothing(character));

          // 2. Normalize
          const normalized_input = String.fromCodePoint
            .apply(null, mapped_input)
            .normalize('NFKC');

          const normalized_map = toCodePoints(normalized_input);

          // 3. Prohibit
          const hasProhibited = normalized_map.some(isProhibitedCharacter);

          if (hasProhibited) {
            throw new Error(
              'Prohibited character, see https://tools.ietf.org/html/rfc4013#section-2.3'
            );
          }

          // Unassigned Code Points
          if (opts.allowUnassigned !== true) {
            const hasUnassigned = normalized_map.some(isUnassignedCodePoint);

            if (hasUnassigned) {
              throw new Error(
                'Unassigned code point, see https://tools.ietf.org/html/rfc4013#section-2.5'
              );
            }
          }

          // 4. check bidi

          const hasBidiRAL = normalized_map.some(isBidirectionalRAL);

          const hasBidiL = normalized_map.some(isBidirectionalL);

          // 4.1 If a string contains any RandALCat character, the string MUST NOT
          // contain any LCat character.
          if (hasBidiRAL && hasBidiL) {
            throw new Error(
              'String must not contain RandALCat and LCat at the same time,' +
                ' see https://tools.ietf.org/html/rfc3454#section-6'
            );
          }

          /**
           * 4.2 If a string contains any RandALCat character, a RandALCat
           * character MUST be the first character of the string, and a
           * RandALCat character MUST be the last character of the string.
           */

          const isFirstBidiRAL = isBidirectionalRAL(
            getCodePoint(first(normalized_input))
          );
          const isLastBidiRAL = isBidirectionalRAL(
            getCodePoint(last(normalized_input))
          );

          if (hasBidiRAL && !(isFirstBidiRAL && isLastBidiRAL)) {
            throw new Error(
              'Bidirectional RandALCat character must be the first and the last' +
                ' character of the string, see https://tools.ietf.org/html/rfc3454#section-6'
            );
          }

          return normalized_input;
        }

        class PDFSecurity {
          static generateFileID(info = {}) {
            let infoStr = `${info.CreationDate.getTime()}\n`;

            for (let key in info) {
              if (!info.hasOwnProperty(key)) {
                continue;
              }
              infoStr += `${key}: ${info[key]}\n`;
            }

            return wordArrayToBuffer(F__musescoreDownloader_node_modules_cryptoJs.MD5(infoStr));
          }

          static generateRandomWordArray(bytes) {
            return F__musescoreDownloader_node_modules_cryptoJs.lib.WordArray.random(bytes);
          }

          static create(document, options = {}) {
            if (!options.ownerPassword && !options.userPassword) {
              return null;
            }
            return new PDFSecurity(document, options);
          }

          constructor(document, options = {}) {
            if (!options.ownerPassword && !options.userPassword) {
              throw new Error('None of owner password and user password is defined.');
            }

            this.document = document;
            this._setupEncryption(options);
          }

          _setupEncryption(options) {
            switch (options.pdfVersion) {
              case '1.4':
              case '1.5':
                this.version = 2;
                break;
              case '1.6':
              case '1.7':
                this.version = 4;
                break;
              case '1.7ext3':
                this.version = 5;
                break;
              default:
                this.version = 1;
                break;
            }

            const encDict = {
              Filter: 'Standard'
            };

            switch (this.version) {
              case 1:
              case 2:
              case 4:
                this._setupEncryptionV1V2V4(this.version, encDict, options);
                break;
              case 5:
                this._setupEncryptionV5(encDict, options);
                break;
            }

            this.dictionary = this.document.ref(encDict);
          }

          _setupEncryptionV1V2V4(v, encDict, options) {
            let r, permissions;
            switch (v) {
              case 1:
                r = 2;
                this.keyBits = 40;
                permissions = getPermissionsR2(options.permissions);
                break;
              case 2:
                r = 3;
                this.keyBits = 128;
                permissions = getPermissionsR3(options.permissions);
                break;
              case 4:
                r = 4;
                this.keyBits = 128;
                permissions = getPermissionsR3(options.permissions);
                break;
            }

            const paddedUserPassword = processPasswordR2R3R4(options.userPassword);
            const paddedOwnerPassword = options.ownerPassword
              ? processPasswordR2R3R4(options.ownerPassword)
              : paddedUserPassword;

            const ownerPasswordEntry = getOwnerPasswordR2R3R4(
              r,
              this.keyBits,
              paddedUserPassword,
              paddedOwnerPassword
            );
            this.encryptionKey = getEncryptionKeyR2R3R4(
              r,
              this.keyBits,
              this.document._id,
              paddedUserPassword,
              ownerPasswordEntry,
              permissions
            );
            let userPasswordEntry;
            if (r === 2) {
              userPasswordEntry = getUserPasswordR2(this.encryptionKey);
            } else {
              userPasswordEntry = getUserPasswordR3R4(
                this.document._id,
                this.encryptionKey
              );
            }

            encDict.V = v;
            if (v >= 2) {
              encDict.Length = this.keyBits;
            }
            if (v === 4) {
              encDict.CF = {
                StdCF: {
                  AuthEvent: 'DocOpen',
                  CFM: 'AESV2',
                  Length: this.keyBits / 8
                }
              };
              encDict.StmF = 'StdCF';
              encDict.StrF = 'StdCF';
            }
            encDict.R = r;
            encDict.O = wordArrayToBuffer(ownerPasswordEntry);
            encDict.U = wordArrayToBuffer(userPasswordEntry);
            encDict.P = permissions;
          }

          _setupEncryptionV5(encDict, options) {
            this.keyBits = 256;
            const permissions = getPermissionsR3(options);

            const processedUserPassword = processPasswordR5(options.userPassword);
            const processedOwnerPassword = options.ownerPassword
              ? processPasswordR5(options.ownerPassword)
              : processedUserPassword;

            this.encryptionKey = getEncryptionKeyR5(
              PDFSecurity.generateRandomWordArray
            );
            const userPasswordEntry = getUserPasswordR5(
              processedUserPassword,
              PDFSecurity.generateRandomWordArray
            );
            const userKeySalt = F__musescoreDownloader_node_modules_cryptoJs.lib.WordArray.create(
              userPasswordEntry.words.slice(10, 12),
              8
            );
            const userEncryptionKeyEntry = getUserEncryptionKeyR5(
              processedUserPassword,
              userKeySalt,
              this.encryptionKey
            );
            const ownerPasswordEntry = getOwnerPasswordR5(
              processedOwnerPassword,
              userPasswordEntry,
              PDFSecurity.generateRandomWordArray
            );
            const ownerKeySalt = F__musescoreDownloader_node_modules_cryptoJs.lib.WordArray.create(
              ownerPasswordEntry.words.slice(10, 12),
              8
            );
            const ownerEncryptionKeyEntry = getOwnerEncryptionKeyR5(
              processedOwnerPassword,
              ownerKeySalt,
              userPasswordEntry,
              this.encryptionKey
            );
            const permsEntry = getEncryptedPermissionsR5(
              permissions,
              this.encryptionKey,
              PDFSecurity.generateRandomWordArray
            );

            encDict.V = 5;
            encDict.Length = this.keyBits;
            encDict.CF = {
              StdCF: {
                AuthEvent: 'DocOpen',
                CFM: 'AESV3',
                Length: this.keyBits / 8
              }
            };
            encDict.StmF = 'StdCF';
            encDict.StrF = 'StdCF';
            encDict.R = 5;
            encDict.O = wordArrayToBuffer(ownerPasswordEntry);
            encDict.OE = wordArrayToBuffer(ownerEncryptionKeyEntry);
            encDict.U = wordArrayToBuffer(userPasswordEntry);
            encDict.UE = wordArrayToBuffer(userEncryptionKeyEntry);
            encDict.P = permissions;
            encDict.Perms = wordArrayToBuffer(permsEntry);
          }

          getEncryptFn(obj, gen) {
            let digest;
            if (this.version < 5) {
              digest = this.encryptionKey
                .clone()
                .concat(
                  F__musescoreDownloader_node_modules_cryptoJs.lib.WordArray.create(
                    [
                      ((obj & 0xff) << 24) |
                        ((obj & 0xff00) << 8) |
                        ((obj >> 8) & 0xff00) |
                        (gen & 0xff),
                      (gen & 0xff00) << 16
                    ],
                    5
                  )
                );
            }

            if (this.version === 1 || this.version === 2) {
              let key = F__musescoreDownloader_node_modules_cryptoJs.MD5(digest);
              key.sigBytes = Math.min(16, this.keyBits / 8 + 5);
              return buffer =>
                wordArrayToBuffer(
                  F__musescoreDownloader_node_modules_cryptoJs.RC4.encrypt(F__musescoreDownloader_node_modules_cryptoJs.lib.WordArray.create(buffer), key)
                    .ciphertext
                );
            }

            let key;
            if (this.version === 4) {
              key = F__musescoreDownloader_node_modules_cryptoJs.MD5(
                digest.concat(F__musescoreDownloader_node_modules_cryptoJs.lib.WordArray.create([0x73416c54], 4))
              );
            } else {
              key = this.encryptionKey;
            }

            const iv = PDFSecurity.generateRandomWordArray(16);
            const options = {
              mode: F__musescoreDownloader_node_modules_cryptoJs.mode.CBC,
              padding: F__musescoreDownloader_node_modules_cryptoJs.pad.Pkcs7,
              iv
            };

            return buffer =>
              wordArrayToBuffer(
                iv
                  .clone()
                  .concat(
                    F__musescoreDownloader_node_modules_cryptoJs.AES.encrypt(
                      F__musescoreDownloader_node_modules_cryptoJs.lib.WordArray.create(buffer),
                      key,
                      options
                    ).ciphertext
                  )
              );
          }

          end() {
            this.dictionary.end();
          }
        }

        function getPermissionsR2(permissionObject = {}) {
          let permissions = 0xffffffc0 >> 0;
          if (permissionObject.printing) {
            permissions |= 0b000000000100;
          }
          if (permissionObject.modifying) {
            permissions |= 0b000000001000;
          }
          if (permissionObject.copying) {
            permissions |= 0b000000010000;
          }
          if (permissionObject.annotating) {
            permissions |= 0b000000100000;
          }
          return permissions;
        }

        function getPermissionsR3(permissionObject = {}) {
          let permissions = 0xfffff0c0 >> 0;
          if (permissionObject.printing === 'lowResolution') {
            permissions |= 0b000000000100;
          }
          if (permissionObject.printing === 'highResolution') {
            permissions |= 0b100000000100;
          }
          if (permissionObject.modifying) {
            permissions |= 0b000000001000;
          }
          if (permissionObject.copying) {
            permissions |= 0b000000010000;
          }
          if (permissionObject.annotating) {
            permissions |= 0b000000100000;
          }
          if (permissionObject.fillingForms) {
            permissions |= 0b000100000000;
          }
          if (permissionObject.contentAccessibility) {
            permissions |= 0b001000000000;
          }
          if (permissionObject.documentAssembly) {
            permissions |= 0b010000000000;
          }
          return permissions;
        }

        function getUserPasswordR2(encryptionKey) {
          return F__musescoreDownloader_node_modules_cryptoJs.RC4.encrypt(processPasswordR2R3R4(), encryptionKey)
            .ciphertext;
        }

        function getUserPasswordR3R4(documentId, encryptionKey) {
          const key = encryptionKey.clone();
          let cipher = F__musescoreDownloader_node_modules_cryptoJs.MD5(
            processPasswordR2R3R4().concat(F__musescoreDownloader_node_modules_cryptoJs.lib.WordArray.create(documentId))
          );
          for (let i = 0; i < 20; i++) {
            const xorRound = Math.ceil(key.sigBytes / 4);
            for (let j = 0; j < xorRound; j++) {
              key.words[j] =
                encryptionKey.words[j] ^ (i | (i << 8) | (i << 16) | (i << 24));
            }
            cipher = F__musescoreDownloader_node_modules_cryptoJs.RC4.encrypt(cipher, key).ciphertext;
          }
          return cipher.concat(F__musescoreDownloader_node_modules_cryptoJs.lib.WordArray.create(null, 16));
        }

        function getOwnerPasswordR2R3R4(
          r,
          keyBits,
          paddedUserPassword,
          paddedOwnerPassword
        ) {
          let digest = paddedOwnerPassword;
          let round = r >= 3 ? 51 : 1;
          for (let i = 0; i < round; i++) {
            digest = F__musescoreDownloader_node_modules_cryptoJs.MD5(digest);
          }

          const key = digest.clone();
          key.sigBytes = keyBits / 8;
          let cipher = paddedUserPassword;
          round = r >= 3 ? 20 : 1;
          for (let i = 0; i < round; i++) {
            const xorRound = Math.ceil(key.sigBytes / 4);
            for (let j = 0; j < xorRound; j++) {
              key.words[j] = digest.words[j] ^ (i | (i << 8) | (i << 16) | (i << 24));
            }
            cipher = F__musescoreDownloader_node_modules_cryptoJs.RC4.encrypt(cipher, key).ciphertext;
          }
          return cipher;
        }

        function getEncryptionKeyR2R3R4(
          r,
          keyBits,
          documentId,
          paddedUserPassword,
          ownerPasswordEntry,
          permissions
        ) {
          let key = paddedUserPassword
            .clone()
            .concat(ownerPasswordEntry)
            .concat(F__musescoreDownloader_node_modules_cryptoJs.lib.WordArray.create([lsbFirstWord(permissions)], 4))
            .concat(F__musescoreDownloader_node_modules_cryptoJs.lib.WordArray.create(documentId));
          const round = r >= 3 ? 51 : 1;
          for (let i = 0; i < round; i++) {
            key = F__musescoreDownloader_node_modules_cryptoJs.MD5(key);
            key.sigBytes = keyBits / 8;
          }
          return key;
        }

        function getUserPasswordR5(processedUserPassword, generateRandomWordArray) {
          const validationSalt = generateRandomWordArray(8);
          const keySalt = generateRandomWordArray(8);
          return F__musescoreDownloader_node_modules_cryptoJs.SHA256(processedUserPassword.clone().concat(validationSalt))
            .concat(validationSalt)
            .concat(keySalt);
        }

        function getUserEncryptionKeyR5(
          processedUserPassword,
          userKeySalt,
          encryptionKey
        ) {
          const key = F__musescoreDownloader_node_modules_cryptoJs.SHA256(
            processedUserPassword.clone().concat(userKeySalt)
          );
          const options = {
            mode: F__musescoreDownloader_node_modules_cryptoJs.mode.CBC,
            padding: F__musescoreDownloader_node_modules_cryptoJs.pad.NoPadding,
            iv: F__musescoreDownloader_node_modules_cryptoJs.lib.WordArray.create(null, 16)
          };
          return F__musescoreDownloader_node_modules_cryptoJs.AES.encrypt(encryptionKey, key, options).ciphertext;
        }

        function getOwnerPasswordR5(
          processedOwnerPassword,
          userPasswordEntry,
          generateRandomWordArray
        ) {
          const validationSalt = generateRandomWordArray(8);
          const keySalt = generateRandomWordArray(8);
          return F__musescoreDownloader_node_modules_cryptoJs.SHA256(
            processedOwnerPassword
              .clone()
              .concat(validationSalt)
              .concat(userPasswordEntry)
          )
            .concat(validationSalt)
            .concat(keySalt);
        }

        function getOwnerEncryptionKeyR5(
          processedOwnerPassword,
          ownerKeySalt,
          userPasswordEntry,
          encryptionKey
        ) {
          const key = F__musescoreDownloader_node_modules_cryptoJs.SHA256(
            processedOwnerPassword
              .clone()
              .concat(ownerKeySalt)
              .concat(userPasswordEntry)
          );
          const options = {
            mode: F__musescoreDownloader_node_modules_cryptoJs.mode.CBC,
            padding: F__musescoreDownloader_node_modules_cryptoJs.pad.NoPadding,
            iv: F__musescoreDownloader_node_modules_cryptoJs.lib.WordArray.create(null, 16)
          };
          return F__musescoreDownloader_node_modules_cryptoJs.AES.encrypt(encryptionKey, key, options).ciphertext;
        }

        function getEncryptionKeyR5(generateRandomWordArray) {
          return generateRandomWordArray(32);
        }

        function getEncryptedPermissionsR5(
          permissions,
          encryptionKey,
          generateRandomWordArray
        ) {
          const cipher = F__musescoreDownloader_node_modules_cryptoJs.lib.WordArray.create(
            [lsbFirstWord(permissions), 0xffffffff, 0x54616462],
            12
          ).concat(generateRandomWordArray(4));
          const options = {
            mode: F__musescoreDownloader_node_modules_cryptoJs.mode.ECB,
            padding: F__musescoreDownloader_node_modules_cryptoJs.pad.NoPadding
          };
          return F__musescoreDownloader_node_modules_cryptoJs.AES.encrypt(cipher, encryptionKey, options).ciphertext;
        }

        function processPasswordR2R3R4(password = '') {
          const out = new Buffer(32);
          const length = password.length;
          let index = 0;
          while (index < length && index < 32) {
            const code = password.charCodeAt(index);
            if (code > 0xff) {
              throw new Error('Password contains one or more invalid characters.');
            }
            out[index] = code;
            index++;
          }
          while (index < 32) {
            out[index] = PASSWORD_PADDING[index - length];
            index++;
          }
          return F__musescoreDownloader_node_modules_cryptoJs.lib.WordArray.create(out);
        }

        function processPasswordR5(password = '') {
          password = unescape(encodeURIComponent(saslprep(password)));
          const length = Math.min(127, password.length);
          const out = new Buffer(length);

          for (let i = 0; i < length; i++) {
            out[i] = password.charCodeAt(i);
          }

          return F__musescoreDownloader_node_modules_cryptoJs.lib.WordArray.create(out);
        }

        function lsbFirstWord(data) {
          return (
            ((data & 0xff) << 24) |
            ((data & 0xff00) << 8) |
            ((data >> 8) & 0xff00) |
            ((data >> 24) & 0xff)
          );
        }

        function wordArrayToBuffer(wordArray) {
          const byteArray = [];
          for (let i = 0; i < wordArray.sigBytes; i++) {
            byteArray.push(
              (wordArray.words[Math.floor(i / 4)] >> (8 * (3 - (i % 4)))) & 0xff
            );
          }
          return Buffer.from(byteArray);
        }

        const PASSWORD_PADDING = [
          0x28,
          0xbf,
          0x4e,
          0x5e,
          0x4e,
          0x75,
          0x8a,
          0x41,
          0x64,
          0x00,
          0x4e,
          0x56,
          0xff,
          0xfa,
          0x01,
          0x08,
          0x2e,
          0x2e,
          0x00,
          0xb6,
          0xd0,
          0x68,
          0x3e,
          0x80,
          0x2f,
          0x0c,
          0xa9,
          0xfe,
          0x64,
          0x53,
          0x69,
          0x7a
        ];

        const { number } = PDFObject;

        class PDFGradient {
          constructor(doc) {
            this.doc = doc;
            this.stops = [];
            this.embedded = false;
            this.transform = [1, 0, 0, 1, 0, 0];
          }

          stop(pos, color, opacity) {
            if (opacity == null) {
              opacity = 1;
            }
            color = this.doc._normalizeColor(color);

            if (this.stops.length === 0) {
              if (color.length === 3) {
                this._colorSpace = 'DeviceRGB';
              } else if (color.length === 4) {
                this._colorSpace = 'DeviceCMYK';
              } else if (color.length === 1) {
                this._colorSpace = 'DeviceGray';
              } else {
                throw new Error('Unknown color space');
              }
            } else if (
              (this._colorSpace === 'DeviceRGB' && color.length !== 3) ||
              (this._colorSpace === 'DeviceCMYK' && color.length !== 4) ||
              (this._colorSpace === 'DeviceGray' && color.length !== 1)
            ) {
              throw new Error('All gradient stops must use the same color space');
            }

            opacity = Math.max(0, Math.min(1, opacity));
            this.stops.push([pos, color, opacity]);
            return this;
          }

          setTransform(m11, m12, m21, m22, dx, dy) {
            this.transform = [m11, m12, m21, m22, dx, dy];
            return this;
          }

          embed(m) {
            let fn;
            const stopsLength = this.stops.length;
            if (stopsLength === 0) {
              return;
            }
            this.embedded = true;
            this.matrix = m;

            // if the last stop comes before 100%, add a copy at 100%
            const last = this.stops[stopsLength - 1];
            if (last[0] < 1) {
              this.stops.push([1, last[1], last[2]]);
            }

            const bounds = [];
            const encode = [];
            const stops = [];

            for (let i = 0; i < stopsLength - 1; i++) {
              encode.push(0, 1);
              if (i + 2 !== stopsLength) {
                bounds.push(this.stops[i + 1][0]);
              }

              fn = this.doc.ref({
                FunctionType: 2,
                Domain: [0, 1],
                C0: this.stops[i + 0][1],
                C1: this.stops[i + 1][1],
                N: 1
              });

              stops.push(fn);
              fn.end();
            }

            // if there are only two stops, we don't need a stitching function
            if (stopsLength === 1) {
              fn = stops[0];
            } else {
              fn = this.doc.ref({
                FunctionType: 3, // stitching function
                Domain: [0, 1],
                Functions: stops,
                Bounds: bounds,
                Encode: encode
              });

              fn.end();
            }

            this.id = `Sh${++this.doc._gradCount}`;

            const shader = this.shader(fn);
            shader.end();

            const pattern = this.doc.ref({
              Type: 'Pattern',
              PatternType: 2,
              Shading: shader,
              Matrix: this.matrix.map(number)
            });

            pattern.end();

            if (this.stops.some(stop => stop[2] < 1)) {
              let grad = this.opacityGradient();
              grad._colorSpace = 'DeviceGray';

              for (let stop of this.stops) {
                grad.stop(stop[0], [stop[2]]);
              }

              grad = grad.embed(this.matrix);

              const pageBBox = [0, 0, this.doc.page.width, this.doc.page.height];

              const form = this.doc.ref({
                Type: 'XObject',
                Subtype: 'Form',
                FormType: 1,
                BBox: pageBBox,
                Group: {
                  Type: 'Group',
                  S: 'Transparency',
                  CS: 'DeviceGray'
                },
                Resources: {
                  ProcSet: ['PDF', 'Text', 'ImageB', 'ImageC', 'ImageI'],
                  Pattern: {
                    Sh1: grad
                  }
                }
              });

              form.write('/Pattern cs /Sh1 scn');
              form.end(`${pageBBox.join(' ')} re f`);

              const gstate = this.doc.ref({
                Type: 'ExtGState',
                SMask: {
                  Type: 'Mask',
                  S: 'Luminosity',
                  G: form
                }
              });

              gstate.end();

              const opacityPattern = this.doc.ref({
                Type: 'Pattern',
                PatternType: 1,
                PaintType: 1,
                TilingType: 2,
                BBox: pageBBox,
                XStep: pageBBox[2],
                YStep: pageBBox[3],
                Resources: {
                  ProcSet: ['PDF', 'Text', 'ImageB', 'ImageC', 'ImageI'],
                  Pattern: {
                    Sh1: pattern
                  },
                  ExtGState: {
                    Gs1: gstate
                  }
                }
              });

              opacityPattern.write('/Gs1 gs /Pattern cs /Sh1 scn');
              opacityPattern.end(`${pageBBox.join(' ')} re f`);

              this.doc.page.patterns[this.id] = opacityPattern;
            } else {
              this.doc.page.patterns[this.id] = pattern;
            }

            return pattern;
          }

          apply(op) {
            // apply gradient transform to existing document ctm
            const [m0, m1, m2, m3, m4, m5] = this.doc._ctm;
            const [m11, m12, m21, m22, dx, dy] = this.transform;
            const m = [
              m0 * m11 + m2 * m12,
              m1 * m11 + m3 * m12,
              m0 * m21 + m2 * m22,
              m1 * m21 + m3 * m22,
              m0 * dx + m2 * dy + m4,
              m1 * dx + m3 * dy + m5
            ];

            if (!this.embedded || m.join(' ') !== this.matrix.join(' ')) {
              this.embed(m);
            }
            return this.doc.addContent(`/${this.id} ${op}`);
          }
        }

        class PDFLinearGradient extends PDFGradient {
          constructor(doc, x1, y1, x2, y2) {
            super(doc);
            this.x1 = x1;
            this.y1 = y1;
            this.x2 = x2;
            this.y2 = y2;
          }

          shader(fn) {
            return this.doc.ref({
              ShadingType: 2,
              ColorSpace: this._colorSpace,
              Coords: [this.x1, this.y1, this.x2, this.y2],
              Function: fn,
              Extend: [true, true]
            });
          }

          opacityGradient() {
            return new PDFLinearGradient(this.doc, this.x1, this.y1, this.x2, this.y2);
          }
        }

        class PDFRadialGradient extends PDFGradient {
          constructor(doc, x1, y1, r1, x2, y2, r2) {
            super(doc);
            this.doc = doc;
            this.x1 = x1;
            this.y1 = y1;
            this.r1 = r1;
            this.x2 = x2;
            this.y2 = y2;
            this.r2 = r2;
          }

          shader(fn) {
            return this.doc.ref({
              ShadingType: 3,
              ColorSpace: this._colorSpace,
              Coords: [this.x1, this.y1, this.r1, this.x2, this.y2, this.r2],
              Function: fn,
              Extend: [true, true]
            });
          }

          opacityGradient() {
            return new PDFRadialGradient(
              this.doc,
              this.x1,
              this.y1,
              this.r1,
              this.x2,
              this.y2,
              this.r2
            );
          }
        }

        var Gradient = { PDFGradient, PDFLinearGradient, PDFRadialGradient };

        const { PDFGradient: PDFGradient$1, PDFLinearGradient: PDFLinearGradient$1, PDFRadialGradient: PDFRadialGradient$1 } = Gradient;

        var ColorMixin = {
          initColor() {
            // The opacity dictionaries
            this._opacityRegistry = {};
            this._opacityCount = 0;
            return (this._gradCount = 0);
          },

          _normalizeColor(color) {
            if (color instanceof PDFGradient$1) {
              return color;
            }

            if (typeof color === 'string') {
              if (color.charAt(0) === '#') {
                if (color.length === 4) {
                  color = color.replace(
                    /#([0-9A-F])([0-9A-F])([0-9A-F])/i,
                    '#$1$1$2$2$3$3'
                  );
                }
                const hex = parseInt(color.slice(1), 16);
                color = [hex >> 16, (hex >> 8) & 0xff, hex & 0xff];
              } else if (namedColors[color]) {
                color = namedColors[color];
              }
            }

            if (Array.isArray(color)) {
              // RGB
              if (color.length === 3) {
                color = color.map(part => part / 255);
                // CMYK
              } else if (color.length === 4) {
                color = color.map(part => part / 100);
              }
              return color;
            }

            return null;
          },

          _setColor(color, stroke) {
            color = this._normalizeColor(color);
            if (!color) {
              return false;
            }

            const op = stroke ? 'SCN' : 'scn';

            if (color instanceof PDFGradient$1) {
              this._setColorSpace('Pattern', stroke);
              color.apply(op);
            } else {
              const space = color.length === 4 ? 'DeviceCMYK' : 'DeviceRGB';
              this._setColorSpace(space, stroke);

              color = color.join(' ');
              this.addContent(`${color} ${op}`);
            }

            return true;
          },

          _setColorSpace(space, stroke) {
            const op = stroke ? 'CS' : 'cs';
            return this.addContent(`/${space} ${op}`);
          },

          fillColor(color, opacity) {
            const set = this._setColor(color, false);
            if (set) {
              this.fillOpacity(opacity);
            }

            // save this for text wrapper, which needs to reset
            // the fill color on new pages
            this._fillColor = [color, opacity];
            return this;
          },

          strokeColor(color, opacity) {
            const set = this._setColor(color, true);
            if (set) {
              this.strokeOpacity(opacity);
            }
            return this;
          },

          opacity(opacity) {
            this._doOpacity(opacity, opacity);
            return this;
          },

          fillOpacity(opacity) {
            this._doOpacity(opacity, null);
            return this;
          },

          strokeOpacity(opacity) {
            this._doOpacity(null, opacity);
            return this;
          },

          _doOpacity(fillOpacity, strokeOpacity) {
            let dictionary, name;
            if (fillOpacity == null && strokeOpacity == null) {
              return;
            }

            if (fillOpacity != null) {
              fillOpacity = Math.max(0, Math.min(1, fillOpacity));
            }
            if (strokeOpacity != null) {
              strokeOpacity = Math.max(0, Math.min(1, strokeOpacity));
            }
            const key = `${fillOpacity}_${strokeOpacity}`;

            if (this._opacityRegistry[key]) {
              [dictionary, name] = this._opacityRegistry[key];
            } else {
              dictionary = { Type: 'ExtGState' };

              if (fillOpacity != null) {
                dictionary.ca = fillOpacity;
              }
              if (strokeOpacity != null) {
                dictionary.CA = strokeOpacity;
              }

              dictionary = this.ref(dictionary);
              dictionary.end();
              const id = ++this._opacityCount;
              name = `Gs${id}`;
              this._opacityRegistry[key] = [dictionary, name];
            }

            this.page.ext_gstates[name] = dictionary;
            return this.addContent(`/${name} gs`);
          },

          linearGradient(x1, y1, x2, y2) {
            return new PDFLinearGradient$1(this, x1, y1, x2, y2);
          },

          radialGradient(x1, y1, r1, x2, y2, r2) {
            return new PDFRadialGradient$1(this, x1, y1, r1, x2, y2, r2);
          }
        };

        var namedColors = {
          aliceblue: [240, 248, 255],
          antiquewhite: [250, 235, 215],
          aqua: [0, 255, 255],
          aquamarine: [127, 255, 212],
          azure: [240, 255, 255],
          beige: [245, 245, 220],
          bisque: [255, 228, 196],
          black: [0, 0, 0],
          blanchedalmond: [255, 235, 205],
          blue: [0, 0, 255],
          blueviolet: [138, 43, 226],
          brown: [165, 42, 42],
          burlywood: [222, 184, 135],
          cadetblue: [95, 158, 160],
          chartreuse: [127, 255, 0],
          chocolate: [210, 105, 30],
          coral: [255, 127, 80],
          cornflowerblue: [100, 149, 237],
          cornsilk: [255, 248, 220],
          crimson: [220, 20, 60],
          cyan: [0, 255, 255],
          darkblue: [0, 0, 139],
          darkcyan: [0, 139, 139],
          darkgoldenrod: [184, 134, 11],
          darkgray: [169, 169, 169],
          darkgreen: [0, 100, 0],
          darkgrey: [169, 169, 169],
          darkkhaki: [189, 183, 107],
          darkmagenta: [139, 0, 139],
          darkolivegreen: [85, 107, 47],
          darkorange: [255, 140, 0],
          darkorchid: [153, 50, 204],
          darkred: [139, 0, 0],
          darksalmon: [233, 150, 122],
          darkseagreen: [143, 188, 143],
          darkslateblue: [72, 61, 139],
          darkslategray: [47, 79, 79],
          darkslategrey: [47, 79, 79],
          darkturquoise: [0, 206, 209],
          darkviolet: [148, 0, 211],
          deeppink: [255, 20, 147],
          deepskyblue: [0, 191, 255],
          dimgray: [105, 105, 105],
          dimgrey: [105, 105, 105],
          dodgerblue: [30, 144, 255],
          firebrick: [178, 34, 34],
          floralwhite: [255, 250, 240],
          forestgreen: [34, 139, 34],
          fuchsia: [255, 0, 255],
          gainsboro: [220, 220, 220],
          ghostwhite: [248, 248, 255],
          gold: [255, 215, 0],
          goldenrod: [218, 165, 32],
          gray: [128, 128, 128],
          grey: [128, 128, 128],
          green: [0, 128, 0],
          greenyellow: [173, 255, 47],
          honeydew: [240, 255, 240],
          hotpink: [255, 105, 180],
          indianred: [205, 92, 92],
          indigo: [75, 0, 130],
          ivory: [255, 255, 240],
          khaki: [240, 230, 140],
          lavender: [230, 230, 250],
          lavenderblush: [255, 240, 245],
          lawngreen: [124, 252, 0],
          lemonchiffon: [255, 250, 205],
          lightblue: [173, 216, 230],
          lightcoral: [240, 128, 128],
          lightcyan: [224, 255, 255],
          lightgoldenrodyellow: [250, 250, 210],
          lightgray: [211, 211, 211],
          lightgreen: [144, 238, 144],
          lightgrey: [211, 211, 211],
          lightpink: [255, 182, 193],
          lightsalmon: [255, 160, 122],
          lightseagreen: [32, 178, 170],
          lightskyblue: [135, 206, 250],
          lightslategray: [119, 136, 153],
          lightslategrey: [119, 136, 153],
          lightsteelblue: [176, 196, 222],
          lightyellow: [255, 255, 224],
          lime: [0, 255, 0],
          limegreen: [50, 205, 50],
          linen: [250, 240, 230],
          magenta: [255, 0, 255],
          maroon: [128, 0, 0],
          mediumaquamarine: [102, 205, 170],
          mediumblue: [0, 0, 205],
          mediumorchid: [186, 85, 211],
          mediumpurple: [147, 112, 219],
          mediumseagreen: [60, 179, 113],
          mediumslateblue: [123, 104, 238],
          mediumspringgreen: [0, 250, 154],
          mediumturquoise: [72, 209, 204],
          mediumvioletred: [199, 21, 133],
          midnightblue: [25, 25, 112],
          mintcream: [245, 255, 250],
          mistyrose: [255, 228, 225],
          moccasin: [255, 228, 181],
          navajowhite: [255, 222, 173],
          navy: [0, 0, 128],
          oldlace: [253, 245, 230],
          olive: [128, 128, 0],
          olivedrab: [107, 142, 35],
          orange: [255, 165, 0],
          orangered: [255, 69, 0],
          orchid: [218, 112, 214],
          palegoldenrod: [238, 232, 170],
          palegreen: [152, 251, 152],
          paleturquoise: [175, 238, 238],
          palevioletred: [219, 112, 147],
          papayawhip: [255, 239, 213],
          peachpuff: [255, 218, 185],
          peru: [205, 133, 63],
          pink: [255, 192, 203],
          plum: [221, 160, 221],
          powderblue: [176, 224, 230],
          purple: [128, 0, 128],
          red: [255, 0, 0],
          rosybrown: [188, 143, 143],
          royalblue: [65, 105, 225],
          saddlebrown: [139, 69, 19],
          salmon: [250, 128, 114],
          sandybrown: [244, 164, 96],
          seagreen: [46, 139, 87],
          seashell: [255, 245, 238],
          sienna: [160, 82, 45],
          silver: [192, 192, 192],
          skyblue: [135, 206, 235],
          slateblue: [106, 90, 205],
          slategray: [112, 128, 144],
          slategrey: [112, 128, 144],
          snow: [255, 250, 250],
          springgreen: [0, 255, 127],
          steelblue: [70, 130, 180],
          tan: [210, 180, 140],
          teal: [0, 128, 128],
          thistle: [216, 191, 216],
          tomato: [255, 99, 71],
          turquoise: [64, 224, 208],
          violet: [238, 130, 238],
          wheat: [245, 222, 179],
          white: [255, 255, 255],
          whitesmoke: [245, 245, 245],
          yellow: [255, 255, 0],
          yellowgreen: [154, 205, 50]
        };

        let cx, cy, px, py, sx, sy;

        cx = cy = px = py = sx = sy = 0;

        const parameters = {
          A: 7,
          a: 7,
          C: 6,
          c: 6,
          H: 1,
          h: 1,
          L: 2,
          l: 2,
          M: 2,
          m: 2,
          Q: 4,
          q: 4,
          S: 4,
          s: 4,
          T: 2,
          t: 2,
          V: 1,
          v: 1,
          Z: 0,
          z: 0
        };

        const parse = function(path) {
          let cmd;
          const ret = [];
          let args = [];
          let curArg = '';
          let foundDecimal = false;
          let params = 0;

          for (let c of path) {
            if (parameters[c] != null) {
              params = parameters[c];
              if (cmd) {
                // save existing command
                if (curArg.length > 0) {
                  args[args.length] = +curArg;
                }
                ret[ret.length] = { cmd, args };

                args = [];
                curArg = '';
                foundDecimal = false;
              }

              cmd = c;
            } else if (
              [' ', ','].includes(c) ||
              (c === '-' && curArg.length > 0 && curArg[curArg.length - 1] !== 'e') ||
              (c === '.' && foundDecimal)
            ) {
              if (curArg.length === 0) {
                continue;
              }

              if (args.length === params) {
                // handle reused commands
                ret[ret.length] = { cmd, args };
                args = [+curArg];

                // handle assumed commands
                if (cmd === 'M') {
                  cmd = 'L';
                }
                if (cmd === 'm') {
                  cmd = 'l';
                }
              } else {
                args[args.length] = +curArg;
              }

              foundDecimal = c === '.';

              // fix for negative numbers or repeated decimals with no delimeter between commands
              curArg = ['-', '.'].includes(c) ? c : '';
            } else {
              curArg += c;
              if (c === '.') {
                foundDecimal = true;
              }
            }
          }

          // add the last command
          if (curArg.length > 0) {
            if (args.length === params) {
              // handle reused commands
              ret[ret.length] = { cmd, args };
              args = [+curArg];

              // handle assumed commands
              if (cmd === 'M') {
                cmd = 'L';
              }
              if (cmd === 'm') {
                cmd = 'l';
              }
            } else {
              args[args.length] = +curArg;
            }
          }

          ret[ret.length] = { cmd, args };

          return ret;
        };

        const apply = function(commands, doc) {
          // current point, control point, and subpath starting point
          cx = cy = px = py = sx = sy = 0;

          // run the commands
          for (let i = 0; i < commands.length; i++) {
            const c = commands[i];
            if (typeof runners[c.cmd] === 'function') {
              runners[c.cmd](doc, c.args);
            }
          }
        };

        const runners = {
          M(doc, a) {
            cx = a[0];
            cy = a[1];
            px = py = null;
            sx = cx;
            sy = cy;
            return doc.moveTo(cx, cy);
          },

          m(doc, a) {
            cx += a[0];
            cy += a[1];
            px = py = null;
            sx = cx;
            sy = cy;
            return doc.moveTo(cx, cy);
          },

          C(doc, a) {
            cx = a[4];
            cy = a[5];
            px = a[2];
            py = a[3];
            return doc.bezierCurveTo(...a);
          },

          c(doc, a) {
            doc.bezierCurveTo(
              a[0] + cx,
              a[1] + cy,
              a[2] + cx,
              a[3] + cy,
              a[4] + cx,
              a[5] + cy
            );
            px = cx + a[2];
            py = cy + a[3];
            cx += a[4];
            return (cy += a[5]);
          },

          S(doc, a) {
            if (px === null) {
              px = cx;
              py = cy;
            }

            doc.bezierCurveTo(cx - (px - cx), cy - (py - cy), a[0], a[1], a[2], a[3]);
            px = a[0];
            py = a[1];
            cx = a[2];
            return (cy = a[3]);
          },

          s(doc, a) {
            if (px === null) {
              px = cx;
              py = cy;
            }

            doc.bezierCurveTo(
              cx - (px - cx),
              cy - (py - cy),
              cx + a[0],
              cy + a[1],
              cx + a[2],
              cy + a[3]
            );
            px = cx + a[0];
            py = cy + a[1];
            cx += a[2];
            return (cy += a[3]);
          },

          Q(doc, a) {
            px = a[0];
            py = a[1];
            cx = a[2];
            cy = a[3];
            return doc.quadraticCurveTo(a[0], a[1], cx, cy);
          },

          q(doc, a) {
            doc.quadraticCurveTo(a[0] + cx, a[1] + cy, a[2] + cx, a[3] + cy);
            px = cx + a[0];
            py = cy + a[1];
            cx += a[2];
            return (cy += a[3]);
          },

          T(doc, a) {
            if (px === null) {
              px = cx;
              py = cy;
            } else {
              px = cx - (px - cx);
              py = cy - (py - cy);
            }

            doc.quadraticCurveTo(px, py, a[0], a[1]);
            px = cx - (px - cx);
            py = cy - (py - cy);
            cx = a[0];
            return (cy = a[1]);
          },

          t(doc, a) {
            if (px === null) {
              px = cx;
              py = cy;
            } else {
              px = cx - (px - cx);
              py = cy - (py - cy);
            }

            doc.quadraticCurveTo(px, py, cx + a[0], cy + a[1]);
            cx += a[0];
            return (cy += a[1]);
          },

          A(doc, a) {
            solveArc(doc, cx, cy, a);
            cx = a[5];
            return (cy = a[6]);
          },

          a(doc, a) {
            a[5] += cx;
            a[6] += cy;
            solveArc(doc, cx, cy, a);
            cx = a[5];
            return (cy = a[6]);
          },

          L(doc, a) {
            cx = a[0];
            cy = a[1];
            px = py = null;
            return doc.lineTo(cx, cy);
          },

          l(doc, a) {
            cx += a[0];
            cy += a[1];
            px = py = null;
            return doc.lineTo(cx, cy);
          },

          H(doc, a) {
            cx = a[0];
            px = py = null;
            return doc.lineTo(cx, cy);
          },

          h(doc, a) {
            cx += a[0];
            px = py = null;
            return doc.lineTo(cx, cy);
          },

          V(doc, a) {
            cy = a[0];
            px = py = null;
            return doc.lineTo(cx, cy);
          },

          v(doc, a) {
            cy += a[0];
            px = py = null;
            return doc.lineTo(cx, cy);
          },

          Z(doc) {
            doc.closePath();
            cx = sx;
            return (cy = sy);
          },

          z(doc) {
            doc.closePath();
            cx = sx;
            return (cy = sy);
          }
        };

        const solveArc = function(doc, x, y, coords) {
          const [rx, ry, rot, large, sweep, ex, ey] = coords;
          const segs = arcToSegments(ex, ey, rx, ry, large, sweep, rot, x, y);

          for (let seg of segs) {
            const bez = segmentToBezier(...seg);
            doc.bezierCurveTo(...bez);
          }
        };

        // from Inkscape svgtopdf, thanks!
        const arcToSegments = function(x, y, rx, ry, large, sweep, rotateX, ox, oy) {
          const th = rotateX * (Math.PI / 180);
          const sin_th = Math.sin(th);
          const cos_th = Math.cos(th);
          rx = Math.abs(rx);
          ry = Math.abs(ry);
          px = cos_th * (ox - x) * 0.5 + sin_th * (oy - y) * 0.5;
          py = cos_th * (oy - y) * 0.5 - sin_th * (ox - x) * 0.5;
          let pl = (px * px) / (rx * rx) + (py * py) / (ry * ry);
          if (pl > 1) {
            pl = Math.sqrt(pl);
            rx *= pl;
            ry *= pl;
          }

          const a00 = cos_th / rx;
          const a01 = sin_th / rx;
          const a10 = -sin_th / ry;
          const a11 = cos_th / ry;
          const x0 = a00 * ox + a01 * oy;
          const y0 = a10 * ox + a11 * oy;
          const x1 = a00 * x + a01 * y;
          const y1 = a10 * x + a11 * y;

          const d = (x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0);
          let sfactor_sq = 1 / d - 0.25;
          if (sfactor_sq < 0) {
            sfactor_sq = 0;
          }
          let sfactor = Math.sqrt(sfactor_sq);
          if (sweep === large) {
            sfactor = -sfactor;
          }

          const xc = 0.5 * (x0 + x1) - sfactor * (y1 - y0);
          const yc = 0.5 * (y0 + y1) + sfactor * (x1 - x0);

          const th0 = Math.atan2(y0 - yc, x0 - xc);
          const th1 = Math.atan2(y1 - yc, x1 - xc);

          let th_arc = th1 - th0;
          if (th_arc < 0 && sweep === 1) {
            th_arc += 2 * Math.PI;
          } else if (th_arc > 0 && sweep === 0) {
            th_arc -= 2 * Math.PI;
          }

          const segments = Math.ceil(Math.abs(th_arc / (Math.PI * 0.5 + 0.001)));
          const result = [];

          for (let i = 0; i < segments; i++) {
            const th2 = th0 + (i * th_arc) / segments;
            const th3 = th0 + ((i + 1) * th_arc) / segments;
            result[i] = [xc, yc, th2, th3, rx, ry, sin_th, cos_th];
          }

          return result;
        };

        const segmentToBezier = function(cx, cy, th0, th1, rx, ry, sin_th, cos_th) {
          const a00 = cos_th * rx;
          const a01 = -sin_th * ry;
          const a10 = sin_th * rx;
          const a11 = cos_th * ry;

          const th_half = 0.5 * (th1 - th0);
          const t =
            ((8 / 3) * Math.sin(th_half * 0.5) * Math.sin(th_half * 0.5)) /
            Math.sin(th_half);
          const x1 = cx + Math.cos(th0) - t * Math.sin(th0);
          const y1 = cy + Math.sin(th0) + t * Math.cos(th0);
          const x3 = cx + Math.cos(th1);
          const y3 = cy + Math.sin(th1);
          const x2 = x3 + t * Math.sin(th1);
          const y2 = y3 - t * Math.cos(th1);

          return [
            a00 * x1 + a01 * y1,
            a10 * x1 + a11 * y1,
            a00 * x2 + a01 * y2,
            a10 * x2 + a11 * y2,
            a00 * x3 + a01 * y3,
            a10 * x3 + a11 * y3
          ];
        };

        class SVGPath {
          static apply(doc, path) {
            const commands = parse(path);
            apply(commands, doc);
          }
        }

        const { number: number$1 } = PDFObject;

        // This constant is used to approximate a symmetrical arc using a cubic
        // Bezier curve.
        const KAPPA = 4.0 * ((Math.sqrt(2) - 1.0) / 3.0);
        var VectorMixin = {
          initVector() {
            this._ctm = [1, 0, 0, 1, 0, 0]; // current transformation matrix
            return (this._ctmStack = []);
          },

          save() {
            this._ctmStack.push(this._ctm.slice());
            // TODO: save/restore colorspace and styles so not setting it unnessesarily all the time?
            return this.addContent('q');
          },

          restore() {
            this._ctm = this._ctmStack.pop() || [1, 0, 0, 1, 0, 0];
            return this.addContent('Q');
          },

          closePath() {
            return this.addContent('h');
          },

          lineWidth(w) {
            return this.addContent(`${number$1(w)} w`);
          },

          _CAP_STYLES: {
            BUTT: 0,
            ROUND: 1,
            SQUARE: 2
          },

          lineCap(c) {
            if (typeof c === 'string') {
              c = this._CAP_STYLES[c.toUpperCase()];
            }
            return this.addContent(`${c} J`);
          },

          _JOIN_STYLES: {
            MITER: 0,
            ROUND: 1,
            BEVEL: 2
          },

          lineJoin(j) {
            if (typeof j === 'string') {
              j = this._JOIN_STYLES[j.toUpperCase()];
            }
            return this.addContent(`${j} j`);
          },

          miterLimit(m) {
            return this.addContent(`${number$1(m)} M`);
          },

          dash(length, options = {}) {
            const originalLength = length;
            if (!Array.isArray(length)) {
              length = [length, options.space || length];
            }

            const valid = length.every(x => Number.isFinite(x) && x > 0);
            if(!valid) {
              throw new Error(`dash(${JSON.stringify(originalLength)}, ${JSON.stringify(options)}) invalid, lengths must be numeric and greater than zero`);
            }

            length = length.map(number$1).join(' ');
            return this.addContent(`[${length}] ${number$1(options.phase || 0)} d`);
          },

          undash() {
            return this.addContent('[] 0 d');
          },

          moveTo(x, y) {
            return this.addContent(`${number$1(x)} ${number$1(y)} m`);
          },

          lineTo(x, y) {
            return this.addContent(`${number$1(x)} ${number$1(y)} l`);
          },

          bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y) {
            return this.addContent(
              `${number$1(cp1x)} ${number$1(cp1y)} ${number$1(cp2x)} ${number$1(cp2y)} ${number$1(
        x
      )} ${number$1(y)} c`
            );
          },

          quadraticCurveTo(cpx, cpy, x, y) {
            return this.addContent(
              `${number$1(cpx)} ${number$1(cpy)} ${number$1(x)} ${number$1(y)} v`
            );
          },

          rect(x, y, w, h) {
            return this.addContent(
              `${number$1(x)} ${number$1(y)} ${number$1(w)} ${number$1(h)} re`
            );
          },

          roundedRect(x, y, w, h, r) {
            if (r == null) {
              r = 0;
            }
            r = Math.min(r, 0.5 * w, 0.5 * h);

            // amount to inset control points from corners (see `ellipse`)
            const c = r * (1.0 - KAPPA);

            this.moveTo(x + r, y);
            this.lineTo(x + w - r, y);
            this.bezierCurveTo(x + w - c, y, x + w, y + c, x + w, y + r);
            this.lineTo(x + w, y + h - r);
            this.bezierCurveTo(x + w, y + h - c, x + w - c, y + h, x + w - r, y + h);
            this.lineTo(x + r, y + h);
            this.bezierCurveTo(x + c, y + h, x, y + h - c, x, y + h - r);
            this.lineTo(x, y + r);
            this.bezierCurveTo(x, y + c, x + c, y, x + r, y);
            return this.closePath();
          },

          ellipse(x, y, r1, r2) {
            // based on http://stackoverflow.com/questions/2172798/how-to-draw-an-oval-in-html5-canvas/2173084#2173084
            if (r2 == null) {
              r2 = r1;
            }
            x -= r1;
            y -= r2;
            const ox = r1 * KAPPA;
            const oy = r2 * KAPPA;
            const xe = x + r1 * 2;
            const ye = y + r2 * 2;
            const xm = x + r1;
            const ym = y + r2;

            this.moveTo(x, ym);
            this.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
            this.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
            this.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
            this.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
            return this.closePath();
          },

          circle(x, y, radius) {
            return this.ellipse(x, y, radius);
          },

          arc(x, y, radius, startAngle, endAngle, anticlockwise) {
            if (anticlockwise == null) {
              anticlockwise = false;
            }
            const TWO_PI = 2.0 * Math.PI;
            const HALF_PI = 0.5 * Math.PI;

            let deltaAng = endAngle - startAngle;

            if (Math.abs(deltaAng) > TWO_PI) {
              // draw only full circle if more than that is specified
              deltaAng = TWO_PI;
            } else if (deltaAng !== 0 && anticlockwise !== deltaAng < 0) {
              // necessary to flip direction of rendering
              const dir = anticlockwise ? -1 : 1;
              deltaAng = dir * TWO_PI + deltaAng;
            }

            const numSegs = Math.ceil(Math.abs(deltaAng) / HALF_PI);
            const segAng = deltaAng / numSegs;
            const handleLen = (segAng / HALF_PI) * KAPPA * radius;
            let curAng = startAngle;

            // component distances between anchor point and control point
            let deltaCx = -Math.sin(curAng) * handleLen;
            let deltaCy = Math.cos(curAng) * handleLen;

            // anchor point
            let ax = x + Math.cos(curAng) * radius;
            let ay = y + Math.sin(curAng) * radius;

            // calculate and render segments
            this.moveTo(ax, ay);

            for (let segIdx = 0; segIdx < numSegs; segIdx++) {
              // starting control point
              const cp1x = ax + deltaCx;
              const cp1y = ay + deltaCy;

              // step angle
              curAng += segAng;

              // next anchor point
              ax = x + Math.cos(curAng) * radius;
              ay = y + Math.sin(curAng) * radius;

              // next control point delta
              deltaCx = -Math.sin(curAng) * handleLen;
              deltaCy = Math.cos(curAng) * handleLen;

              // ending control point
              const cp2x = ax - deltaCx;
              const cp2y = ay - deltaCy;

              // render segment
              this.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, ax, ay);
            }

            return this;
          },

          polygon(...points) {
            this.moveTo(...(points.shift() || []));
            for (let point of points) {
              this.lineTo(...(point || []));
            }
            return this.closePath();
          },

          path(path) {
            SVGPath.apply(this, path);
            return this;
          },

          _windingRule(rule) {
            if (/even-?odd/.test(rule)) {
              return '*';
            }

            return '';
          },

          fill(color, rule) {
            if (/(even-?odd)|(non-?zero)/.test(color)) {
              rule = color;
              color = null;
            }

            if (color) {
              this.fillColor(color);
            }
            return this.addContent(`f${this._windingRule(rule)}`);
          },

          stroke(color) {
            if (color) {
              this.strokeColor(color);
            }
            return this.addContent('S');
          },

          fillAndStroke(fillColor, strokeColor, rule) {
            if (strokeColor == null) {
              strokeColor = fillColor;
            }
            const isFillRule = /(even-?odd)|(non-?zero)/;
            if (isFillRule.test(fillColor)) {
              rule = fillColor;
              fillColor = null;
            }

            if (isFillRule.test(strokeColor)) {
              rule = strokeColor;
              strokeColor = fillColor;
            }

            if (fillColor) {
              this.fillColor(fillColor);
              this.strokeColor(strokeColor);
            }

            return this.addContent(`B${this._windingRule(rule)}`);
          },

          clip(rule) {
            return this.addContent(`W${this._windingRule(rule)} n`);
          },

          transform(m11, m12, m21, m22, dx, dy) {
            // keep track of the current transformation matrix
            const m = this._ctm;
            const [m0, m1, m2, m3, m4, m5] = m;
            m[0] = m0 * m11 + m2 * m12;
            m[1] = m1 * m11 + m3 * m12;
            m[2] = m0 * m21 + m2 * m22;
            m[3] = m1 * m21 + m3 * m22;
            m[4] = m0 * dx + m2 * dy + m4;
            m[5] = m1 * dx + m3 * dy + m5;

            const values = [m11, m12, m21, m22, dx, dy].map(v => number$1(v)).join(' ');
            return this.addContent(`${values} cm`);
          },

          translate(x, y) {
            return this.transform(1, 0, 0, 1, x, y);
          },

          rotate(angle, options = {}) {
            let y;
            const rad = (angle * Math.PI) / 180;
            const cos = Math.cos(rad);
            const sin = Math.sin(rad);
            let x = (y = 0);

            if (options.origin != null) {
              [x, y] = options.origin;
              const x1 = x * cos - y * sin;
              const y1 = x * sin + y * cos;
              x -= x1;
              y -= y1;
            }

            return this.transform(cos, sin, -sin, cos, x, y);
          },

          scale(xFactor, yFactor, options = {}) {
            let y;
            if (yFactor == null) {
              yFactor = xFactor;
            }
            if (typeof yFactor === 'object') {
              options = yFactor;
              yFactor = xFactor;
            }

            let x = (y = 0);
            if (options.origin != null) {
              [x, y] = options.origin;
              x -= xFactor * x;
              y -= yFactor * y;
            }

            return this.transform(xFactor, 0, 0, yFactor, x, y);
          }
        };

        const MARKERS = [
          0xffc0,
          0xffc1,
          0xffc2,
          0xffc3,
          0xffc5,
          0xffc6,
          0xffc7,
          0xffc8,
          0xffc9,
          0xffca,
          0xffcb,
          0xffcc,
          0xffcd,
          0xffce,
          0xffcf
        ];

        const COLOR_SPACE_MAP = {
          1: 'DeviceGray',
          3: 'DeviceRGB',
          4: 'DeviceCMYK'
        };

        class JPEG {
          constructor(data, label) {
            let marker;
            this.data = data;
            this.label = label;
            if (this.data.readUInt16BE(0) !== 0xffd8) {
              throw 'SOI not found in JPEG';
            }

            let pos = 2;
            while (pos < this.data.length) {
              marker = this.data.readUInt16BE(pos);
              pos += 2;
              if (MARKERS.includes(marker)) {
                break;
              }
              pos += this.data.readUInt16BE(pos);
            }

            if (!MARKERS.includes(marker)) {
              throw 'Invalid JPEG.';
            }
            pos += 2;

            this.bits = this.data[pos++];
            this.height = this.data.readUInt16BE(pos);
            pos += 2;

            this.width = this.data.readUInt16BE(pos);
            pos += 2;

            const channels = this.data[pos++];
            this.colorSpace = COLOR_SPACE_MAP[channels];

            this.obj = null;
          }

          embed(document) {
            if (this.obj) {
              return;
            }

            this.obj = document.ref({
              Type: 'XObject',
              Subtype: 'Image',
              BitsPerComponent: this.bits,
              Width: this.width,
              Height: this.height,
              ColorSpace: this.colorSpace,
              Filter: 'DCTDecode'
            });

            // add extra decode params for CMYK images. By swapping the
            // min and max values from the default, we invert the colors. See
            // section 4.8.4 of the spec.
            if (this.colorSpace === 'DeviceCMYK') {
              this.obj.data['Decode'] = [1.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0, 0.0];
            }

            this.obj.end(this.data);

            // free memory
            return (this.data = null);
          }
        }

        var fs$1 = {};

        function assert$1 (a, msg) {
          if (!a) {
            throw new Error(msg);
          }
        }
        var binding$1 = {};
        Object.keys(_binding).forEach(function (key) {
          binding$1[key] = _binding[key];
        });
        // zlib doesn't provide these, so kludge them in following the same
        // const naming scheme zlib uses.
        binding$1.Z_MIN_WINDOWBITS = 8;
        binding$1.Z_MAX_WINDOWBITS = 15;
        binding$1.Z_DEFAULT_WINDOWBITS = 15;

        // fewer than 64 bytes per chunk is stupid.
        // technically it could work with as few as 8, but even 64 bytes
        // is absurdly low.  Usually a MB or more is best.
        binding$1.Z_MIN_CHUNK = 64;
        binding$1.Z_MAX_CHUNK = Infinity;
        binding$1.Z_DEFAULT_CHUNK = (16 * 1024);

        binding$1.Z_MIN_MEMLEVEL = 1;
        binding$1.Z_MAX_MEMLEVEL = 9;
        binding$1.Z_DEFAULT_MEMLEVEL = 8;

        binding$1.Z_MIN_LEVEL = -1;
        binding$1.Z_MAX_LEVEL = 9;
        binding$1.Z_DEFAULT_LEVEL = binding$1.Z_DEFAULT_COMPRESSION;


        // translation table for return codes.
        var codes$1 = {
          Z_OK: binding$1.Z_OK,
          Z_STREAM_END: binding$1.Z_STREAM_END,
          Z_NEED_DICT: binding$1.Z_NEED_DICT,
          Z_ERRNO: binding$1.Z_ERRNO,
          Z_STREAM_ERROR: binding$1.Z_STREAM_ERROR,
          Z_DATA_ERROR: binding$1.Z_DATA_ERROR,
          Z_MEM_ERROR: binding$1.Z_MEM_ERROR,
          Z_BUF_ERROR: binding$1.Z_BUF_ERROR,
          Z_VERSION_ERROR: binding$1.Z_VERSION_ERROR
        };

        Object.keys(codes$1).forEach(function(k) {
          codes$1[codes$1[k]] = k;
        });

        function createDeflate$1(o) {
          return new Deflate$1(o);
        }

        function createInflate$1(o) {
          return new Inflate$1(o);
        }

        function createDeflateRaw$1(o) {
          return new DeflateRaw$1(o);
        }

        function createInflateRaw$1(o) {
          return new InflateRaw$1(o);
        }

        function createGzip$1(o) {
          return new Gzip$1(o);
        }

        function createGunzip$1(o) {
          return new Gunzip$1(o);
        }

        function createUnzip$1(o) {
          return new Unzip$1(o);
        }


        // Convenience methods.
        // compress/decompress a string or buffer in one step.
        function deflate$2(buffer, opts, callback) {
          if (typeof opts === 'function') {
            callback = opts;
            opts = {};
          }
          return zlibBuffer$1(new Deflate$1(opts), buffer, callback);
        }

        function deflateSync$1(buffer, opts) {
          return zlibBufferSync$1(new Deflate$1(opts), buffer);
        }

        function gzip$1(buffer, opts, callback) {
          if (typeof opts === 'function') {
            callback = opts;
            opts = {};
          }
          return zlibBuffer$1(new Gzip$1(opts), buffer, callback);
        }

        function gzipSync$1(buffer, opts) {
          return zlibBufferSync$1(new Gzip$1(opts), buffer);
        }

        function deflateRaw$1(buffer, opts, callback) {
          if (typeof opts === 'function') {
            callback = opts;
            opts = {};
          }
          return zlibBuffer$1(new DeflateRaw$1(opts), buffer, callback);
        }

        function deflateRawSync$1(buffer, opts) {
          return zlibBufferSync$1(new DeflateRaw$1(opts), buffer);
        }

        function unzip$1(buffer, opts, callback) {
          if (typeof opts === 'function') {
            callback = opts;
            opts = {};
          }
          return zlibBuffer$1(new Unzip$1(opts), buffer, callback);
        }

        function unzipSync$1(buffer, opts) {
          return zlibBufferSync$1(new Unzip$1(opts), buffer);
        }

        function inflate$2(buffer, opts, callback) {
          if (typeof opts === 'function') {
            callback = opts;
            opts = {};
          }
          return zlibBuffer$1(new Inflate$1(opts), buffer, callback);
        }

        function inflateSync$1(buffer, opts) {
          return zlibBufferSync$1(new Inflate$1(opts), buffer);
        }

        function gunzip$1(buffer, opts, callback) {
          if (typeof opts === 'function') {
            callback = opts;
            opts = {};
          }
          return zlibBuffer$1(new Gunzip$1(opts), buffer, callback);
        }

        function gunzipSync$1(buffer, opts) {
          return zlibBufferSync$1(new Gunzip$1(opts), buffer);
        }

        function inflateRaw$1(buffer, opts, callback) {
          if (typeof opts === 'function') {
            callback = opts;
            opts = {};
          }
          return zlibBuffer$1(new InflateRaw$1(opts), buffer, callback);
        }

        function inflateRawSync$1(buffer, opts) {
          return zlibBufferSync$1(new InflateRaw$1(opts), buffer);
        }

        function zlibBuffer$1(engine, buffer, callback) {
          var buffers = [];
          var nread = 0;

          engine.on('error', onError);
          engine.on('end', onEnd);

          engine.end(buffer);
          flow();

          function flow() {
            var chunk;
            while (null !== (chunk = engine.read())) {
              buffers.push(chunk);
              nread += chunk.length;
            }
            engine.once('readable', flow);
          }

          function onError(err) {
            engine.removeListener('end', onEnd);
            engine.removeListener('readable', flow);
            callback(err);
          }

          function onEnd() {
            var buf = Buffer.concat(buffers, nread);
            buffers = [];
            callback(null, buf);
            engine.close();
          }
        }

        function zlibBufferSync$1(engine, buffer) {
          if (typeof buffer === 'string')
            buffer = new Buffer(buffer);
          if (!isBuffer(buffer))
            throw new TypeError('Not a string or buffer');

          var flushFlag = binding$1.Z_FINISH;

          return engine._processChunk(buffer, flushFlag);
        }

        // generic zlib
        // minimal 2-byte header
        function Deflate$1(opts) {
          if (!(this instanceof Deflate$1)) return new Deflate$1(opts);
          Zlib$2.call(this, opts, binding$1.DEFLATE);
        }

        function Inflate$1(opts) {
          if (!(this instanceof Inflate$1)) return new Inflate$1(opts);
          Zlib$2.call(this, opts, binding$1.INFLATE);
        }



        // gzip - bigger header, same deflate compression
        function Gzip$1(opts) {
          if (!(this instanceof Gzip$1)) return new Gzip$1(opts);
          Zlib$2.call(this, opts, binding$1.GZIP);
        }

        function Gunzip$1(opts) {
          if (!(this instanceof Gunzip$1)) return new Gunzip$1(opts);
          Zlib$2.call(this, opts, binding$1.GUNZIP);
        }



        // raw - no header
        function DeflateRaw$1(opts) {
          if (!(this instanceof DeflateRaw$1)) return new DeflateRaw$1(opts);
          Zlib$2.call(this, opts, binding$1.DEFLATERAW);
        }

        function InflateRaw$1(opts) {
          if (!(this instanceof InflateRaw$1)) return new InflateRaw$1(opts);
          Zlib$2.call(this, opts, binding$1.INFLATERAW);
        }


        // auto-detect header.
        function Unzip$1(opts) {
          if (!(this instanceof Unzip$1)) return new Unzip$1(opts);
          Zlib$2.call(this, opts, binding$1.UNZIP);
        }


        // the Zlib class they all inherit from
        // This thing manages the queue of requests, and returns
        // true or false if there is anything in the queue when
        // you call the .write() method.

        function Zlib$2(opts, mode) {
          this._opts = opts = opts || {};
          this._chunkSize = opts.chunkSize || binding$1.Z_DEFAULT_CHUNK;

          Transform.call(this, opts);

          if (opts.flush) {
            if (opts.flush !== binding$1.Z_NO_FLUSH &&
                opts.flush !== binding$1.Z_PARTIAL_FLUSH &&
                opts.flush !== binding$1.Z_SYNC_FLUSH &&
                opts.flush !== binding$1.Z_FULL_FLUSH &&
                opts.flush !== binding$1.Z_FINISH &&
                opts.flush !== binding$1.Z_BLOCK) {
              throw new Error('Invalid flush flag: ' + opts.flush);
            }
          }
          this._flushFlag = opts.flush || binding$1.Z_NO_FLUSH;

          if (opts.chunkSize) {
            if (opts.chunkSize < binding$1.Z_MIN_CHUNK ||
                opts.chunkSize > binding$1.Z_MAX_CHUNK) {
              throw new Error('Invalid chunk size: ' + opts.chunkSize);
            }
          }

          if (opts.windowBits) {
            if (opts.windowBits < binding$1.Z_MIN_WINDOWBITS ||
                opts.windowBits > binding$1.Z_MAX_WINDOWBITS) {
              throw new Error('Invalid windowBits: ' + opts.windowBits);
            }
          }

          if (opts.level) {
            if (opts.level < binding$1.Z_MIN_LEVEL ||
                opts.level > binding$1.Z_MAX_LEVEL) {
              throw new Error('Invalid compression level: ' + opts.level);
            }
          }

          if (opts.memLevel) {
            if (opts.memLevel < binding$1.Z_MIN_MEMLEVEL ||
                opts.memLevel > binding$1.Z_MAX_MEMLEVEL) {
              throw new Error('Invalid memLevel: ' + opts.memLevel);
            }
          }

          if (opts.strategy) {
            if (opts.strategy != binding$1.Z_FILTERED &&
                opts.strategy != binding$1.Z_HUFFMAN_ONLY &&
                opts.strategy != binding$1.Z_RLE &&
                opts.strategy != binding$1.Z_FIXED &&
                opts.strategy != binding$1.Z_DEFAULT_STRATEGY) {
              throw new Error('Invalid strategy: ' + opts.strategy);
            }
          }

          if (opts.dictionary) {
            if (!isBuffer(opts.dictionary)) {
              throw new Error('Invalid dictionary: it should be a Buffer instance');
            }
          }

          this._binding = new binding$1.Zlib(mode);

          var self = this;
          this._hadError = false;
          this._binding.onerror = function(message, errno) {
            // there is no way to cleanly recover.
            // continuing only obscures problems.
            self._binding = null;
            self._hadError = true;

            var error = new Error(message);
            error.errno = errno;
            error.code = binding$1.codes[errno];
            self.emit('error', error);
          };

          var level = binding$1.Z_DEFAULT_COMPRESSION;
          if (typeof opts.level === 'number') level = opts.level;

          var strategy = binding$1.Z_DEFAULT_STRATEGY;
          if (typeof opts.strategy === 'number') strategy = opts.strategy;

          this._binding.init(opts.windowBits || binding$1.Z_DEFAULT_WINDOWBITS,
                             level,
                             opts.memLevel || binding$1.Z_DEFAULT_MEMLEVEL,
                             strategy,
                             opts.dictionary);

          this._buffer = new Buffer(this._chunkSize);
          this._offset = 0;
          this._closed = false;
          this._level = level;
          this._strategy = strategy;

          this.once('end', this.close);
        }

        inherits$1(Zlib$2, Transform);

        Zlib$2.prototype.params = function(level, strategy, callback) {
          if (level < binding$1.Z_MIN_LEVEL ||
              level > binding$1.Z_MAX_LEVEL) {
            throw new RangeError('Invalid compression level: ' + level);
          }
          if (strategy != binding$1.Z_FILTERED &&
              strategy != binding$1.Z_HUFFMAN_ONLY &&
              strategy != binding$1.Z_RLE &&
              strategy != binding$1.Z_FIXED &&
              strategy != binding$1.Z_DEFAULT_STRATEGY) {
            throw new TypeError('Invalid strategy: ' + strategy);
          }

          if (this._level !== level || this._strategy !== strategy) {
            var self = this;
            this.flush(binding$1.Z_SYNC_FLUSH, function() {
              self._binding.params(level, strategy);
              if (!self._hadError) {
                self._level = level;
                self._strategy = strategy;
                if (callback) callback();
              }
            });
          } else {
            nextTick$1(callback);
          }
        };

        Zlib$2.prototype.reset = function() {
          return this._binding.reset();
        };

        // This is the _flush function called by the transform class,
        // internally, when the last chunk has been written.
        Zlib$2.prototype._flush = function(callback) {
          this._transform(new Buffer(0), '', callback);
        };

        Zlib$2.prototype.flush = function(kind, callback) {
          var ws = this._writableState;

          if (typeof kind === 'function' || (kind === void 0 && !callback)) {
            callback = kind;
            kind = binding$1.Z_FULL_FLUSH;
          }

          if (ws.ended) {
            if (callback)
              nextTick$1(callback);
          } else if (ws.ending) {
            if (callback)
              this.once('end', callback);
          } else if (ws.needDrain) {
            var self = this;
            this.once('drain', function() {
              self.flush(callback);
            });
          } else {
            this._flushFlag = kind;
            this.write(new Buffer(0), '', callback);
          }
        };

        Zlib$2.prototype.close = function(callback) {
          if (callback)
            nextTick$1(callback);

          if (this._closed)
            return;

          this._closed = true;

          this._binding.close();

          var self = this;
          nextTick$1(function() {
            self.emit('close');
          });
        };

        Zlib$2.prototype._transform = function(chunk, encoding, cb) {
          var flushFlag;
          var ws = this._writableState;
          var ending = ws.ending || ws.ended;
          var last = ending && (!chunk || ws.length === chunk.length);

          if (!chunk === null && !isBuffer(chunk))
            return cb(new Error('invalid input'));

          // If it's the last chunk, or a final flush, we use the Z_FINISH flush flag.
          // If it's explicitly flushing at some other time, then we use
          // Z_FULL_FLUSH. Otherwise, use Z_NO_FLUSH for maximum compression
          // goodness.
          if (last)
            flushFlag = binding$1.Z_FINISH;
          else {
            flushFlag = this._flushFlag;
            // once we've flushed the last of the queue, stop flushing and
            // go back to the normal behavior.
            if (chunk.length >= ws.length) {
              this._flushFlag = this._opts.flush || binding$1.Z_NO_FLUSH;
            }
          }

          this._processChunk(chunk, flushFlag, cb);
        };

        Zlib$2.prototype._processChunk = function(chunk, flushFlag, cb) {
          var availInBefore = chunk && chunk.length;
          var availOutBefore = this._chunkSize - this._offset;
          var inOff = 0;

          var self = this;

          var async = typeof cb === 'function';

          if (!async) {
            var buffers = [];
            var nread = 0;

            var error;
            this.on('error', function(er) {
              error = er;
            });

            do {
              var res = this._binding.writeSync(flushFlag,
                                                chunk, // in
                                                inOff, // in_off
                                                availInBefore, // in_len
                                                this._buffer, // out
                                                this._offset, //out_off
                                                availOutBefore); // out_len
            } while (!this._hadError && callback(res[0], res[1]));

            if (this._hadError) {
              throw error;
            }

            var buf = Buffer.concat(buffers, nread);
            this.close();

            return buf;
          }

          var req = this._binding.write(flushFlag,
                                        chunk, // in
                                        inOff, // in_off
                                        availInBefore, // in_len
                                        this._buffer, // out
                                        this._offset, //out_off
                                        availOutBefore); // out_len

          req.buffer = chunk;
          req.callback = callback;

          function callback(availInAfter, availOutAfter) {
            if (self._hadError)
              return;

            var have = availOutBefore - availOutAfter;
            assert$1(have >= 0, 'have should not go down');

            if (have > 0) {
              var out = self._buffer.slice(self._offset, self._offset + have);
              self._offset += have;
              // serve some output to the consumer.
              if (async) {
                self.push(out);
              } else {
                buffers.push(out);
                nread += out.length;
              }
            }

            // exhausted the output buffer, or used all the input create a new one.
            if (availOutAfter === 0 || self._offset >= self._chunkSize) {
              availOutBefore = self._chunkSize;
              self._offset = 0;
              self._buffer = new Buffer(self._chunkSize);
            }

            if (availOutAfter === 0) {
              // Not actually done.  Need to reprocess.
              // Also, update the availInBefore to the availInAfter value,
              // so that if we have to hit it a third (fourth, etc.) time,
              // it'll have the correct byte counts.
              inOff += (availInBefore - availInAfter);
              availInBefore = availInAfter;

              if (!async)
                return true;

              var newReq = self._binding.write(flushFlag,
                                               chunk,
                                               inOff,
                                               availInBefore,
                                               self._buffer,
                                               self._offset,
                                               self._chunkSize);
              newReq.callback = callback; // this same function
              newReq.buffer = chunk;
              return;
            }

            if (!async)
              return false;

            // finished with the chunk.
            cb();
          }
        };

        inherits$1(Deflate$1, Zlib$2);
        inherits$1(Inflate$1, Zlib$2);
        inherits$1(Gzip$1, Zlib$2);
        inherits$1(Gunzip$1, Zlib$2);
        inherits$1(DeflateRaw$1, Zlib$2);
        inherits$1(InflateRaw$1, Zlib$2);
        inherits$1(Unzip$1, Zlib$2);
        var zlib$1 = {
          codes: codes$1,
          createDeflate: createDeflate$1,
          createInflate: createInflate$1,
          createDeflateRaw: createDeflateRaw$1,
          createInflateRaw: createInflateRaw$1,
          createGzip: createGzip$1,
          createGunzip: createGunzip$1,
          createUnzip: createUnzip$1,
          deflate: deflate$2,
          deflateSync: deflateSync$1,
          gzip: gzip$1,
          gzipSync: gzipSync$1,
          deflateRaw: deflateRaw$1,
          deflateRawSync: deflateRawSync$1,
          unzip: unzip$1,
          unzipSync: unzipSync$1,
          inflate: inflate$2,
          inflateSync: inflateSync$1,
          gunzip: gunzip$1,
          gunzipSync: gunzipSync$1,
          inflateRaw: inflateRaw$1,
          inflateRawSync: inflateRawSync$1,
          Deflate: Deflate$1,
          Inflate: Inflate$1,
          Gzip: Gzip$1,
          Gunzip: Gunzip$1,
          DeflateRaw: DeflateRaw$1,
          InflateRaw: InflateRaw$1,
          Unzip: Unzip$1,
          Zlib: Zlib$2
        };

        /*
         * MIT LICENSE
         * Copyright (c) 2011 Devon Govett
         *
         * Permission is hereby granted, free of charge, to any person obtaining a copy of this
         * software and associated documentation files (the "Software"), to deal in the Software
         * without restriction, including without limitation the rights to use, copy, modify, merge,
         * publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons
         * to whom the Software is furnished to do so, subject to the following conditions:
         *
         * The above copyright notice and this permission notice shall be included in all copies or
         * substantial portions of the Software.
         *
         * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING
         * BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
         * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
         * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
         * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
         */




        var pngNode = class PNG {
          static decode(path, fn) {
            return fs$1.readFile(path, function(err, file) {
              const png = new PNG(file);
              return png.decode(pixels => fn(pixels));
            });
          }

          static load(path) {
            const file = fs$1.readFileSync(path);
            return new PNG(file);
          }

          constructor(data) {
            let i;
            this.data = data;
            this.pos = 8; // Skip the default header

            this.palette = [];
            this.imgData = [];
            this.transparency = {};
            this.text = {};

            while (true) {
              const chunkSize = this.readUInt32();
              let section = '';
              for (i = 0; i < 4; i++) {
                section += String.fromCharCode(this.data[this.pos++]);
              }

              switch (section) {
                case 'IHDR':
                  // we can grab  interesting values from here (like width, height, etc)
                  this.width = this.readUInt32();
                  this.height = this.readUInt32();
                  this.bits = this.data[this.pos++];
                  this.colorType = this.data[this.pos++];
                  this.compressionMethod = this.data[this.pos++];
                  this.filterMethod = this.data[this.pos++];
                  this.interlaceMethod = this.data[this.pos++];
                  break;

                case 'PLTE':
                  this.palette = this.read(chunkSize);
                  break;

                case 'IDAT':
                  for (i = 0; i < chunkSize; i++) {
                    this.imgData.push(this.data[this.pos++]);
                  }
                  break;

                case 'tRNS':
                  // This chunk can only occur once and it must occur after the
                  // PLTE chunk and before the IDAT chunk.
                  this.transparency = {};
                  switch (this.colorType) {
                    case 3:
                      // Indexed color, RGB. Each byte in this chunk is an alpha for
                      // the palette index in the PLTE ("palette") chunk up until the
                      // last non-opaque entry. Set up an array, stretching over all
                      // palette entries which will be 0 (opaque) or 1 (transparent).
                      this.transparency.indexed = this.read(chunkSize);
                      var short = 255 - this.transparency.indexed.length;
                      if (short > 0) {
                        for (i = 0; i < short; i++) {
                          this.transparency.indexed.push(255);
                        }
                      }
                      break;
                    case 0:
                      // Greyscale. Corresponding to entries in the PLTE chunk.
                      // Grey is two bytes, range 0 .. (2 ^ bit-depth) - 1
                      this.transparency.grayscale = this.read(chunkSize)[0];
                      break;
                    case 2:
                      // True color with proper alpha channel.
                      this.transparency.rgb = this.read(chunkSize);
                      break;
                  }
                  break;

                case 'tEXt':
                  var text = this.read(chunkSize);
                  var index = text.indexOf(0);
                  var key = String.fromCharCode.apply(String, text.slice(0, index));
                  this.text[key] = String.fromCharCode.apply(
                    String,
                    text.slice(index + 1)
                  );
                  break;

                case 'IEND':
                  // we've got everything we need!
                  switch (this.colorType) {
                    case 0:
                    case 3:
                    case 4:
                      this.colors = 1;
                      break;
                    case 2:
                    case 6:
                      this.colors = 3;
                      break;
                  }

                  this.hasAlphaChannel = [4, 6].includes(this.colorType);
                  var colors = this.colors + (this.hasAlphaChannel ? 1 : 0);
                  this.pixelBitlength = this.bits * colors;

                  switch (this.colors) {
                    case 1:
                      this.colorSpace = 'DeviceGray';
                      break;
                    case 3:
                      this.colorSpace = 'DeviceRGB';
                      break;
                  }

                  this.imgData = new Buffer(this.imgData);
                  return;

                default:
                  // unknown (or unimportant) section, skip it
                  this.pos += chunkSize;
              }

              this.pos += 4; // Skip the CRC

              if (this.pos > this.data.length) {
                throw new Error('Incomplete or corrupt PNG file');
              }
            }
          }

          read(bytes) {
            const result = new Array(bytes);
            for (let i = 0; i < bytes; i++) {
              result[i] = this.data[this.pos++];
            }
            return result;
          }

          readUInt32() {
            const b1 = this.data[this.pos++] << 24;
            const b2 = this.data[this.pos++] << 16;
            const b3 = this.data[this.pos++] << 8;
            const b4 = this.data[this.pos++];
            return b1 | b2 | b3 | b4;
          }

          readUInt16() {
            const b1 = this.data[this.pos++] << 8;
            const b2 = this.data[this.pos++];
            return b1 | b2;
          }

          decodePixels(fn) {
            return zlib$1.inflate(this.imgData, (err, data) => {
              if (err) {
                throw err;
              }

              const { width, height } = this;
              const pixelBytes = this.pixelBitlength / 8;

              const pixels = new Buffer(width * height * pixelBytes);
              const { length } = data;
              let pos = 0;

              function pass(x0, y0, dx, dy, singlePass = false) {
                const w = Math.ceil((width - x0) / dx);
                const h = Math.ceil((height - y0) / dy);
                const scanlineLength = pixelBytes * w;
                const buffer = singlePass ? pixels : new Buffer(scanlineLength * h);
                let row = 0;
                let c = 0;
                while (row < h && pos < length) {
                  var byte, col, i, left, upper;
                  switch (data[pos++]) {
                    case 0: // None
                      for (i = 0; i < scanlineLength; i++) {
                        buffer[c++] = data[pos++];
                      }
                      break;

                    case 1: // Sub
                      for (i = 0; i < scanlineLength; i++) {
                        byte = data[pos++];
                        left = i < pixelBytes ? 0 : buffer[c - pixelBytes];
                        buffer[c++] = (byte + left) % 256;
                      }
                      break;

                    case 2: // Up
                      for (i = 0; i < scanlineLength; i++) {
                        byte = data[pos++];
                        col = (i - (i % pixelBytes)) / pixelBytes;
                        upper =
                          row &&
                          buffer[
                            (row - 1) * scanlineLength +
                              col * pixelBytes +
                              (i % pixelBytes)
                          ];
                        buffer[c++] = (upper + byte) % 256;
                      }
                      break;

                    case 3: // Average
                      for (i = 0; i < scanlineLength; i++) {
                        byte = data[pos++];
                        col = (i - (i % pixelBytes)) / pixelBytes;
                        left = i < pixelBytes ? 0 : buffer[c - pixelBytes];
                        upper =
                          row &&
                          buffer[
                            (row - 1) * scanlineLength +
                              col * pixelBytes +
                              (i % pixelBytes)
                          ];
                        buffer[c++] = (byte + Math.floor((left + upper) / 2)) % 256;
                      }
                      break;

                    case 4: // Paeth
                      for (i = 0; i < scanlineLength; i++) {
                        var paeth, upperLeft;
                        byte = data[pos++];
                        col = (i - (i % pixelBytes)) / pixelBytes;
                        left = i < pixelBytes ? 0 : buffer[c - pixelBytes];

                        if (row === 0) {
                          upper = upperLeft = 0;
                        } else {
                          upper =
                            buffer[
                              (row - 1) * scanlineLength +
                                col * pixelBytes +
                                (i % pixelBytes)
                            ];
                          upperLeft =
                            col &&
                            buffer[
                              (row - 1) * scanlineLength +
                                (col - 1) * pixelBytes +
                                (i % pixelBytes)
                            ];
                        }

                        const p = left + upper - upperLeft;
                        const pa = Math.abs(p - left);
                        const pb = Math.abs(p - upper);
                        const pc = Math.abs(p - upperLeft);

                        if (pa <= pb && pa <= pc) {
                          paeth = left;
                        } else if (pb <= pc) {
                          paeth = upper;
                        } else {
                          paeth = upperLeft;
                        }

                        buffer[c++] = (byte + paeth) % 256;
                      }
                      break;

                    default:
                      throw new Error(`Invalid filter algorithm: ${data[pos - 1]}`);
                  }

                  if (!singlePass) {
                    let pixelsPos = ((y0 + row * dy) * width + x0) * pixelBytes;
                    let bufferPos = row * scanlineLength;
                    for (i = 0; i < w; i++) {
                      for (let j = 0; j < pixelBytes; j++)
                        pixels[pixelsPos++] = buffer[bufferPos++];
                      pixelsPos += (dx - 1) * pixelBytes;
                    }
                  }

                  row++;
                }
              }

              if (this.interlaceMethod === 1) {
                /*
                  1 6 4 6 2 6 4 6
                  7 7 7 7 7 7 7 7
                  5 6 5 6 5 6 5 6
                  7 7 7 7 7 7 7 7
                  3 6 4 6 3 6 4 6
                  7 7 7 7 7 7 7 7
                  5 6 5 6 5 6 5 6
                  7 7 7 7 7 7 7 7
                */
                pass(0, 0, 8, 8); // 1
                pass(4, 0, 8, 8); // 2
                pass(0, 4, 4, 8); // 3
                pass(2, 0, 4, 4); // 4
                pass(0, 2, 2, 4); // 5
                pass(1, 0, 2, 2); // 6
                pass(0, 1, 1, 2); // 7
              } else {
                pass(0, 0, 1, 1, true);
              }

              return fn(pixels);
            });
          }

          decodePalette() {
            const { palette } = this;
            const { length } = palette;
            const transparency = this.transparency.indexed || [];
            const ret = new Buffer(transparency.length + length);
            let pos = 0;
            let c = 0;

            for (let i = 0; i < length; i += 3) {
              var left;
              ret[pos++] = palette[i];
              ret[pos++] = palette[i + 1];
              ret[pos++] = palette[i + 2];
              ret[pos++] = (left = transparency[c++]) != null ? left : 255;
            }

            return ret;
          }

          copyToImageData(imageData, pixels) {
            let j, k;
            let { colors } = this;
            let palette = null;
            let alpha = this.hasAlphaChannel;

            if (this.palette.length) {
              palette =
                this._decodedPalette || (this._decodedPalette = this.decodePalette());
              colors = 4;
              alpha = true;
            }

            const data = imageData.data || imageData;
            const { length } = data;
            const input = palette || pixels;
            let i = (j = 0);

            if (colors === 1) {
              while (i < length) {
                k = palette ? pixels[i / 4] * 4 : j;
                const v = input[k++];
                data[i++] = v;
                data[i++] = v;
                data[i++] = v;
                data[i++] = alpha ? input[k++] : 255;
                j = k;
              }
            } else {
              while (i < length) {
                k = palette ? pixels[i / 4] * 4 : j;
                data[i++] = input[k++];
                data[i++] = input[k++];
                data[i++] = input[k++];
                data[i++] = alpha ? input[k++] : 255;
                j = k;
              }
            }
          }

          decode(fn) {
            const ret = new Buffer(this.width * this.height * 4);
            return this.decodePixels(pixels => {
              this.copyToImageData(ret, pixels);
              return fn(ret);
            });
          }
        };

        class PNGImage {
          constructor(data, label) {
            this.label = label;
            this.image = new pngNode(data);
            this.width = this.image.width;
            this.height = this.image.height;
            this.imgData = this.image.imgData;
            this.obj = null;
          }

          embed(document) {
            let dataDecoded = false;

            this.document = document;
            if (this.obj) {
              return;
            }

            const hasAlphaChannel = this.image.hasAlphaChannel;
            const isInterlaced = this.image.interlaceMethod === 1;

            this.obj = this.document.ref({
              Type: 'XObject',
              Subtype: 'Image',
              BitsPerComponent: hasAlphaChannel ? 8 : this.image.bits,
              Width: this.width,
              Height: this.height,
              Filter: 'FlateDecode'
            });

            if (!hasAlphaChannel) {
              const params = this.document.ref({
                Predictor: isInterlaced ? 1 : 15,
                Colors: this.image.colors,
                BitsPerComponent: this.image.bits,
                Columns: this.width
              });

              this.obj.data['DecodeParms'] = params;
              params.end();
            }

            if (this.image.palette.length === 0) {
              this.obj.data['ColorSpace'] = this.image.colorSpace;
            } else {
              // embed the color palette in the PDF as an object stream
              const palette = this.document.ref();
              palette.end(new Buffer(this.image.palette));

              // build the color space array for the image
              this.obj.data['ColorSpace'] = [
                'Indexed',
                'DeviceRGB',
                this.image.palette.length / 3 - 1,
                palette
              ];
            }

            // For PNG color types 0, 2 and 3, the transparency data is stored in
            // a dedicated PNG chunk.
            if (this.image.transparency.grayscale != null) {
              // Use Color Key Masking (spec section 4.8.5)
              // An array with N elements, where N is two times the number of color components.
              const val = this.image.transparency.grayscale;
              this.obj.data['Mask'] = [val, val];
            } else if (this.image.transparency.rgb) {
              // Use Color Key Masking (spec section 4.8.5)
              // An array with N elements, where N is two times the number of color components.
              const { rgb } = this.image.transparency;
              const mask = [];
              for (let x of rgb) {
                mask.push(x, x);
              }

              this.obj.data['Mask'] = mask;
            } else if (this.image.transparency.indexed) {
              // Create a transparency SMask for the image based on the data
              // in the PLTE and tRNS sections. See below for details on SMasks.
              dataDecoded = true;
              return this.loadIndexedAlphaChannel();
            } else if (hasAlphaChannel) {
              // For PNG color types 4 and 6, the transparency data is stored as a alpha
              // channel mixed in with the main image data. Separate this data out into an
              // SMask object and store it separately in the PDF.
              dataDecoded = true;
              return this.splitAlphaChannel();
            }

            if (isInterlaced && !dataDecoded) {
              return this.decodeData();
            }

            this.finalize();
          }

          finalize() {
            if (this.alphaChannel) {
              const sMask = this.document.ref({
                Type: 'XObject',
                Subtype: 'Image',
                Height: this.height,
                Width: this.width,
                BitsPerComponent: 8,
                Filter: 'FlateDecode',
                ColorSpace: 'DeviceGray',
                Decode: [0, 1]
              });

              sMask.end(this.alphaChannel);
              this.obj.data['SMask'] = sMask;
            }

            // add the actual image data
            this.obj.end(this.imgData);

            // free memory
            this.image = null;
            return (this.imgData = null);
          }

          splitAlphaChannel() {
            return this.image.decodePixels(pixels => {
              let a, p;
              const colorCount = this.image.colors;
              const pixelCount = this.width * this.height;
              const imgData = new Buffer(pixelCount * colorCount);
              const alphaChannel = new Buffer(pixelCount);

              let i = (p = a = 0);
              const len = pixels.length;
              // For 16bit images copy only most significant byte (MSB) - PNG data is always stored in network byte order (MSB first)
              const skipByteCount = this.image.bits === 16 ? 1 : 0;
              while (i < len) {
                for (let colorIndex = 0; colorIndex < colorCount; colorIndex++) {
                  imgData[p++] = pixels[i++];
                  i += skipByteCount;
                }
                alphaChannel[a++] = pixels[i++];
                i += skipByteCount;
              }

              this.imgData = zlib.deflateSync(imgData);
              this.alphaChannel = zlib.deflateSync(alphaChannel);
              return this.finalize();
            });
          }

          loadIndexedAlphaChannel() {
            const transparency = this.image.transparency.indexed;
            return this.image.decodePixels(pixels => {
              const alphaChannel = new Buffer(this.width * this.height);

              let i = 0;
              for (let j = 0, end = pixels.length; j < end; j++) {
                alphaChannel[i++] = transparency[pixels[j]];
              }

              this.alphaChannel = zlib.deflateSync(alphaChannel);
              return this.finalize();
            });
          }

          decodeData() {
            this.image.decodePixels(pixels => {
              this.imgData = zlib.deflateSync(pixels);
              this.finalize();
            });
          }
        }

        class PDFImage {
          static open(src, label) {
            let data;
            if (isBuffer(src)) {
              data = src;
            } else if (src instanceof ArrayBuffer) {
              data = new Buffer(new Uint8Array(src));
            } else {
              let match;
              if ((match = /^data:.+;base64,(.*)$/.exec(src))) {
                data = new Buffer(match[1], 'base64');
              } else {
                data = fs.readFileSync(src);
                if (!data) {
                  return;
                }
              }
            }

            if (data[0] === 0xff && data[1] === 0xd8) {
              return new JPEG(data, label);
            } else if (data[0] === 0x89 && data.toString('ascii', 1, 4) === 'PNG') {
              return new PNGImage(data, label);
            } else {
              throw new Error('Unknown image format.');
            }
          }
        }

        var ImagesMixin = {
          initImages() {
            this._imageRegistry = {};
            return (this._imageCount = 0);
          },

          image(src, x, y, options = {}) {
            let bh, bp, bw, image, ip, left, left1;
            if (typeof x === 'object') {
              options = x;
              x = null;
            }

            x = (left = x != null ? x : options.x) != null ? left : this.x;
            y = (left1 = y != null ? y : options.y) != null ? left1 : this.y;

            if (typeof src === 'string') {
              image = this._imageRegistry[src];
            }

            if (!image) {
              if (src.width && src.height) {
                image = src;
              } else {
                image = this.openImage(src);
              }
            }

            if (!image.obj) {
              image.embed(this);
            }

            if (this.page.xobjects[image.label] == null) {
              this.page.xobjects[image.label] = image.obj;
            }

            let w = options.width || image.width;
            let h = options.height || image.height;

            if (options.width && !options.height) {
              const wp = w / image.width;
              w = image.width * wp;
              h = image.height * wp;
            } else if (options.height && !options.width) {
              const hp = h / image.height;
              w = image.width * hp;
              h = image.height * hp;
            } else if (options.scale) {
              w = image.width * options.scale;
              h = image.height * options.scale;
            } else if (options.fit) {
              [bw, bh] = options.fit;
              bp = bw / bh;
              ip = image.width / image.height;
              if (ip > bp) {
                w = bw;
                h = bw / ip;
              } else {
                h = bh;
                w = bh * ip;
              }
            } else if (options.cover) {
              [bw, bh] = options.cover;
              bp = bw / bh;
              ip = image.width / image.height;
              if (ip > bp) {
                h = bh;
                w = bh * ip;
              } else {
                w = bw;
                h = bw / ip;
              }
            }

            if (options.fit || options.cover) {
              if (options.align === 'center') {
                x = x + bw / 2 - w / 2;
              } else if (options.align === 'right') {
                x = x + bw - w;
              }

              if (options.valign === 'center') {
                y = y + bh / 2 - h / 2;
              } else if (options.valign === 'bottom') {
                y = y + bh - h;
              }
            }

            // create link annotations if the link option is given
            if (options.link != null) {
              this.link(x, y, w, h, options.link);
            }
            if (options.goTo != null) {
              this.goTo(x, y, w, h, options.goTo);
            }
            if (options.destination != null) {
              this.addNamedDestination(options.destination, 'XYZ', x, y, null);
            }

            // Set the current y position to below the image if it is in the document flow
            if (this.y === y) {
              this.y += h;
            }

            this.save();
            this.transform(w, 0, 0, -h, x, y + h);
            this.addContent(`/${image.label} Do`);
            this.restore();

            return this;
          },

          openImage(src) {
            let image;
            if (typeof src === 'string') {
              image = this._imageRegistry[src];
            }

            if (!image) {
              image = PDFImage.open(src, `I${++this._imageCount}`);
              if (typeof src === 'string') {
                this._imageRegistry[src] = image;
              }
            }

            return image;
          }
        };

        const bufferSize = 9007199254740991;

        var OutputDocument = {

        	getStream() {
        		return this;
        	},

        	/**
        	 * @returns {Promise}
        	 */
        	getBuffer() {
        		return new Promise((resolve, reject) => {
        			try {
        				let chunks = [];
        				let result;
        				this.getStream().on('readable', () => {
        					let chunk;
        					while ((chunk = this.getStream().read(bufferSize)) !== null) {
        						chunks.push(chunk);
        					}
        				});
        				this.getStream().on('end', () => {
        					result = Buffer.concat(chunks);
        					resolve(result);
        				});
        				this.getStream().end();
        			} catch (e) {
        				reject(e);
        			}
        		});
        	},

        	/**
        	 * @returns {Promise}
        	 */
        	getBase64() {
        		return new Promise((resolve, reject) => {
        			this.getBuffer().then(buffer => {
        				resolve(buffer.toString('base64'));
        			}, result => {
        				reject(result);
        			});
        		});
        	},

        	/**
        	 * @returns {Promise}
        	 */
        	getDataUrl() {
        		return new Promise((resolve, reject) => {
        			this.getBase64().then(data => {
        				resolve('data:application/pdf;base64,' + data);
        			}, result => {
        				reject(result);
        			});
        		});
        	},

        };

        var FileSaver = createCommonjsModule(function (module, exports) {
        (function (global, factory) {
          {
            factory();
          }
        })(commonjsGlobal, function () {

          /*
          * FileSaver.js
          * A saveAs() FileSaver implementation.
          *
          * By Eli Grey, http://eligrey.com
          *
          * License : https://github.com/eligrey/FileSaver.js/blob/master/LICENSE.md (MIT)
          * source  : http://purl.eligrey.com/github/FileSaver.js
          */
          // The one and only way of getting global scope in all environments
          // https://stackoverflow.com/q/3277182/1008999
          var _global = typeof window === 'object' && window.window === window ? window : typeof self === 'object' && self.self === self ? self : typeof commonjsGlobal === 'object' && commonjsGlobal.global === commonjsGlobal ? commonjsGlobal : void 0;

          function bom(blob, opts) {
            if (typeof opts === 'undefined') opts = {
              autoBom: false
            };else if (typeof opts !== 'object') {
              console.warn('Deprecated: Expected third argument to be a object');
              opts = {
                autoBom: !opts
              };
            } // prepend BOM for UTF-8 XML and text/* types (including HTML)
            // note: your browser will automatically convert UTF-16 U+FEFF to EF BB BF

            if (opts.autoBom && /^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(blob.type)) {
              return new Blob([String.fromCharCode(0xFEFF), blob], {
                type: blob.type
              });
            }

            return blob;
          }

          function download(url, name, opts) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url);
            xhr.responseType = 'blob';

            xhr.onload = function () {
              saveAs(xhr.response, name, opts);
            };

            xhr.onerror = function () {
              console.error('could not download file');
            };

            xhr.send();
          }

          function corsEnabled(url) {
            var xhr = new XMLHttpRequest(); // use sync to avoid popup blocker

            xhr.open('HEAD', url, false);

            try {
              xhr.send();
            } catch (e) {}

            return xhr.status >= 200 && xhr.status <= 299;
          } // `a.click()` doesn't work for all browsers (#465)


          function click(node) {
            try {
              node.dispatchEvent(new MouseEvent('click'));
            } catch (e) {
              var evt = document.createEvent('MouseEvents');
              evt.initMouseEvent('click', true, true, window, 0, 0, 0, 80, 20, false, false, false, false, 0, null);
              node.dispatchEvent(evt);
            }
          }

          var saveAs = _global.saveAs || ( // probably in some web worker
          typeof window !== 'object' || window !== _global ? function saveAs() {}
          /* noop */
          // Use download attribute first if possible (#193 Lumia mobile)
          : 'download' in HTMLAnchorElement.prototype ? function saveAs(blob, name, opts) {
            var URL = _global.URL || _global.webkitURL;
            var a = document.createElement('a');
            name = name || blob.name || 'download';
            a.download = name;
            a.rel = 'noopener'; // tabnabbing
            // TODO: detect chrome extensions & packaged apps
            // a.target = '_blank'

            if (typeof blob === 'string') {
              // Support regular links
              a.href = blob;

              if (a.origin !== location.origin) {
                corsEnabled(a.href) ? download(blob, name, opts) : click(a, a.target = '_blank');
              } else {
                click(a);
              }
            } else {
              // Support blobs
              a.href = URL.createObjectURL(blob);
              setTimeout(function () {
                URL.revokeObjectURL(a.href);
              }, 4E4); // 40s

              setTimeout(function () {
                click(a);
              }, 0);
            }
          } // Use msSaveOrOpenBlob as a second approach
          : 'msSaveOrOpenBlob' in navigator ? function saveAs(blob, name, opts) {
            name = name || blob.name || 'download';

            if (typeof blob === 'string') {
              if (corsEnabled(blob)) {
                download(blob, name, opts);
              } else {
                var a = document.createElement('a');
                a.href = blob;
                a.target = '_blank';
                setTimeout(function () {
                  click(a);
                });
              }
            } else {
              navigator.msSaveOrOpenBlob(bom(blob, opts), name);
            }
          } // Fallback to using FileReader and a popup
          : function saveAs(blob, name, opts, popup) {
            // Open a popup immediately do go around popup blocker
            // Mostly only available on user interaction and the fileReader is async so...
            popup = popup || open('', '_blank');

            if (popup) {
              popup.document.title = popup.document.body.innerText = 'downloading...';
            }

            if (typeof blob === 'string') return download(blob, name, opts);
            var force = blob.type === 'application/octet-stream';

            var isSafari = /constructor/i.test(_global.HTMLElement) || _global.safari;

            var isChromeIOS = /CriOS\/[\d]+/.test(navigator.userAgent);

            if ((isChromeIOS || force && isSafari) && typeof FileReader === 'object') {
              // Safari doesn't allow downloading of blob URLs
              var reader = new FileReader();

              reader.onloadend = function () {
                var url = reader.result;
                url = isChromeIOS ? url : url.replace(/^data:[^;]*;/, 'data:attachment/file;');
                if (popup) popup.location.href = url;else location = url;
                popup = null; // reverse-tabnabbing #460
              };

              reader.readAsDataURL(blob);
            } else {
              var URL = _global.URL || _global.webkitURL;
              var url = URL.createObjectURL(blob);
              if (popup) popup.location = url;else location.href = url;
              popup = null; // reverse-tabnabbing #460

              setTimeout(function () {
                URL.revokeObjectURL(url);
              }, 4E4); // 40s
            }
          });
          _global.saveAs = saveAs.saveAs = saveAs;

          {
            module.exports = saveAs;
          }
        });
        });

        const bufferToBlob = buffer => {
        	let blob;
        	try {
        		blob = new Blob([buffer], { type: 'application/pdf' });
        	} catch (e) {
        		// Old browser which can't handle it without making it an byte array (ie10)
        		if (e.name === 'InvalidStateError') {
        			let byteArray = new Uint8Array(buffer);
        			blob = new Blob([byteArray.buffer], { type: 'application/pdf' });
        		}
        	}

        	if (!blob) {
        		throw new Error('Could not generate blob');
        	}

        	return blob;
        };

        const openWindow = () => {
        	// we have to open the window immediately and store the reference
        	// otherwise popup blockers will stop us
        	let win = window.open('', '_blank');
        	if (win === null) {
        		throw new Error('Open PDF in new window blocked by browser');
        	}

        	return win;
        };

        const OutputDocumentBrowser = Object.assign({}, OutputDocument, {

        	/**
        	 * @returns {Promise}
        	 */
        	getBlob() {
        		return new Promise((resolve, reject) => {
        			this.getBuffer().then(buffer => {
        				let blob = bufferToBlob(buffer);
        				resolve(blob);
        			}, result => {
        				reject(result);
        			});
        		});
        	},

        	/**
        	 * @param {string} filename
        	 * @returns {Promise}
        	 */
        	download(filename = 'file.pdf') {
        		return new Promise((resolve, reject) => {
        			this.getBlob().then(blob => {
        				FileSaver(blob, filename);
        				resolve();
        			}, result => {
        				reject(result);
        			});
        		});
        	},

        	/**
        	 * @param {Window} win
        	 * @returns {Promise}
        	 */
        	open(win = null) {
        		return new Promise((resolve, reject) => {
        			if (!win) {
        				win = openWindow();
        			}
        			this.getBlob().then(blob => {
        				try {
        					let urlCreator = window.URL || window.webkitURL;
        					let pdfUrl = urlCreator.createObjectURL(blob);
        					win.location.href = pdfUrl;

        					//
        					resolve();
        					/* temporarily disabled
        					if (win === window) {
        						resolve();
        					} else {
        						setTimeout(() => {
        							if (win.window === null) { // is closed by AdBlock
        								window.location.href = pdfUrl; // open in actual window
        							}
        							resolve();
        						}, 500);
        					}
        					*/
        				} catch (e) {
        					win.close();
        					throw e;
        				}
        			}, result => {
        				reject(result);
        			});
        		});
        	},

        	/**
        	 * @param {Window} win
        	 * @returns {Promise}
        	 */
        	print(win = null) {
        		this.getStream().setOpenActionAsPrint();
        		return this.open(win);
        	},

        });

        class PDFDocument extends Stream.Readable {
          constructor(options = {}) {
            super(options);
            this.options = options;

            // PDF version
            switch (options.pdfVersion) {
              case '1.4':
                this.version = 1.4;
                break;
              case '1.5':
                this.version = 1.5;
                break;
              case '1.6':
                this.version = 1.6;
                break;
              case '1.7':
              case '1.7ext3':
                this.version = 1.7;
                break;
              default:
                this.version = 1.3;
                break;
            }

            // Whether streams should be compressed
            this.compress =
              this.options.compress != null ? this.options.compress : true;

            this._pageBuffer = [];
            this._pageBufferStart = 0;

            // The PDF object store
            this._offsets = [];
            this._waiting = 0;
            this._ended = false;
            this._offset = 0;
            const Pages = this.ref({
              Type: 'Pages',
              Count: 0,
              Kids: []
            });

            const Names = this.ref({
              Dests: new PDFNameTree()
            });

            this._root = this.ref({
              Type: 'Catalog',
              Pages,
              Names
            });

            // The current page
            this.page = null;

            // Initialize mixins
            this.initColor();
            this.initVector();
            this.initImages();

            // Initialize the metadata
            this.info = {
              Producer: 'PDFKit',
              Creator: 'PDFKit',
              CreationDate: new Date()
            };

            if (this.options.info) {
              for (let key in this.options.info) {
                const val = this.options.info[key];
                this.info[key] = val;
              }
            }

            // Generate file ID
            this._id = PDFSecurity.generateFileID(this.info);

            // Initialize security settings
            this._security = PDFSecurity.create(this, options);

            // Write the header
            // PDF version
            this._write(`%PDF-${this.version}`);

            // 4 binary chars, as recommended by the spec
            this._write('%\xFF\xFF\xFF\xFF');

            // Add the first page
            if (this.options.autoFirstPage !== false) {
              this.addPage();
            }
          }

          addPage(options) {
            // end the current page if needed
            if (options == null) {
              ({ options } = this);
            }
            if (!this.options.bufferPages) {
              this.flushPages();
            }

            // create a page object
            this.page = new PDFPage(this, options);
            this._pageBuffer.push(this.page);

            // add the page to the object store
            const pages = this._root.data.Pages.data;
            pages.Kids.push(this.page.dictionary);
            pages.Count++;

            // reset x and y coordinates
            this.x = this.page.margins.left;
            this.y = this.page.margins.top;

            // flip PDF coordinate system so that the origin is in
            // the top left rather than the bottom left
            this._ctm = [1, 0, 0, 1, 0, 0];
            this.transform(1, 0, 0, -1, 0, this.page.height);

            this.emit('pageAdded');

            return this;
          }

          bufferedPageRange() {
            return { start: this._pageBufferStart, count: this._pageBuffer.length };
          }

          switchToPage(n) {
            let page;
            if (!(page = this._pageBuffer[n - this._pageBufferStart])) {
              throw new Error(
                `switchToPage(${n}) out of bounds, current buffer covers pages ${
          this._pageBufferStart
        } to ${this._pageBufferStart + this._pageBuffer.length - 1}`
              );
            }

            return (this.page = page);
          }

          flushPages() {
            // this local variable exists so we're future-proof against
            // reentrant calls to flushPages.
            const pages = this._pageBuffer;
            this._pageBuffer = [];
            this._pageBufferStart += pages.length;
            for (let page of pages) {
              page.end();
            }
          }

          addNamedDestination(name, ...args) {
            if (args.length === 0) {
              args = ['XYZ', null, null, null];
            }
            if (args[0] === 'XYZ' && args[2] !== null) {
              args[2] = this.page.height - args[2];
            }
            args.unshift(this.page.dictionary);
            this._root.data.Names.data.Dests.add(name, args);
          }

          ref(data) {
            const ref = new PDFReference(this, this._offsets.length + 1, data);
            this._offsets.push(null); // placeholder for this object's offset once it is finalized
            this._waiting++;
            return ref;
          }

          _read() {}
          // do nothing, but this method is required by node

          _write(data) {
            if (!isBuffer(data)) {
              data = new Buffer(data + '\n', 'binary');
            }

            this.push(data);
            return (this._offset += data.length);
          }

          addContent(data) {
            this.page.write(data);
            return this;
          }

          _refEnd(ref) {
            this._offsets[ref.id - 1] = ref.offset;
            if (--this._waiting === 0 && this._ended) {
              this._finalize();
              return (this._ended = false);
            }
          }

          write(filename, fn) {
            // print a deprecation warning with a stacktrace
            const err = new Error(`\
PDFDocument#write is deprecated, and will be removed in a future version of PDFKit. \
Please pipe the document into a Node stream.\
`);

            console.warn(err.stack);

            this.pipe(fs.createWriteStream(filename));
            this.end();
            return this.once('end', fn);
          }

          end() {
            this.flushPages();
            this._info = this.ref();
            for (let key in this.info) {
              let val = this.info[key];
              if (typeof val === 'string') {
                val = new String(val);
              }

              let entry = this.ref(val);
              entry.end();

              this._info.data[key] = entry;
            }

            this._info.end();

            for (let name in this._fontFamilies) {
              const font = this._fontFamilies[name];
              font.finalize();
            }

            this._root.end();
            this._root.data.Pages.end();
            this._root.data.Names.end();

            if (this._security) {
              this._security.end();
            }

            if (this._waiting === 0) {
              return this._finalize();
            } else {
              return (this._ended = true);
            }
          }

          _finalize(fn) {
            // generate xref
            const xRefOffset = this._offset;
            this._write('xref');
            this._write(`0 ${this._offsets.length + 1}`);
            this._write('0000000000 65535 f ');

            for (let offset of this._offsets) {
              offset = `0000000000${offset}`.slice(-10);
              this._write(offset + ' 00000 n ');
            }

            // trailer
            const trailer = {
              Size: this._offsets.length + 1,
              Root: this._root,
              Info: this._info,
              ID: [this._id, this._id]
            };
            if (this._security) {
              trailer.Encrypt = this._security.dictionary;
            }

            this._write('trailer');
            this._write(PDFObject.convert(trailer));

            this._write('startxref');
            this._write(`${xRefOffset}`);
            this._write('%%EOF');

            // end the stream
            return this.push(null);
          }

          toString() {
            return '[object PDFDocument]';
          }
        }

        const mixin = methods => {
          Object.assign(PDFDocument.prototype, methods);
        };

        mixin(ColorMixin);
        mixin(VectorMixin);
        mixin(ImagesMixin);
        mixin(OutputDocumentBrowser);

        /// <reference lib="webworker" />
        const generatePDF = (imgDataUrlList, width, height) => __awaiter(void 0, void 0, void 0, function* () {
            // @ts-ignore
            const pdf = new PDFDocument({
                // compress: true,
                size: [width, height],
                autoFirstPage: false,
                margin: 0,
                layout: "portrait",
            });
            imgDataUrlList.forEach((data) => {
                pdf.addPage();
                pdf.image(data, {
                    width,
                    height,
                });
            });
            // @ts-ignore
            const buf = yield pdf.getBuffer();
            return buf.buffer;
        });
        const getDataURL = (blob) => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => {
                    const result = reader.result;
                    resolve(result);
                };
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        };
        onmessage = (e) => __awaiter(void 0, void 0, void 0, function* () {
            const [imgDataBlobList, width, height,] = e.data;
            const dataURLs = yield Promise.all(imgDataBlobList.map(getDataURL));
            const pdfBuf = yield generatePDF(dataURLs, width, height);
            postMessage(pdfBuf, [pdfBuf]);
        });

    }());
    return Worker
    };

    const scriptUrlFromFunction = (fn) => {
        const blob = new Blob(["(" + fn.toString() + ")()"], { type: "application/javascript" });
        return URL.createObjectURL(blob);
    };
    class PDFWorkerHelper extends Worker {
        constructor() {
            const url = scriptUrlFromFunction(PDFWorker);
            super(url);
        }
        generatePDF(imgDataBlobList, width, height) {
            const msg = [
                imgDataBlobList,
                width,
                height,
            ];
            this.postMessage(msg);
            return new Promise((resolve) => {
                this.addEventListener("message", (e) => {
                    resolve(e.data);
                });
            });
        }
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn, module) {
    	return module = { exports: {} }, fn(module, module.exports), module.exports;
    }

    var FileSaver = createCommonjsModule(function (module, exports) {
    (function (global, factory) {
      {
        factory();
      }
    })(commonjsGlobal, function () {

      /*
      * FileSaver.js
      * A saveAs() FileSaver implementation.
      *
      * By Eli Grey, http://eligrey.com
      *
      * License : https://github.com/eligrey/FileSaver.js/blob/master/LICENSE.md (MIT)
      * source  : http://purl.eligrey.com/github/FileSaver.js
      */
      // The one and only way of getting global scope in all environments
      // https://stackoverflow.com/q/3277182/1008999
      var _global = typeof window === 'object' && window.window === window ? window : typeof self === 'object' && self.self === self ? self : typeof commonjsGlobal === 'object' && commonjsGlobal.global === commonjsGlobal ? commonjsGlobal : void 0;

      function bom(blob, opts) {
        if (typeof opts === 'undefined') opts = {
          autoBom: false
        };else if (typeof opts !== 'object') {
          console.warn('Deprecated: Expected third argument to be a object');
          opts = {
            autoBom: !opts
          };
        } // prepend BOM for UTF-8 XML and text/* types (including HTML)
        // note: your browser will automatically convert UTF-16 U+FEFF to EF BB BF

        if (opts.autoBom && /^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(blob.type)) {
          return new Blob([String.fromCharCode(0xFEFF), blob], {
            type: blob.type
          });
        }

        return blob;
      }

      function download(url, name, opts) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.responseType = 'blob';

        xhr.onload = function () {
          saveAs(xhr.response, name, opts);
        };

        xhr.onerror = function () {
          console.error('could not download file');
        };

        xhr.send();
      }

      function corsEnabled(url) {
        var xhr = new XMLHttpRequest(); // use sync to avoid popup blocker

        xhr.open('HEAD', url, false);

        try {
          xhr.send();
        } catch (e) {}

        return xhr.status >= 200 && xhr.status <= 299;
      } // `a.click()` doesn't work for all browsers (#465)


      function click(node) {
        try {
          node.dispatchEvent(new MouseEvent('click'));
        } catch (e) {
          var evt = document.createEvent('MouseEvents');
          evt.initMouseEvent('click', true, true, window, 0, 0, 0, 80, 20, false, false, false, false, 0, null);
          node.dispatchEvent(evt);
        }
      }

      var saveAs = _global.saveAs || ( // probably in some web worker
      typeof window !== 'object' || window !== _global ? function saveAs() {}
      /* noop */
      // Use download attribute first if possible (#193 Lumia mobile)
      : 'download' in HTMLAnchorElement.prototype ? function saveAs(blob, name, opts) {
        var URL = _global.URL || _global.webkitURL;
        var a = document.createElement('a');
        name = name || blob.name || 'download';
        a.download = name;
        a.rel = 'noopener'; // tabnabbing
        // TODO: detect chrome extensions & packaged apps
        // a.target = '_blank'

        if (typeof blob === 'string') {
          // Support regular links
          a.href = blob;

          if (a.origin !== location.origin) {
            corsEnabled(a.href) ? download(blob, name, opts) : click(a, a.target = '_blank');
          } else {
            click(a);
          }
        } else {
          // Support blobs
          a.href = URL.createObjectURL(blob);
          setTimeout(function () {
            URL.revokeObjectURL(a.href);
          }, 4E4); // 40s

          setTimeout(function () {
            click(a);
          }, 0);
        }
      } // Use msSaveOrOpenBlob as a second approach
      : 'msSaveOrOpenBlob' in navigator ? function saveAs(blob, name, opts) {
        name = name || blob.name || 'download';

        if (typeof blob === 'string') {
          if (corsEnabled(blob)) {
            download(blob, name, opts);
          } else {
            var a = document.createElement('a');
            a.href = blob;
            a.target = '_blank';
            setTimeout(function () {
              click(a);
            });
          }
        } else {
          navigator.msSaveOrOpenBlob(bom(blob, opts), name);
        }
      } // Fallback to using FileReader and a popup
      : function saveAs(blob, name, opts, popup) {
        // Open a popup immediately do go around popup blocker
        // Mostly only available on user interaction and the fileReader is async so...
        popup = popup || open('', '_blank');

        if (popup) {
          popup.document.title = popup.document.body.innerText = 'downloading...';
        }

        if (typeof blob === 'string') return download(blob, name, opts);
        var force = blob.type === 'application/octet-stream';

        var isSafari = /constructor/i.test(_global.HTMLElement) || _global.safari;

        var isChromeIOS = /CriOS\/[\d]+/.test(navigator.userAgent);

        if ((isChromeIOS || force && isSafari) && typeof FileReader === 'object') {
          // Safari doesn't allow downloading of blob URLs
          var reader = new FileReader();

          reader.onloadend = function () {
            var url = reader.result;
            url = isChromeIOS ? url : url.replace(/^data:[^;]*;/, 'data:attachment/file;');
            if (popup) popup.location.href = url;else location = url;
            popup = null; // reverse-tabnabbing #460
          };

          reader.readAsDataURL(blob);
        } else {
          var URL = _global.URL || _global.webkitURL;
          var url = URL.createObjectURL(blob);
          if (popup) popup.location = url;else location.href = url;
          popup = null; // reverse-tabnabbing #460

          setTimeout(function () {
            URL.revokeObjectURL(url);
          }, 4E4); // 40s
        }
      });
      _global.saveAs = saveAs.saveAs = saveAs;

      {
        module.exports = saveAs;
      }
    });
    });

    const saveAs = FileSaver.saveAs;
    let pdfBlob;
    const imgToBlob = (imgURL) => __awaiter(void 0, void 0, void 0, function* () {
        const imageElement = document.createElement("img");
        imageElement.style.display = "none";
        document.body.appendChild(imageElement);
        imageElement.src = imgURL;
        // wait until image loaded
        yield new Promise((resolve) => {
            imageElement.onload = () => resolve();
        });
        const { naturalWidth: width, naturalHeight: height } = imageElement;
        const canvas = document.createElement("canvas");
        const canvasContext = canvas.getContext("2d");
        canvas.width = width;
        canvas.height = height;
        canvas.style.display = "none";
        document.body.appendChild(canvas);
        canvasContext.clearRect(0, 0, width, height);
        canvasContext.drawImage(imageElement, 0, 0);
        const data = yield new Promise(resolve => canvas.toBlob(resolve, "image/png"));
        canvas.remove();
        imageElement.remove();
        return data;
    });
    const generatePDF = (svgURLs, name) => __awaiter(void 0, void 0, void 0, function* () {
        if (pdfBlob) {
            return saveAs(pdfBlob, `${name}.pdf`);
        }
        const cachedImg = document.querySelector("img[id^=score_]");
        const { naturalWidth: width, naturalHeight: height } = cachedImg;
        const imgDataBlobList = yield Promise.all(svgURLs.map(imgToBlob));
        const worker = new PDFWorkerHelper();
        const pdfArrayBuffer = yield worker.generatePDF(imgDataBlobList, width, height);
        worker.terminate();
        pdfBlob = new Blob([pdfArrayBuffer]);
        saveAs(pdfBlob, `${name}.pdf`);
    });
    const getPagesNumber = (scorePlayerData) => {
        try {
            return scorePlayerData.json.metadata.pages;
        }
        catch (_) {
            return document.querySelectorAll("img[id^=score_]").length;
        }
    };
    const getImgType = () => {
        try {
            const imgE = document.querySelector("img[id^=score_]");
            const { pathname } = new URL(imgE.src);
            const imgtype = pathname.match(/\.(\w+)$/)[1];
            return imgtype;
        }
        catch (_) {
            return null;
        }
    };
    const getTitle = (scorePlayerData) => {
        try {
            return scorePlayerData.json.metadata.title;
        }
        catch (_) {
            return "";
        }
    };
    const getScoreFileName = (scorePlayerData) => {
        return getTitle(scorePlayerData).replace(/[\s<>:"/\\|?*~\0\cA-\cZ]+/g, "_");
    };
    const main = () => {
        // @ts-ignore
        if (!window.UGAPP || !window.UGAPP.store || !window.UGAPP.store.jmuse_settings) {
            return;
        }
        // @ts-ignore
        const scorePlayer = window.UGAPP.store.jmuse_settings.score_player;
        const { id } = scorePlayer.json;
        const baseURL = scorePlayer.urls.image_path;
        // const msczURL = `https://musescore.com/static/musescore/scoredata/score/${getIndexPath(id)}/${id}/score_${vid}_${scoreHexId}.mscz`
        // https://github.com/Xmader/cloudflare-worker-musescore-mscz
        const msczURL = `https://musescore-mscz.99.workers.dev/${id}`;
        const mxlURL = baseURL + "score.mxl";
        const { midi: midiURL, mp3: mp3URL } = scorePlayer.urls;
        const btnsDiv = document.querySelector(".score-right .buttons-wrapper") || document.querySelectorAll("aside section > div")[3];
        const downloadBtn = btnsDiv.querySelector("button, .button");
        downloadBtn.onclick = null;
        const imgType = getImgType() || "svg";
        const svgURLs = Array.from({ length: getPagesNumber(scorePlayer) }).fill(null).map((_, i) => {
            return baseURL + `score_${i}.${imgType}`;
        });
        const downloadURLs = {
            "MSCZ": msczURL,
            "PDF": null,
            "MusicXML": mxlURL,
            "MIDI": midiURL,
            "MP3": mp3URL,
        };
        const createBtn = (name) => {
            const btn = downloadBtn.cloneNode(true);
            if (btn.nodeName.toLowerCase() == "button") {
                btn.setAttribute("style", "width: 205px !important");
            }
            else {
                btn.dataset.target = "";
            }
            const textNode = [...btn.childNodes].find((x) => {
                return x.textContent.includes("Download");
            });
            textNode.textContent = `Download ${name}`;
            return {
                btn,
                textNode,
            };
        };
        const newDownloadBtns = Object.keys(downloadURLs).map((name) => {
            const url = downloadURLs[name];
            const { btn, textNode } = createBtn(name);
            if (name !== "PDF") {
                btn.onclick = () => {
                    window.open(url);
                };
            }
            else {
                btn.onclick = () => {
                    const text = textNode.textContent;
                    const filename = getScoreFileName(scorePlayer);
                    textNode.textContent = "Processing…";
                    generatePDF(svgURLs, filename).then(() => {
                        textNode.textContent = text;
                    });
                };
            }
            return btn;
        });
        downloadBtn.replaceWith(...newDownloadBtns);
    };
    waitForDocumentLoaded().then(main);

}());
