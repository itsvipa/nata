'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var mous = document.getElementById('move');
mous.addEventListener('mousemove', e => {
  var curs = document.getElementById("cursor");
  var sh = document.getElementById("shuri");
  var x = e.clientX;
  var y = e.clientY;

  if (curs !== null && curs !== undefined) {
    curs.style.left = x + "px";
    curs.style.top = y + "px";
  }

  if (sh !== null && sh !== undefined) {
    sh.style.left = x + "px";
    sh.style.top = y + "px";
  }
});
mous.addEventListener('mousedown', e => {
  var curs = document.getElementById("cursor");

  if (curs !== null && curs !== undefined) {
    curs.style.backgroundImage = "url(../images/kunaihover.png)";
  }
});
mous.addEventListener('mouseup', e => {
  var curs = document.getElementById("cursor");

  if (curs !== null && curs !== undefined) {
    curs.style.backgroundImage = "url(../images/kunai.png)";
  }
});
var urlmain = "https://naruto-arena.net/en/selection".split("/").slice(0, 4).join("/");
var cts = false;
var buffercount = 10;
var var_load_page = "";
var var_load_type = "";
var bitsloaded = 0;
var var_loading = true;
var inter = [];
var preload;
var map = {};
var xold;
var var_connection_problem;
var var_disconnect_counter;
var charimages = [];
var ingameimages = [];
var theInterval = null;
var var_selecteds = [];
var pergint = null;
document.getElementById("cursor").style.opacity = 0;
document.getElementById("shuri").style.opacity = 1;

if (
  localStorage.getItem("game_volume") === undefined ||
  localStorage.getItem("game_volume") === null
) {
  localStorage.setItem("game_volume", 20);
}

function loadRequest(dados, self) {
  var_load_type = dados.action; // console.log(dados);

  $.ajaxSetup({
    headers: {
      'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
    }
  });
  $.ajax({
    method: "POST",
    url: urlmain + "/newgame",
    data: dados
  }).done(function (data) {
    if (data.completed) {
      var_loading = false;
      document.getElementById("cursor").style.opacity = 1;
      document.getElementById("shuri").style.opacity = 0;
      var_connection_problem = false;
      var_disconnect_counter = 0;

      var __reg0;

      if ((__reg0 = var_load_type) === "checkifLoggedIn") {
        // trace(data.login + " TESTE");
        //trace("step 3: checkifLoggedIn");
        checkifLoggedIn(data.playerstatus, data.player, data.login, self);
      } else if (__reg0 === "startSelection") {
        //trace("step 3: startSelection");
        startSelection(data.playerstatus, data.player, data.login, self);
      } else if (__reg0 === "requestLadder") {
        //trace("step 3: requestLadder");
        requestLadder(self);
      } else if (__reg0 === "requestQuick") {
        //trace("step 3: requestQuick");
        requestQuick(self);
      } else if (__reg0 === "requestPrivate") {
        //trace("step 3: requestPrivate     " + data.found);
        requestPrivate(data.found, self);
      } else if (__reg0 === "cancelRequest") {
        if (data.startmatch != undefined) {
          searchForBattle(data.startmatch, self);
        } else {
          cancelRequest(self);
        }
      } else if (__reg0 === "searchForBattle") {
        //trace("searching for battle..." + data.startmatch);
        searchForBattle(data.startmatch, self);
      } else if (__reg0 === "checkIfStart") {
        //trace("checking for start battle..." + data.startmatch);
        checkIfStart(data.startmatch, self);
      }
    } else {
      var_connection_problem = true;
    }
  });
}

function notLoggedIn(self) {
  self.setState({
    notlogged: true,
    isLoaded: true
  });
}

function checkifLoggedIn(playerstatus, playerdata, login, self) {
  if (login == 1) {
    startSelection(playerstatus, playerdata, login, self);
    return undefined;
  }

  self.setState({
    rbattlelogin: "IF YOU DON'T HAVE AN ACCOUNT YET, PLEASE REGISTER AT NARUTO-ARENA.NET",
    loginerror: "WRONG USERNAME OR/AND PASSWORD"
  });
}

function startSelection(playerstatus, playerdata, login, self) {
  // console.log(playerdata);

  if (login == 0) {
    notLoggedIn(self);
    return;
  }

  if (playerstatus == 1) {
    buffer();
    return;
  }

  charimages = playerdata.tema.char;
  ingameimages = playerdata.tema.ingame;
  var var_total_groups = Math.floor(playerdata.character.length / 21);
  var read = false;
  if (playerdata.selected[0] != null && playerdata.selected[1] != null && playerdata.selected[2] != null) read = true;
  self.setState({
    player: playerdata,
    isLoaded: true,
    var_total_groups: var_total_groups,
    var_ready: read,
    notlogged: false
  }); // console.log(self.state.player);
}

function requestPrivate(found, self) {
  if (found) {
    requestGame("SEARCHING FOR " + self.state.oppname.toUpperCase() + "...", self);
  }
}

function requestLadder(self) {
  requestGame("SEARCHING FOR AN OPPONENT...", self);
}

