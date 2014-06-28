/** @jsx React.DOM */
var CornerCell = React.createClass({
	render: function() {
		var totalXp = 0;
		Object.keys(tos).forEach(function(country) {
			totalXp += +tos[country];
		});
		return (
			<th>
				<div>To ></div>
				<div>From</div>
				<div className="total-xp">{totalXp} XP</div>
			</th>
		);
	}
});

var Skills = React.createClass({
	render: function() {
		var total = this.props.total;
		if (!total) {
			return <div className="skills"></div>
		}
		var date = new Date(this.props.date);
		date = date.getDate() + '-' + (date.getMonth() + 1) + '-' + date.getFullYear();

		var gold = this.props.gold;
		var finished = this.props.finished;
		var color = total == finished ? '#1493D1' : '#1493D1';

		var goldP = Math.floor(gold / total * 100);
		var finishedP = Math.floor(finished / total * 100);

		var goldS = '#FFC200 0%, #FFC200 ' + goldP + '%';
		var finishedS = color + ' ' + goldP + '%, ' + color + ' ' + finishedP + '%, transparent ' + finishedP + '%';
		var styles = {
			backgroundImage: 'linear-gradient(to right, ' + goldS + ', ' + finishedS +', transparent 100%)',
			height: '12px'
		};

		gold = gold ? (<span className="gold">{gold}</span>) : '';
		return (
			<div className="skills">
				<div className="progress" style={styles} title={date}>
				</div>
				{gold} {finished} / {total}
			</div>
		);
	}
});

var Cell = React.createClass({
	getCombo: function() {
		if (this.props.from <= this.props.to) {
			return this.props.from + this.props.to;
		}
		return this.props.to + this.props.from;
	},
	handleMouseEnter: function() {
		var event = new CustomEvent('cellEnter', {
			detail: {
				combo: this.getCombo()
			}
		});
		document.dispatchEvent(event);
	},
	handleMouseLeave: function() {
		var event = new CustomEvent('cellLeave', {
			detail: {
				combo: this.getCombo()
			}
		});
		document.dispatchEvent(event);
	},
	highlight: function(event) {
		if (event.detail.combo != this.getCombo())
			return;
		this.setState({
			highlighted: true
		});
	},
	unHighlight: function(event) {
		if (event.detail.combo != this.getCombo())
			return;
		this.setState({
			highlighted: false
		});
	},
	getInitialState: function() {
		return {
			highlighted: false
		};
	},
	componentDidMount: function() {
		document.addEventListener('cellEnter', this.highlight);
		document.addEventListener('cellLeave', this.unHighlight);
	},
	componentWillUnmount: function() {
		document.removeEventListener('cellEnter', this.highlight);
		document.removeEventListener('cellLeave', this.unHighlight);
	},
	render: function() {
		var from = this.props.from;
		var to = this.props.to;
		var dir = this.props.dir || {};

		var className = '';
		if (from == to) {
			className = 'impossible';
		} else if (dir.phase) {
			className = 'phase' + dir.phase;
		}
		if (this.state.highlighted) {
			className += ' highlighted';
		}
		if (dir.finished && dir.finished === dir.total) {
			className += ' owl owl-' + to;
		}

		var percentage;
		if (dir.phase === 1) {
			percentage = <div className="percentage">{2 * Math.round(dir.progress)}%</div>
		}
		var learners;
		if (dir.learner_count) {
			learners = <div className="learners">{dir.learner_count.learner_string}</div>
		}
		var words;
		if (dir.words) {
			words = <div className="words">{dir.words}w</div>
		}

		return (
			<td onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave} className={className}>
				<a href={'http://incubator.duolingo.com/courses/' + to + '/' + from + '/status'}>
					{percentage}
					{learners}
					<Skills finished={dir.finished} total={dir.total} gold={dir.gold} date={dir.date}/>
					{words}
				</a>
			</td>
		);
	}
});

var FlagCell = React.createClass({
	render: function() {
		var lang = this.props.lang;
		return (
			<th>
				<div className={'flag flag-' + lang} title={lang}></div>
			</th>
		);
	}
});

var TopFlagCell = React.createClass({
	render: function() {
		var lang = this.props.lang;
		return (
			<th>
				<div className={'flag flag-' + lang} title={lang}></div>
				<div>{this.props.xp} XP</div>
			</th>
		);
	}
});

var FlagsRow = React.createClass({
	render: function() {
		var xps = this.props.xps;
		var flagCells = this.props.langs.map(function(lang) {
			return <TopFlagCell key={lang} lang={lang} xp={xps[lang]}/>
		});
		return (
			<tr className="flags-row">
				<CornerCell xps={this.props.xps}/>
				{flagCells}
			</tr>
		);
	}
});

var Row = React.createClass({
	render: function() {
		var from = this.props.lang;
		var dirs = this.props.dirs;
		var cells = this.props.langs.map(function(to) {
			var dir;
			if (dirs[from] && dirs[from][to]) {
				dir = dirs[from][to];
			}
			return <Cell key={from + to} from={from} to={to} dir={dir}/>
		});
		return (
			<tr>
				<FlagCell lang={from}/>
				{cells}
			</tr>
		);
	}
});

var GridLegend = React.createClass({
	render: function() {
		var courses = Object.keys(this.props.combos).length;
		var total = this.props.langs.length * (this.props.langs.length - 1);
		return (
			<div className="legend">{courses}/{total} courses</div>
		);
	}
});

var Phase = React.createClass({
	render: function() {
		var className = 'legend phase' + this.props.phase;
		return (
			<div className={className}>{this.props.courses} courses in phase {this.props.phase}</div>
		);
	}
});

var Grid = React.createClass({
	render: function() {
		var langs = this.props.langs;
		var dirs = this.props.dirs;
		var rows = langs.map(function(lang) {
			return <Row key={lang} lang={lang} langs={langs} dirs={dirs}/>
		});
		var phasesD = this.props.phases;
		var phases = Object.keys(phasesD).map(function(phase) {
			return <Phase key={phase} phase={phase} courses={phasesD[phase]}/>
		});
		return (
			<div>
				<table>
					<FlagsRow langs={langs} xps={this.props.xps}/>
					{rows}
				</table>
				<GridLegend langs={langs} dirs={dirs} combos={this.props.combos}/>
				{phases}
			</div>
		);
	}
});

React.renderComponent(
	<Grid langs={languages} dirs={directions} xps={tos} combos={data.directions} phases={phases}/>,
	document.body
);
