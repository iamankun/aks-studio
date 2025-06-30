"use client";
"use strict";

var __awaiter = void 0 && (void 0).__awaiter || function (thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function (resolve) {
      resolve(value);
    });
  }

  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }

    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }

    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }

    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};

var __generator = void 0 && (void 0).__generator || function (thisArg, body) {
  var _ = {
    label: 0,
    sent: function sent() {
      if (t[0] & 1) throw t[1];
      return t[1];
    },
    trys: [],
    ops: []
  },
      f,
      y,
      t,
      g;
  return g = {
    next: verb(0),
    "throw": verb(1),
    "return": verb(2)
  }, typeof Symbol === "function" && (g[Symbol.iterator] = function () {
    return this;
  }), g;

  function verb(n) {
    return function (v) {
      return step([n, v]);
    };
  }

  function step(op) {
    if (f) throw new TypeError("Generator is already executing.");

    while (_) {
      try {
        if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
        if (y = 0, t) op = [op[0] & 2, t.value];

        switch (op[0]) {
          case 0:
          case 1:
            t = op;
            break;

          case 4:
            _.label++;
            return {
              value: op[1],
              done: false
            };

          case 5:
            _.label++;
            y = op[1];
            op = [0];
            continue;

          case 7:
            op = _.ops.pop();

            _.trys.pop();

            continue;

          default:
            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
              _ = 0;
              continue;
            }

            if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
              _.label = op[1];
              break;
            }

            if (op[0] === 6 && _.label < t[1]) {
              _.label = t[1];
              t = op;
              break;
            }

            if (t && _.label < t[2]) {
              _.label = t[2];

              _.ops.push(op);

              break;
            }

            if (t[2]) _.ops.pop();

            _.trys.pop();

            continue;
        }

        op = body.call(thisArg, _);
      } catch (e) {
        op = [6, e];
        y = 0;
      } finally {
        f = t = 0;
      }
    }

    if (op[0] & 5) throw op[1];
    return {
      value: op[0] ? op[1] : void 0,
      done: true
    };
  }
};

exports.__esModule = true;
exports.LoginView = void 0;

var react_1 = require("react");

var button_1 = require("@/components/ui/button");

var input_1 = require("@/components/ui/input");

var label_1 = require("@/components/ui/label");

var card_1 = require("@/components/ui/card");

var lucide_react_1 = require("lucide-react");

var image_1 = require("next/image");