function requestQuick(self) {
  requestGame("SEARCHING FOR AN OPPONENT...", self);
}

function requestGame(msg, self) {
  self.setState({
    rbattle: msg,
    pb: false,
    oppname: ''
  });
  theInterval = setInterval(function () {
    loadRequest({
      'action': 'searchForBattle'
    }, self);
  }, 10000);
  inter.push(theInterval);
}

function searchForBattle(startmatch, self) {
  // console.log(startmatch);
  if (startmatch == "2") {
    var found = document.getElementById("found");
    found.volume = parseInt(localStorage.getItem("game_volume"))/100;
    found.play();
    self.setState({
      startmatch: 2,
      rbattle: "OPPONENT FOUND!",
      rbattle2: "ATTEMPTING TO ENTER BATTLE...",
      var_loading: false
    });
    document.getElementById("cursor").style.opacity = 1;
    document.getElementById("shuri").style.opacity = 0;
    clearInterval(theInterval);
    theInterval = setInterval(function () {
      loadRequest({
        'action': 'checkIfStart'
      }, self);
    }, 7000);
    inter.push(theInterval);
    return undefined;
  }

  if (startmatch == "0") {
    clearInterval(theInterval); // console.log("FAILED TO FIND AN OPPONENT", "reload");

    return undefined;
  }

  inter.push(theInterval);
}

function cancelRequest(self) {
  self.setState({
    rbattle: null,
    startmatch: null,
    var_loading: false
  });
  document.getElementById("cursor").style.opacity = 1;
  document.getElementById("shuri").style.opacity = 0;
}

function checkIfStart(startmatch, self) {
  // console.log("checkou",startmatch);
  if (startmatch == "1") {
    clearInterval(theInterval);
    loadGame();
    return undefined;
  }

  if (startmatch == "2") {
    clearInterval(theInterval);
    self.setState({
      startmatch: 3,
      rbattle: "BATTLE CANCELLED"
    });
    return undefined;
  } else {
    theInterval = setInterval(function () {
      loadRequest({
        'action': 'checkIfStart'
      }, self);
    }, 7000);
    inter.push(theInterval);
  }
}

function loadGame() {
  window.location = "/en/battle";
}

const {
  arrayMove,
  SortableContainer,
  SortableElement
} = SortableHOC;
const SortableItem = SortableElement(({
  index,
  value,
  self,
  pos
}) => {
  if (charimages.charimage[value - 1] == undefined || charimages.charimage[value - 1].length == 0) {
    var ci = 'https://via.placeholder.com/75x75.png?text=' + value;
  } else {
    var ci = charimages.charimage[value - 1];
  }

  if (self.state.player.selected[pos] != null) {
    return /*#__PURE__*/React.createElement("div", {
      onClick: () => self.clickCharS(self.state.player.selected[pos], pos),
      onDoubleClick: () => self.desselect(pos),
      className: "personagem_fundo2 item borda",
      style: {
        backgroundImage: `url(${ci})`
      }
    });
  } else {
    return /*#__PURE__*/React.createElement("div", {
      className: "personagem_fundo2 item borda"
    });
  }
});
const SortableList = SortableContainer(({
  items,
  self
}) => {
  return /*#__PURE__*/React.createElement("div", {
    className: "container"
  }, items.map((value, index) => /*#__PURE__*/React.createElement(SortableItem, {
    key: `item-${index}`,
    index: index,
    value: value,
    self: self,
    pos: index
  })));
});

