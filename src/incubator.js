/** @jsx React.DOM */
var CornerCell = React.createClass({
	render: function() {
		var total = this.props.total;
		return (
			<th>
				<div>To ></div>
				<div>From</div>
				<div className="total-xp">{total.xp} XP</div>
				<Skills finished={total.finished} total={total.total} gold={total.gold} date={total.date}/>
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
		var date = '';
		if (this.props.date) {
			date = new Date(this.props.date);
			date = date.getDate() + '-' + (date.getMonth() + 1) + '-' + date.getFullYear();
		}

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
				<div className="progress" style={styles} title={date + ' ' + goldP + '% ' + finishedP + '%'}>
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
		var course = this.props.course || {};

		var className = '';
		if (from == to) {
			className = 'impossible';
		} else if (course.phase) {
			className = 'phase' + course.phase;
		}
		if (this.state.highlighted) {
			className += ' highlighted';
		}
		if (course.finished && course.finished === course.total) {
			className += ' owl owl-' + to;
		}

		var percentage;
		if (course.phase === 1) {
			percentage = <div className="percentage">{2 * Math.round(course.progress)}%</div>
		}
		var learners;
		if (course.learner_count) {
			learners = <div className="learners">{course.learner_count.learner_string}</div>
		}
		var words;
		if (course.words) {
			words = <div className="words">{course.words}w</div>
		}

		return (
			<td onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave} className={className}>
				<a href={'http://incubator.duolingo.com/courses/' + to + '/' + from + '/status'}>
					{percentage}
					{learners}
					<Skills finished={course.finished} total={course.total} gold={course.gold} date={course.date}/>
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
		var to = {}
		var percent = 0;
		if (this.props.to) {
			to = this.props.to;
			percent = Math.floor(to.currentXp / to.ceilXp * 100);
		}
		var style = {
			backgroundImage: 'linear-gradient(to right, #FFC200 0%, #FFC200 ' + percent + '%, transparent ' + (percent)+ '%, transparent 100%)',
		};

		return (
			<th>
				<div className={'flag flag-' + lang} title={lang}></div>
				<div>{to.totalXp} XP</div>
				<div>Level {to.currentLevel}</div>
				<div className="progress" style={style}>{to.currentXp}/{to.ceilXp}</div>
			</th>
		);
	}
});

var FlagsRow = React.createClass({
	render: function() {
		var tos = this.props.tos;
		var flagCells = this.props.langs.map(function(lang) {
			return <TopFlagCell key={lang} lang={lang} to={tos[lang]}/>
		});
		return (
			<tr className="flags-row">
				<CornerCell total={this.props.total}/>
				{flagCells}
			</tr>
		);
	}
});

var Row = React.createClass({
	render: function() {
		var from = this.props.lang;
		var courses = this.props.courses;
		var cells = this.props.langs.map(function(to) {
			var course;
			if (courses[from] && courses[from][to]) {
				course = courses[from][to];
			}
			return <Cell key={from + to} from={from} to={to} course={course}/>
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
		var coursesCount = this.props.total.coursesCount;
		return (
			<div className="legend">{courses}/{coursesCount} courses</div>
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
		var courses = this.props.courses;
		var rows = langs.map(function(lang) {
			return <Row key={lang} lang={lang} langs={langs} courses={courses}/>
		});
		var phasesD = this.props.total.phases;
		var phases = Object.keys(phasesD).map(function(phase) {
			return <Phase key={phase} phase={phase} courses={phasesD[phase]}/>
		});
		return (
			<div>
				<table>
					<FlagsRow langs={langs} tos={this.props.tos} levels={this.props.levels} total={this.props.total}/>
					{rows}
				</table>
				<GridLegend langs={langs} courses={courses} combos={this.props.combos} total={this.props.total}/>
				{phases}
			</div>
		);
	}
});

React.renderComponent(
	<Grid langs={languages} courses={courses} tos={tos} combos={data.directions} total={total}/>,
	document.body
);