function LoginView(_a) {
  var _this = this;

  var onLogin = _a.onLogin,
      onSwitchToRegister = _a.onSwitchToRegister,
      onSwitchToForgot = _a.onSwitchToForgot;

  var _b = react_1.useState(""),
      username = _b[0],
      setUsername = _b[1];

  var _c = react_1.useState(""),
      password = _c[0],
      setPassword = _c[1];

  var _d = react_1.useState(false),
      loading = _d[0],
      setLoading = _d[1];

  var _e = react_1.useState(""),
      error = _e[0],
      setError = _e[1];

  var _f = react_1.useState(false),
      isReloading = _f[0],
      setIsReloading = _f[1];

  var _g = react_1.useState("Xin chào"),
      currentGreeting = _g[0],
      setCurrentGreeting = _g[1];

  var _h = react_1.useState(0),
      greetingIndex = _h[0],
      setGreetingIndex = _h[1];

  var _j = react_1.useState(""),
      userRole = _j[0],
      setUserRole = _j[1];

  var _k = react_1.useState(""),
      binaryText = _k[0],
      setBinaryText = _k[1];

  var _l = react_1.useState(""),
      companyBinary = _l[0],
      setCompanyBinary = _l[1];

  var _m = react_1.useState(false),
      isDarkMode = _m[0],
      setIsDarkMode = _m[1];

  var _o = react_1.useState(false),
      showBinary = _o[0],
      setShowBinary = _o[1];

  var _p = react_1.useState(false),
      isTransitioning = _p[0],
      setIsTransitioning = _p[1]; // Light sweep throttling


  var _q = react_1.useState(0),
      lastSweepTime = _q[0],
      setLastSweepTime = _q[1];

  var SWEEP_COOLDOWN = 2000; // 2 seconds cooldown

  var _r = react_1.useState({
    appName: userRole || "AKs Studio",
    logoUrl: "/face.png",
    Avatars: "/wp-content/uploads/face.png"
  }),
      appSettings = _r[0],
      setAppSettings = _r[1]; // Greetings in different languages


  var greetings = ["Xin chào", "こんにちは", "Hola", "Bonjour", "Hello", "Hajimemashite", "Hola", "Guten Tag", "Ciao", "Namaste", "Zdravstvuyte", "안녕하세요", "你好", "Olá", "Привет", "שלום", "Merhaba", "สวัสดี", "Kamusta", "Selam", "Hej", "Привіт", "Halo", "Szia", "Здраво", "שלום", "Merhaba"]; // Binary encoding/decoding functions

  var textToBinary = function textToBinary(text) {
    return text.split('').map(function (_char) {
      return _char.charCodeAt(0).toString(2).padStart(8, '0');
    }).join(' ');
  }; // Random binary animation for company name


  var generateRandomBinary = function generateRandomBinary(length) {
    return Array.from({
      length: length
    }, function () {
      return Math.random() > 0.5 ? '1' : '0';
    }).join('');
  }; // User recognition based on ID pattern


  var recognizeUser = function recognizeUser(username) {
    if (username.length >= 3) {
      var pattern = username.substring(0, 3).toLowerCase();
      if (pattern === "ank" || pattern === "kun") return "An Kun"; // Assuming "ank" or "kun" in username implies An Kun

      if (pattern === "adm") return "Người quản lý";
      if (pattern === "ngh" || pattern === "art") return "Nghệ sĩ";
      return "Nghệ sĩ mới hen";
    }

    return ""; // Default return if no pattern matches or username is too short
  }; // Throttled light sweep function - improved version


  var triggerLightSweep = function triggerLightSweep(isIntense) {
    if (isIntense === void 0) {
      isIntense = false;
    }

    var now = Date.now();

    if (now - lastSweepTime < SWEEP_COOLDOWN) {
      return; // Skip if still in cooldown
    }

    setLastSweepTime(now);
    var btn = document.querySelector('.login-button');
    if (!btn) return;
    var className = isIntense ? 'light-sweep-intense' : 'light-sweep'; // Remove any existing classes first

    btn.classList.remove('light-sweep', 'light-sweep-intense'); // Add new class after a small delay to ensure clean animation

    requestAnimationFrame(function () {
      btn.classList.add(className);
    }); // Remove class after 2 seconds

    setTimeout(function () {
      btn.classList.remove(className);
    }, 2000);
  }; // Load app settings for logo and title


  react_1.useEffect(function () {
    var savedApp = localStorage.getItem("appSettings_v2");

    if (savedApp) {
      try {
        var parsed = JSON.parse(savedApp);
        setAppSettings(parsed);
      } catch (err) {
        console.error("Failed to load app settings:", err);
      }
    } // Detect system theme


    var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(systemDark);
  }, []); // Company binary animation with toggle

  react_1.useEffect(function () {
    var interval = setInterval(function () {
      var randomBinary = generateRandomBinary(24);
      setCompanyBinary(randomBinary);
    }, 150);
    return function () {
      return clearInterval(interval);
    };
  }, []); // Toggle between company name and binary every 4 seconds

  react_1.useEffect(function () {
    var toggleInterval = setInterval(function () {
      setIsTransitioning(true);
      setTimeout(function () {
        setShowBinary(!showBinary);
        setIsTransitioning(false);
      }, 300); // Transition duration
    }, 4000); // Switch every 4 seconds

    return function () {
      return clearInterval(toggleInterval);
    };
  }, [showBinary]); // Cycle through greetings with smoother transition

  react_1.useEffect(function () {
    var interval = setInterval(function () {
      setGreetingIndex(function (prev) {
        return (prev + 1) % greetings.length;
      });
    }, 3000); // Slower for better readability

    return function () {
      return clearInterval(interval);
    };
  }, [greetings.length]); // Update greeting with fade effect

  react_1.useEffect(function () {
    // Add fade out effect before changing
    var greetingEl = document.querySelector('.greeting-text');

    if (greetingEl) {
      greetingEl.classList.add('opacity-0');
      setTimeout(function () {
        setCurrentGreeting(greetings[greetingIndex]);
        greetingEl.classList.remove('opacity-0');
      }, 200);
    } else {
      setCurrentGreeting(greetings[greetingIndex]);
    }
  }, [greetingIndex, greetings]); // Binary text animation

  react_1.useEffect(function () {
    if (username) {
      var role = recognizeUser(username);
      setUserRole(role);
      var binary = textToBinary(username);
      setBinaryText(binary);
    } else {
      setUserRole("");
      setBinaryText("");
    }
  }, [username]); // Username change detection - không trigger light sweep

  var handleUsernameChange = function handleUsernameChange(e) {
    var value = e.target.value;
    setUsername(value);
  };

  var handleSubmit = function handleSubmit(e) {
    return __awaiter(_this, void 0, void 0, function () {
      var result, err_1;

      var _a;

      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            e.preventDefault();
            setLoading(true);
            setError("");
            _b.label = 1;

          case 1:
            _b.trys.push([1, 3, 4, 5]);

            return [4
            /*yield*/
            , onLogin(username, password)];

          case 2:
            result = _b.sent();

            if (!result.success) {
              setError((_a = result.message) !== null && _a !== void 0 ? _a : "Đăng nhập thất bại");
            }

            return [3
            /*break*/
            , 5];

          case 3:
            err_1 = _b.sent();
            console.error("Login error:", err_1);
            setError("Đã xảy ra lỗi không mong muốn");
            return [3
            /*break*/
            , 5];

          case 4:
            setLoading(false);
            return [7
            /*endfinally*/
            ];

          case 5:
            return [2
            /*return*/
            ];
        }
      });
    });
  };

  var handleReload = function handleReload() {
    setIsReloading(true); // Add light sweep effect

    var btn = document.querySelector('.reload-button');
    btn === null || btn === void 0 ? void 0 : btn.classList.add('light-sweep-active');
    setTimeout(function () {
      btn === null || btn === void 0 ? void 0 : btn.classList.remove('light-sweep-active');
      window.location.reload();
    }, 800); // Light sweep duration
  };

  var toggleTheme = function toggleTheme() {
    setIsDarkMode(!isDarkMode); // Apply theme to document

    document.documentElement.classList.toggle('dark', !isDarkMode);
  };

  return React.createElement("div", {
    className: "login-container min-h-screen w-full flex relative overflow-hidden"
  }, React.createElement("div", {
    className: "video-container"
  }, React.createElement("video", {
    autoPlay: true,
    muted: true,
    loop: true,
    playsInline: true,
    className: "fullscreen-video",
    onError: function onError() {
      // If video fails to load, hide video container
      var videoContainer = document.querySelector('.video-container video');

      if (videoContainer) {
        videoContainer.style.display = 'none';
      }
    }
  }, React.createElement("source", {
    src: "/videos/background.mp4",
    type: "video/mp4"
  }), React.createElement("source", {
    src: "/videos/background.webm",
    type: "video/webm"
  }), React.createElement("source", {
    src: "https://youtube.com/playlist?list=PLRJ0uIfeC90Z7E1lx4U93su8_Nv-sCnTI&si=_VYc6jUtSlGXA2Kq",
    type: "video/youtube"
  })), React.createElement("div", {
    className: "absolute inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 -z-10"
  })), React.createElement("div", {
    className: "absolute inset-0 bg-black/20 z-1"
  }), React.createElement("div", {
    className: "relative z-10 flex flex-1"
  }, React.createElement("div", {
    className: "flex-1 flex items-center justify-center p-8"
  }, React.createElement("div", {
    className: "w-full max-w-md"
  }, React.createElement(card_1.Card, {
    className: "glass-card"
  }, React.createElement(card_1.CardHeader, {
    className: "text-center"
  }, React.createElement("div", {
    className: "flex justify-center mb-4"
  }, React.createElement("div", {
    className: "relative w-20 h-20 rounded-full overflow-hidden bg-white shadow-xl border-4 border-white/50 flex items-center justify-center"
  }, React.createElement(image_1["default"], {
    src: appSettings.logoUrl + "Logo",
    alt: appSettings.appName + " || " + appSettings.logoUrl + "Logo",
    fill: true,
    className: "object-cover",
    onError: function onError(e) {
      e.currentTarget.src = "https://ankun.dev/wp-content/uploads/2025/06/my-notion-face-transparent.png";
    }
  }))), React.createElement("div", {
    className: "mb-4"
  }, React.createElement("p", {
    className: "text-lg text-gray-600 greeting-fade"
  }, React.createElement("span", {
    className: "greeting-text transition-all duration-300"
  }, currentGreeting)), userRole && React.createElement("p", {
    className: "text-sm text-indigo-600 font-medium user-role-fade animate-pulse"
  }, "\u2728 ", userRole)), React.createElement("span", {
    className: "text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent"
  }, userRole || "" + appSettings.appName)), React.createElement(card_1.CardContent, null, React.createElement("form", {
    onSubmit: handleSubmit,
    className: "space-y-4"
  }, React.createElement("div", {
    className: "space-y-2"
  }, React.createElement(label_1.Label, {
    htmlFor: "username"
  }, "T\xEAn \u0111\u0103ng nh\u1EADp"), React.createElement(input_1.Input, {
    id: "username",
    type: "text",
    value: username,
    onChange: handleUsernameChange,
    placeholder: "ankunstudio",
    required: true,
    className: "transition-all duration-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
  }), binaryText && React.createElement("div", {
    className: "text-xs text-gray-500 font-mono p-2 bg-gray-50 rounded border overflow-hidden"
  }, React.createElement("div", {
    className: "binary-animation"
  }, binaryText))), React.createElement("div", {
    className: "space-y-2"
  }, React.createElement(label_1.Label, {
    htmlFor: "password"
  }, "M\u1EADt kh\u1EA9u"), React.createElement(input_1.Input, {
    id: "password",
    type: "password",
    value: password,
    onChange: function onChange(e) {
      return setPassword(e.target.value);
    },
    placeholder: "admin",
    required: true
  })), error && React.createElement("div", {
    className: "text-red-500 text-sm text-center"
  }, error), React.createElement(button_1.Button, {
    type: "submit",
    className: "w-full genZ-shimmer transition-all duration-300 hover:scale-105 active:scale-95 login-button",
    disabled: loading,
    onMouseEnter: function onMouseEnter() {
      return triggerLightSweep(false);
    },
    onClick: function onClick() {
      return triggerLightSweep(true);
    }
  }, loading ? React.createElement(React.Fragment, null, React.createElement(lucide_react_1.Loader2, {
    className: "mr-2 h-4 w-4 animate-spin"
  }), "\u0110ang \u0111\u0103ng nh\u1EADp...") : "Đăng nhập")), React.createElement("div", {
    className: "mt-4 text-center space-y"
  }, React.createElement(button_1.Button, {
    variant: "link",
    onClick: onSwitchToForgot,
    className: "text-sm"
  }, "Qu\xEAn m\u1EADt kh\u1EA9u?"), React.createElement("div", null, React.createElement(button_1.Button, {
    variant: "link",
    onClick: onSwitchToRegister,
    className: "text-sm"
  }, "Ch\u01B0a c\xF3 t\xE0i kho\u1EA3n? \u0110\u0103ng k\xFD ngay"))), React.createElement("div", {
    className: "mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg text-sm text-center border border-blue-200/50"
  }, React.createElement("strong", {
    className: "text-blue-700"
  }, "Ch\u1EC9 c\u1EA7n b\u1EA1n \u0111\u0103ng k\xFD t\xE0i kho\u1EA3n"), React.createElement("br", null), React.createElement("span", {
    className: "text-blue-600"
  }, "L\xE0 b\u1EA1n \u0111\xE3 \u0111\u1ED3ng \xFD v\u1EDBi hai v\u1EA5n \u0111\u1EC1 sau:"), React.createElement("br", null), React.createElement("span", {
    className: "text-blue-600"
  }, React.createElement("a", {
    href: "https://ankun.dev/terms-and-conditions",
    target: "_blank",
    rel: "noopener noreferrer"
  }, "\u0110i\u1EC1u kho\u1EA3n v\xE0 \u0111i\u1EC1u ki\u1EC7n"), React.createElement("p", null, React.createElement("a", {
    href: "https://ankun.dev/privacy-policy",
    target: "_blank",
    rel: "noopener noreferrer"
  }, "Ch\xEDnh s\xE1ch v\xE0 quy\u1EC1n ri\xEAng t\u01B0")))))), React.createElement("div", {
    className: "flex justify-between items-center mt-4"
  }, React.createElement(button_1.Button, {
    variant: "outline",
    size: "sm",
    onClick: toggleTheme,
    className: "bg-white/80 backdrop-blur-sm border-white/30 hover:bg-white/90 transition-all duration-300"
  }, isDarkMode ? React.createElement(lucide_react_1.Sun, {
    className: "w-4 h-4"
  }) : React.createElement(lucide_react_1.Moon, {
    className: "w-4 h-4"
  })), React.createElement(button_1.Button, {
    variant: "outline",
    size: "sm",
    onClick: handleReload,
    disabled: isReloading,
    className: "reload-button bg-white/80 backdrop-blur-sm border-white/30 hover:bg-white/90 transition-all duration-300 " + (isReloading ? 'reload-pulsing' : '')
  }, React.createElement(lucide_react_1.RefreshCw, {
    className: "w-4 h-4 mr-2"
  }), isReloading ? 'Đang tải...' : 'Reload')))), React.createElement("div", {
    className: "flex-1 flex items-center justify-center p-8"
  }, React.createElement("div", {
    className: "w-full max-w-md text-center"
  }, React.createElement("div", {
    className: "mb-8"
  }, React.createElement("div", {
    className: "flex justify-center mb-6"
  }, React.createElement("div", {
    className: "relative w-32 h-32 rounded-full overflow-hidden bg-white shadow-2xl border-4 border-white/50"
  }, React.createElement(image_1["default"], {
    src: appSettings.logoUrl,
    alt: appSettings.Avatars + " Logo",
    fill: true,
    className: "object-cover",
    onError: function onError(e) {
      e.currentTarget.src = "/face.png";
    }
  }))), React.createElement("div", {
    className: "space-y-4"
  }, React.createElement("div", {
    className: "relative h-16 flex items-center justify-center"
  }, React.createElement("h1", {
    className: "absolute text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent transition-all duration-500 " + (showBinary ? 'opacity-0 transform scale-95 blur-sm' : 'opacity-100 transform scale-100 blur-0') + " " + (isTransitioning ? 'tech-glitch' : '')
  }, appSettings.appName), React.createElement("div", {
    className: "absolute font-mono text-xl text-purple-400 transition-all duration-500 " + (showBinary ? 'opacity-100 transform scale-100 blur-0' : 'opacity-0 transform scale-105 blur-sm') + " " + (isTransitioning ? 'tech-glitch' : '')
  }, React.createElement("div", {
    className: "binary-animation-company-large"
  }, companyBinary)), isTransitioning && React.createElement("div", {
    className: "absolute inset-0 tech-scan-line"
  })))))), React.createElement("div", null, React.createElement("div", {
    className: "absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-xl floating"
  }), React.createElement("div", {
    className: "absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-r from-indigo-400/20 to-pink-400/20 rounded-full blur-xl floating"
  }), React.createElement("div", {
    className: "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-gradient-to-r from-purple-400/10 to-blue-400/10 rounded-full blur-2xl floating"
  }), React.createElement("div", {
    className: "absolute top-10 right-1/3 w-16 h-16 bg-gradient-to-br from-yellow-400/30 to-orange-400/30 rounded-lg blur-lg floating rotate-45"
  }), React.createElement("div", {
    className: "absolute bottom-10 left-1/3 w-20 h-20 bg-gradient-to-br from-green-400/30 to-cyan-400/30 rounded-full blur-lg floating"
  }), React.createElement("div", {
    className: "absolute top-1/3 right-10 w-12 h-12 bg-gradient-to-br from-pink-400/40 to-purple-400/40 rounded-full blur-md floating"
  }))));
}

exports.LoginView = LoginView;