class SortableComponent extends React.Component {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "state", {
      items: this.props.self.state.player.selected
    });

    _defineProperty(this, "onSortEnd", ({
      oldIndex,
      newIndex
    }) => {
      this.setState({
        items: arrayMove(this.state.items, oldIndex, newIndex)
      });
      var player = this.props.self.state.player;
      player.selected = this.state.items;
      this.props.self.setState({
        player: player
      });
    });
  }

  render() {
    return /*#__PURE__*/React.createElement(SortableList, {
      items: this.state.items,
      self: this.props.self,
      distance: 1,
      onSortEnd: this.onSortEnd,
      lockAxis: "x",
      axis: "x",
      helperClass: "escalar"
    });
  }

}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      player: null,
      isLoaded: false,
      page: 0,
      var_ready: false,
      var_selected_c: null,
      var_selected_s: null,
      var_total_groups: 0,
      var_loading: false,
      rbattle: null,
      startmatch: null,
      rbattle2: null,
      pb: false,
      oppname: '',
      notlogged: false,
      username: '',
      password: '',
      loginerror: '',
      rbattlelogin: "PLEASE ENTER YOU USERNAME AND PASSWORD BELOW TO START PLAYING.",
      topoa: '',
      perga: ''
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleChangeUser = this.handleChangeUser.bind(this);
    this.handleChangePass = this.handleChangePass.bind(this);
  }

  componentDidMount() {
    var self = this;
    loadRequest({
      'action': 'startSelection'
    }, self);
  }

  pers() {
    var pers = [];
    var pesim = '';

    for (let index = this.state.page * 21; index < this.state.page * 21 + 21; index++) {
      if (this.state.player.character[index] != undefined) {
        var here = this.state.player.selected.indexOf(this.state.player.character[index].character_id);

        if (here == -1) {
          if (this.state.player.character[index].unlocked == 1) {
            if (charimages.charimage[this.state.player.character[index].character_id - 1] == undefined || charimages.charimage[this.state.player.character[index].character_id - 1].length == 0) {
              pesim = /*#__PURE__*/React.createElement("img", {
                onClick: () => this.clickChar(index),
                onDoubleClick: () => this.selectchar(index),
                className: "personagem borda",
                src: 'https://via.placeholder.com/48x48.png?text=' + this.state.player.character[index].character_id
              });
            } else {
              pesim = /*#__PURE__*/React.createElement("img", {
                onClick: () => this.clickChar(index),
                onDoubleClick: () => this.selectchar(index),
                className: "personagem borda",
                src: charimages.charimage[this.state.player.character[index].character_id - 1]
              });
            }
          } else {
            if (charimages.charimage[this.state.player.character[index].character_id - 1] == undefined || charimages.charimage[this.state.player.character[index].character_id - 1].length == 0) {
              pesim = /*#__PURE__*/React.createElement("img", {
                className: "personagem borda",
                style: {
                  opacity: 0.3
                },
                src: 'https://via.placeholder.com/48x48.png?text=' + this.state.player.character[index].character_id
              });
            } else {
              pesim = /*#__PURE__*/React.createElement("img", {
                className: "personagem borda",
                style: {
                  opacity: 0.3
                },
                src: charimages.charimage[this.state.player.character[index].character_id - 1]
              });
            }
          }
        } else {
          var_selecteds[here] = index;
        }

        pers.push( /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("div", {
          className: "personagem_fundo borda"
        }), pesim));
        pesim = '';
      }
    }

    return pers;
  }

  selecteds() {
    var sel = [];
    var pesim = '';

    for (let index = 0; index < 3; index++) {
      if (this.state.player.selected[index] != null && this.state.player.selected[index] !== "") {
        if (charimages.charimage[this.state.player.selected[index] - 1] == undefined || charimages.charimage[this.state.player.selected[index] - 1].length == 0) {
          pesim = /*#__PURE__*/React.createElement("img", {
            onClick: () => this.clickCharS(this.state.player.selected[index], index),
            onDoubleClick: () => this.desselect(index),
            className: "personagem borda",
            src: 'https://via.placeholder.com/48x48.png?text=' + this.state.player.selected[index]
          });
        } else {
          pesim = /*#__PURE__*/React.createElement("img", {
            onClick: () => this.clickCharS(this.state.player.selected[index], index),
            onDoubleClick: () => this.desselect(index),
            className: "personagem borda",
            src: charimages.charimage[this.state.player.selected[index] - 1]
          });
        }
      }

      sel.push( /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("div", {
        className: "personagem_fundo borda"
      }), pesim));
      pesim = '';
    }

    return sel;
  }

  selectchar(i) {
    var play = this.state.player;

    for (let y = 0; y < 3; y++) {
      if (this.state.player.selected[y] == null || this.state.player.selected[y] == "") {
        play.selected[y] = this.state.player.character[i].character_id;
        var_selecteds[y] = i;
        break;
      }
    }

    var read = this.state.var_ready;
    if (play.selected[0] != null && play.selected[1] != null && play.selected[2] != null) read = true;
    this.setState({
      player: play,
      var_ready: read
    });
  }

  desselect(i) {
    var play = this.state.player;
    play.selected[i] = null;
    var_selecteds[i] = null;
    this.setState({
      player: play,
      var_ready: false
    });
  }

  pergclose() {
    var self = this;
    var perg = document.getElementById("pergc");
    perg.volume = parseInt(localStorage.getItem("game_volume"))/100;
    perg.play();
    this.setState({
      perga: 'pergtopoaend',
      topoa: 'topoaend'
    });
    setTimeout(function () {
      self.setState({
        var_selected_c: null,
        var_selected_s: null
      });
    }, 600);
  }

  countselecteds() {
    var counter = 0;
    var i = 0;

    while (i <= 2) {
      if (this.state.player.selected[i] === "" || this.state.player.selected[i] == null) {
        counter++;
      }

      i++;
    }

    var __reg0;

    if ((__reg0 = counter) === 0) {
      return "YOU ARE READY TO START A GAME";
    }

    if (__reg0 === 1) {
      return "SELECT 1 MORE CHARACTER INTO YOUR TEAM";
    }

    if (__reg0 === 2) {
      return "SELECT 2 MORE CHARACTERS INTO YOUR TEAM";
    }

    return "SELECT 3 CHARACTERS INTO YOUR TEAM";
  }

  clickChar(i) {
    var click = document.getElementById("click");
    click.volume = parseInt(localStorage.getItem("game_volume"))/100;
    click.play();
    var perg = document.getElementById("perg");
    perg.volume = parseInt(localStorage.getItem("game_volume"))/100;
    var self = this;

    if (this.state.var_selected_c == null) {
      perg.play();
      this.setState({
        var_selected_c: i,
        var_selected_s: null,
        topoa: 'topoa',
        perga: 'pergtopoa'
      });
    } else if (this.state.var_selected_c != i) {
      this.setState({
        topoa: 'topoaend',
        perga: 'pergtopoaend'
      });
      setTimeout(function () {
        perg.play();
        self.setState({
          var_selected_c: i,
          var_selected_s: null,
          topoa: 'topoa',
          perga: 'pergtopoa'
        });
      }, 600);
    }
  }

  clickCharS(i, pos) {
    // console.log('clicou');
    var click = document.getElementById("click");
    click.volume = parseInt(localStorage.getItem("game_volume"))/100;
    click.play();
    var perg = document.getElementById("perg");
    perg.volume = parseInt(localStorage.getItem("game_volume"))/100;
    var self = this;

    if (var_selecteds[pos] != undefined || var_selecteds[pos] != null) {
      if (this.state.var_selected_c == null) {
        perg.play();
        this.setState({
          var_selected_c: var_selecteds[pos],
          var_selected_s: null,
          topoa: 'topoa',
          perga: 'pergtopoa'
        });
      } else if (this.state.var_selected_c != var_selecteds[pos]) {
        this.setState({
          topoa: 'topoaend',
          perga: 'pergtopoaend'
        });
        setTimeout(function () {
          perg.play();
          self.setState({
            var_selected_c: var_selecteds[pos],
            var_selected_s: null,
            topoa: 'topoa',
            perga: 'pergtopoa'
          });
        }, 600);
      }
    } else {
      // console.log('else');
      for (let index = 0; index < this.state.player.character.length; index++) {
        if (this.state.player.character[index].character_id == i) {
          var_selecteds[pos] = index;
          this.setState({
            var_selected_c: index,
            var_selected_s: null
          });
        }
      }
    }
  }

  clickSkill(i) {
    var click = document.getElementById("click");
    click.volume = parseInt(localStorage.getItem("game_volume"))/100;
    click.play();
    this.setState({
      var_selected_s: i
    });
  }

  clickHolder() {
    var click = document.getElementById("click");
    click.volume = parseInt(localStorage.getItem("game_volume"))/100;
    click.play();
    this.setState({
      var_selected_s: null
    });
  }

  topo() {
    var top = [];

    if (this.state.var_selected_c != null) {
      var ch = [];

      if (this.state.var_selected_s == null) {
        if (charimages.charname[this.state.player.character[this.state.var_selected_c].character_id - 1] == undefined || charimages.charname[this.state.player.character[this.state.var_selected_c].character_id - 1].length == 0) {
          var cname = "Character " + this.state.player.character[this.state.var_selected_c].character_id;
        } else {
          var cname = charimages.charname[this.state.player.character[this.state.var_selected_c].character_id - 1];
        }

        if (charimages.charname[this.state.player.character[this.state.var_selected_c].character_id - 1] == undefined || charimages.charname[this.state.player.character[this.state.var_selected_c].character_id - 1].length == 0) {
          var sname = "Character " + this.state.player.character[this.state.var_selected_c].character_id;
        } else {
          var sname = charimages.charname[this.state.player.character[this.state.var_selected_c].character_id - 1];
        }

        if (charimages.chardesc[this.state.player.character[this.state.var_selected_c].character_id - 1] == undefined || charimages.chardesc[this.state.player.character[this.state.var_selected_c].character_id - 1].length == 0) {
          var cdesc = "Skill " + this.state.player.character[this.state.var_selected_c].character_id;
        } else {
          var cdesc = charimages.chardesc[this.state.player.character[this.state.var_selected_c].character_id - 1];
        }

        if (charimages.charimage[this.state.player.character[this.state.var_selected_c].character_id - 1] == undefined || charimages.charimage[this.state.player.character[this.state.var_selected_c].character_id - 1].length == 0) {
          var cimage = 'https://via.placeholder.com/75x75.png?text=' + this.state.player.character[this.state.var_selected_c].character_id;
        } else {
          var cimage = charimages.charimage[this.state.player.character[this.state.var_selected_c].character_id - 1];
        }

        ch.push( /*#__PURE__*/React.createElement("div", {
          className: "conteudo"
        }, /*#__PURE__*/React.createElement("div", {
          className: "nome"
        }, cname.toUpperCase()), /*#__PURE__*/React.createElement("img", {
          onClick: () => this.clickHolder(),
          className: "foto borda",
          src: cimage
        }), /*#__PURE__*/React.createElement("div", {
          className: "nomeskill"
        }, sname.toUpperCase()), /*#__PURE__*/React.createElement("div", {
          className: "desc"
        }, cdesc.toUpperCase())));

        if (charimages.charimage[this.state.player.character[this.state.var_selected_c].character_id - 1] == undefined || charimages.charimage[this.state.player.character[this.state.var_selected_c].character_id - 1].length == 0) {
          ch.push( /*#__PURE__*/React.createElement("img", {
            className: "fotoskill borda",
            src: 'https://via.placeholder.com/75x75.png?text=' + this.state.player.character[this.state.var_selected_c].character_id
          }));
        } else {
          ch.push( /*#__PURE__*/React.createElement("img", {
            className: "fotoskill borda",
            src: charimages.charimage[this.state.player.character[this.state.var_selected_c].character_id - 1]
          }));
        }
      } else {
        var en = [];
        var ener = [];

        if (this.state.player.character[this.state.var_selected_c].skills[this.state.var_selected_s].energy.length > 0) {
          for (let z = 0; z < this.state.player.character[this.state.var_selected_c].skills[this.state.var_selected_s].energy.length; z++) {
            if (this.state.player.character[this.state.var_selected_c].skills[this.state.var_selected_s].energy[z] == 0) en.push( /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("img", {
              src: "../images/0.png"
            })));
            if (this.state.player.character[this.state.var_selected_c].skills[this.state.var_selected_s].energy[z] == 1) en.push( /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("img", {
              src: "../images/1.png"
            })));
            if (this.state.player.character[this.state.var_selected_c].skills[this.state.var_selected_s].energy[z] == 2) en.push( /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("img", {
              src: "../images/2.png"
            })));
            if (this.state.player.character[this.state.var_selected_c].skills[this.state.var_selected_s].energy[z] == 3) en.push( /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("img", {
              src: "../images/3.png"
            })));
            if (this.state.player.character[this.state.var_selected_c].skills[this.state.var_selected_s].energy[z] == 4) en.push( /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("img", {
              src: "../images/4.png"
            })));
          }

          ener.push( /*#__PURE__*/React.createElement("ul", null, en));
        } else {
          ener = ' NONE';
        }

        if (charimages.charname[this.state.player.character[this.state.var_selected_c].character_id - 1] == undefined || charimages.charname[this.state.player.character[this.state.var_selected_c].character_id - 1].length == 0) {
          var cname = "Character " + this.state.player.character[this.state.var_selected_c].character_id;
        } else {
          var cname = charimages.charname[this.state.player.character[this.state.var_selected_c].character_id - 1];
        }

        if (charimages.skillname[this.state.player.character[this.state.var_selected_c].skills[this.state.var_selected_s].skill_id - 1] == undefined || charimages.skillname[this.state.player.character[this.state.var_selected_c].skills[this.state.var_selected_s].skill_id - 1].length == 0) {
          var sname = "Skill " + this.state.player.character[this.state.var_selected_c].skills[this.state.var_selected_s].skill_id;
        } else {
          var sname = charimages.skillname[this.state.player.character[this.state.var_selected_c].skills[this.state.var_selected_s].skill_id - 1];
        }

        if (charimages.charimage[this.state.player.character[this.state.var_selected_c].character_id - 1] == undefined || charimages.charimage[this.state.player.character[this.state.var_selected_c].character_id - 1].length == 0) {
          var chim = 'https://via.placeholder.com/75x75.png?text=' + this.state.player.character[this.state.var_selected_c].character_id;
        } else {
          var chim = charimages.charimage[this.state.player.character[this.state.var_selected_c].character_id - 1];
        }

        ch.push( /*#__PURE__*/React.createElement("div", {
          className: "conteudo"
        }, /*#__PURE__*/React.createElement("div", {
          className: "nome"
        }, cname.toUpperCase()), /*#__PURE__*/React.createElement("img", {
          onClick: () => this.clickHolder(),
          className: "foto borda",
          src: chim
        }), /*#__PURE__*/React.createElement("div", {
          className: "nomeskill"
        }, sname.toUpperCase()), /*#__PURE__*/React.createElement("div", {
          className: "desc"
        }, this.state.player.character[this.state.var_selected_c].skills[this.state.var_selected_s].description.toUpperCase()), /*#__PURE__*/React.createElement("div", {
          className: "classes"
        }, "CLASSES: ", this.state.player.character[this.state.var_selected_c].skills[this.state.var_selected_s].classlist.toUpperCase()), /*#__PURE__*/React.createElement("div", {
          className: "energy"
        }, "ENERGY:", ener)));
        if (this.state.player.character[this.state.var_selected_c].skills[this.state.var_selected_s].cooldown > 0) ch.push( /*#__PURE__*/React.createElement("div", {
          className: "cooldown"
        }, "COOLDOWN: ", this.state.player.character[this.state.var_selected_c].skills[this.state.var_selected_s].cooldown));else ch.push( /*#__PURE__*/React.createElement("div", {
          className: "cooldown"
        }, "COOLDOWN: NONE"));

        if (charimages.skillimage[this.state.player.character[this.state.var_selected_c].skills[this.state.var_selected_s].skill_id - 1] == undefined || charimages.skillimage[this.state.player.character[this.state.var_selected_c].skills[this.state.var_selected_s].skill_id - 1].length == 0) {
          var imagem = "https://via.placeholder.com/75x75.png?text=" + this.state.player.character[this.state.var_selected_c].skills[this.state.var_selected_s].skill_id;
          ch.push( /*#__PURE__*/React.createElement("img", {
            className: "fotoskill borda",
            src: imagem
          }));
        } else {
          ch.push( /*#__PURE__*/React.createElement("img", {
            className: "fotoskill borda",
            src: charimages.skillimage[this.state.player.character[this.state.var_selected_c].skills[this.state.var_selected_s].skill_id - 1]
          }));
        }
      }

      var skk = [];

      for (let w = 0; w < 4; w++) {
        if (charimages.skillimage[this.state.player.character[this.state.var_selected_c].skills[w].skill_id - 1] == undefined || charimages.skillimage[this.state.player.character[this.state.var_selected_c].skills[w].skill_id - 1].length == 0) {
          var imagem = "https://via.placeholder.com/75x75.png?text=" + this.state.player.character[this.state.var_selected_c].skills[w].skill_id;
          skk.push( /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("img", {
            onClick: () => this.clickSkill(w),
            className: "fotolista borda",
            src: imagem
          })));
        } else {
          skk.push( /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("img", {
            onClick: () => this.clickSkill(w),
            className: "fotolista borda",
            src: charimages.skillimage[this.state.player.character[this.state.var_selected_c].skills[w].skill_id - 1]
          })));
        }
      }

      top.push( /*#__PURE__*/React.createElement("div", {
        className: "topo " + this.state.topoa
      }, ch, /*#__PURE__*/React.createElement("ul", {
        className: "listaskills"
      }, skk)));
      top.push( /*#__PURE__*/React.createElement("div", {
        onClick: () => this.pergclose(),
        className: "pergtopo " + this.state.perga
      }));
    }

    return top;
  }

  clickLadder() {
    if (this.state.var_ready && this.state.var_loading == false) {
      var click = document.getElementById("click");
      click.volume = parseInt(localStorage.getItem("game_volume"))/100;
      click.play();
      this.setState({
        var_loading: true
      });
      document.getElementById("cursor").style.opacity = 0;
      document.getElementById("shuri").style.opacity = 1;
      loadRequest({
        'selecteds': JSON.stringify(this.state.player.selected),
        'action': 'requestLadder'
      }, this);
    }
  }

  clickQuick() {
    if (this.state.var_ready && this.state.var_loading == false) {
      var click = document.getElementById("click");
      click.volume = parseInt(localStorage.getItem("game_volume"))/100;
      click.play();
      this.setState({
        var_loading: true
      });
      document.getElementById("cursor").style.opacity = 0;
      document.getElementById("shuri").style.opacity = 1;
      loadRequest({
        'selecteds': JSON.stringify(this.state.player.selected),
        'action': 'requestQuick'
      }, this);
    }
  }

  clickPrivate() {
    if (this.state.var_ready && this.state.var_loading == false) {
      var click = document.getElementById("click");
      click.volume = parseInt(localStorage.getItem("game_volume"))/100;
      click.play();
      this.setState({
        pb: true
      });
    }
  }

  clickLogout() {
    var click = document.getElementById("click");
    click.volume = parseInt(localStorage.getItem("game_volume"))/100;
    click.play();
    document.getElementById("cursor").style.opacity = 0;
    document.getElementById("shuri").style.opacity = 1;
    loadRequest({
      'logout': 1,
      'action': 'startSelection'
    }, this);
    this.setState({
      var_selected_c: null,
      var_selected_s: null,
      var_selecteds: [],
      username: '',
      password: '',
      rbattlelogin: "PLEASE ENTER YOU USERNAME AND PASSWORD BELOW TO START PLAYING.",
      loginerror: ''
    });
  }

  menu() {
    var men = [];

    if (this.state.var_ready) {
      men.push( /*#__PURE__*/React.createElement("div", {
        className: "menu"
      }, /*#__PURE__*/React.createElement("ul", null, /*#__PURE__*/React.createElement("li", {
        onClick: () => this.clickLogout()
      }, /*#__PURE__*/React.createElement("img", {
        src: "../images/selection/logout.png"
      })), /*#__PURE__*/React.createElement("li", {
        onClick: () => this.clickLadder()
      }, /*#__PURE__*/React.createElement("img", {
        src: "../images/selection/ladder.png"
      })), /*#__PURE__*/React.createElement("li", {
        onClick: () => this.clickQuick(),
        style: {
          marginLeft: "3px"
        }
      }, /*#__PURE__*/React.createElement("img", {
        src: "../images/selection/quick.png"
      })), /*#__PURE__*/React.createElement("li", {
        onClick: () => this.clickPrivate(),
        style: {
          marginLeft: "2px"
        }
      }, /*#__PURE__*/React.createElement("img", {
        src: "../images/selection/private.png"
      })))));
    } else {
      men.push( /*#__PURE__*/React.createElement("div", {
        className: "menu"
      }, /*#__PURE__*/React.createElement("ul", null, /*#__PURE__*/React.createElement("li", {
        onClick: () => this.clickLogout()
      }, "                                       ", /*#__PURE__*/React.createElement("img", {
        src: "../images/selection/logout.png"
      })), /*#__PURE__*/React.createElement("li", {
        style: {
          opacity: 0.6,
          marginLeft: "-3px"
        }
      }, "                 ", /*#__PURE__*/React.createElement("img", {
        src: "../images/selection/ladder.png"
      })), /*#__PURE__*/React.createElement("li", {
        style: {
          opacity: 0.6,
          marginLeft: "3px"
        }
      }, /*#__PURE__*/React.createElement("img", {
        src: "../images/selection/quick.png"
      })), /*#__PURE__*/React.createElement("li", {
        style: {
          opacity: 0.6,
          marginLeft: "2px"
        }
      }, /*#__PURE__*/React.createElement("img", {
        src: "../images/selection/private.png"
      })))));
    }

    return men;
  }

  arrow_left() {
    var click = document.getElementById("click");
    click.volume = parseInt(localStorage.getItem("game_volume"))/100;
    click.play();
    var pag = this.state.page;

    if (pag == 0) {
      pag = this.state.var_total_groups;
    } else {
      pag--;
    }

    this.setState({
      page: pag
    });
  }

  arrow_right() {
    var click = document.getElementById("click");
    click.volume = parseInt(localStorage.getItem("game_volume"))/100;
    click.play();
    var pag = this.state.page;

    if (pag == this.state.var_total_groups) {
      pag = 0;
    } else {
      pag++;
    }

    this.setState({
      page: pag
    });
  }

  handleChange(event) {
    this.setState({
      oppname: event.target.value
    });
  }

  handleChangeUser(event) {
    this.setState({
      username: event.target.value
    });
  }

  handleChangePass(event) {
    this.setState({
      password: event.target.value
    });
  }

  search() {
    var se = [];
    var load = [];

    if (this.state.rbattle != null) {
      if (this.state.startmatch == null) {
        load.push( /*#__PURE__*/React.createElement("div", {
          className: "lds-hourglass"
        }));
        load.push( /*#__PURE__*/React.createElement("div", {
          onClick: () => this.clickCancel(),
          className: "btncancel"
        }, /*#__PURE__*/React.createElement("span", null, "CANCEL")));
      } else if (this.state.startmatch == 2) {
        load.push( /*#__PURE__*/React.createElement("div", {
          className: "lds-hourglass2"
        }));
        load.push( /*#__PURE__*/React.createElement("div", {
          className: "rbat"
        }, /*#__PURE__*/React.createElement("span", null, this.state.rbattle2)));
      } else if (this.state.startmatch == 3) {
        load.push( /*#__PURE__*/React.createElement("img", {
          src: ingameimages.lostc
        }));
        load.push( /*#__PURE__*/React.createElement("div", {
          onClick: () => this.okCancelled(),
          className: "btncancel"
        }, /*#__PURE__*/React.createElement("span", null, "OK")));
      }

      se.push( /*#__PURE__*/React.createElement("div", {
        className: "display"
      }));
      se.push( /*#__PURE__*/React.createElement("div", {
        className: "holder holdanime"
      }, /*#__PURE__*/React.createElement("span", {
        className: "rbattle"
      }, this.state.rbattle), load));
    } else if (this.state.pb) {
      se.push( /*#__PURE__*/React.createElement("div", {
        className: "display"
      }));
      se.push( /*#__PURE__*/React.createElement("div", {
        className: "holder holdanime"
      }, /*#__PURE__*/React.createElement("span", {
        className: "rbattle cori"
      }, "START PRIVATE BATTLE"), /*#__PURE__*/React.createElement("span", {
        className: "pbent"
      }, "ENTER YOUR OPPONENT'S NAME:"), /*#__PURE__*/React.createElement("input", {
        className: "pbtext",
        type: "text",
        value: this.state.oppname,
        onChange: this.handleChange,
        minLength: "3",
        maxLength: "16"
      }), /*#__PURE__*/React.createElement("div", {
        onClick: () => this.cancelPB(),
        className: "btncancel2"
      }, /*#__PURE__*/React.createElement("span", null, "CANCEL")), /*#__PURE__*/React.createElement("div", {
        onClick: () => this.okPB(),
        className: "btnok"
      }, /*#__PURE__*/React.createElement("span", null, "OK")), load));
    } else if (this.state.notlogged) {
      document.getElementById("cursor").style.opacity = 1;
      document.getElementById("shuri").style.opacity = 0;
      se.push( /*#__PURE__*/React.createElement("div", {
        className: "holder holdanime"
      }, /*#__PURE__*/React.createElement("span", {
        className: "rbattlelogin"
      }, this.state.rbattlelogin), /*#__PURE__*/React.createElement("label", {
        className: "lusername"
      }, "USERNAME: "), /*#__PURE__*/React.createElement("input", {
        className: "usertext",
        type: "text",
        value: this.state.username,
        onChange: this.handleChangeUser,
        minLength: "3",
        maxLength: "16"
      }), /*#__PURE__*/React.createElement("label", {
        className: "lpassword"
      }, "PASSWORD: "), /*#__PURE__*/React.createElement("input", {
        className: "passtext",
        type: "password",
        value: this.state.password,
        onChange: this.handleChangePass
      }), /*#__PURE__*/React.createElement("label", {
        className: "lerror"
      }, this.state.loginerror), /*#__PURE__*/React.createElement("div", {
        onClick: () => this.okLogin(),
        className: "btncancel"
      }, /*#__PURE__*/React.createElement("span", null, "OK")), load));
    }

    return se;
  }

  okLogin() {
    if (this.state.username.length > 2 && this.state.username.length < 17 && this.state.password.length > 0) {
      document.getElementById("cursor").style.opacity = 0;
      document.getElementById("shuri").style.opacity = 1;
      loadRequest({
        'username': this.state.username,
        'password': this.state.password,
        'action': 'checkifLoggedIn'
      }, this);
    }
  }

  okPB() {
    var click = document.getElementById("click");
    click.volume = parseInt(localStorage.getItem("game_volume"))/100;
    click.play();
    this.setState({
      var_loading: true
    });
    document.getElementById("cursor").style.opacity = 0;
    document.getElementById("shuri").style.opacity = 1;

    if (this.state.oppname.length > 2 && this.state.oppname.length <= 17) {
      loadRequest({
        'oppname': this.state.oppname,
        'selecteds': JSON.stringify(this.state.player.selected),
        'action': 'requestPrivate'
      }, this);
      return;
    }

    this.setState({
      var_loading: false
    });
    document.getElementById("cursor").style.opacity = 1;
    document.getElementById("shuri").style.opacity = 0;
  }

  cancelPB() {
    var click = document.getElementById("click");
    click.volume = parseInt(localStorage.getItem("game_volume"))/100;
    click.play();
    this.setState({
      pb: false,
      oppname: ''
    });
  }

  clickCancel() {
    var click = document.getElementById("click");
    click.volume = parseInt(localStorage.getItem("game_volume"))/100;
    click.play(); // console.log("cancelado");

    this.setState({
      var_loading: true
    });
    document.getElementById("cursor").style.opacity = 0;
    document.getElementById("shuri").style.opacity = 1;
    clearInterval(theInterval);
    loadRequest({
      'action': 'cancelRequest'
    }, this);
  }

  okCancelled() {
    var click = document.getElementById("click");
    click.volume = parseInt(localStorage.getItem("game_volume"))/100;
    click.play();
    this.setState({
      rbattle: null,
      startmatch: null
    });
    clearInterval(theInterval);
  }

  render() {
    if (this.state.isLoaded && !this.state.notlogged) {
      return /*#__PURE__*/React.createElement("div", {
        className: "mc_custom"
      }, /*#__PURE__*/React.createElement("audio", {
        id: "click"
      }, /*#__PURE__*/React.createElement("source", {
        src: "../Sounds/click.mp3",
        type: "audio/mpeg"
      })), /*#__PURE__*/React.createElement("audio", {
        id: "perg"
      }, /*#__PURE__*/React.createElement("source", {
        src: "../Sounds/perg2.mp3",
        type: "audio/mpeg"
      })), /*#__PURE__*/React.createElement("audio", {
        id: "pergc"
      }, /*#__PURE__*/React.createElement("source", {
        src: "../Sounds/perg.mp3",
        type: "audio/mpeg"
      })), /*#__PURE__*/React.createElement("audio", {
        id: "found"
      }, /*#__PURE__*/React.createElement("source", {
        src: "../Sounds/found.mp3",
        type: "audio/mpeg"
      })), this.state.player.background == undefined && /*#__PURE__*/React.createElement("img", {
        src: "../images/selection/bg.jpg"
      }), this.state.player.background != undefined && /*#__PURE__*/React.createElement("img", {
        src: this.state.player.background
      }), this.topo(), this.menu(), /*#__PURE__*/React.createElement("div", {
        className: "mask"
      }, /*#__PURE__*/React.createElement("div", {
        className: "rodape"
      }, /*#__PURE__*/React.createElement("ul", null, this.pers()), /*#__PURE__*/React.createElement("div", {
        className: "perfil"
      }, /*#__PURE__*/React.createElement("img", {
        className: "avatar borda",
        src: this.state.player.avatar
      }), /*#__PURE__*/React.createElement("div", {
        className: "texto",
        dangerouslySetInnerHTML: {
          __html: this.state.player.playertext
        }
      })), /*#__PURE__*/React.createElement("div", {
        className: "selecionados"
      }, /*#__PURE__*/React.createElement(SortableComponent, {
        self: this
      })), /*#__PURE__*/React.createElement("div", {
        className: "texto_selecionados"
      }, this.countselecteds()))), /*#__PURE__*/React.createElement("div", {
        className: "pergrodape"
      }), /*#__PURE__*/React.createElement("div", {
        onClick: () => this.arrow_left(),
        className: "arrow_left"
      }), /*#__PURE__*/React.createElement("div", {
        onClick: () => this.arrow_right(),
        className: "arrow_right"
      }), this.search());
    } else {
      return /*#__PURE__*/React.createElement("div", {
        className: "mc_custom"
      }, /*#__PURE__*/React.createElement("img", {
        src: "../images/selection/bg.jpg"
      }), this.search());
    }
  }

} // ========================================


ReactDOM.render( /*#__PURE__*/React.createElement(Game, null), document.getElementById('root'));