/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {LitElement, html, css} from 'lit';
import {utils} from './utils';

/**
 * An example element.
 *
 * @fires count-changed - Indicates when the count changes
 * @slot - This element has a slot
 * @csspart button - The button
 */
export class BasketballBoxscore extends LitElement {
	static get styles() {
		return css`
			:host {
				display: block;
				border: solid 1px gray;
				padding: 16px;
			}
			table {
				width: 100%;
			}
			td:first-child {
				width: 200px;
				display: block;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}
			td:not(:first-child) {
				text-align: right;
			}
		`;
	}

	static get properties() {
		return {
			/**
			 * The URL of the JSON source data
			 * @type {string}
			 */
			src: {type: String},
			
			/**
			 * The league identifier to get the src of the JSON feed
			 * Available pptions: 'nba', 'euroleague'
			 * @type {string}
			 */
			league: {type: String},

			/**
			 * The date of the game to get the JSON feed
			 * Needed for the NBA legue
			 * format YYYYMMDD
			 * @type {string} 
			 */
			date: {type: String},

			/**
			 * Unique identifier of the game
			 * For NBA games 10 numbers
			 * For Euroleague games 3 numbers
			 * @type {string}
			 */
			gameId: {type: String},

			/**
			 * Season code for euroleague games
			 * Usually an 'E' followed by the year the league started
			 * @type {string}
			 */
			seasonCode: {type: String},

			/**
			 * The raw JSON data from NBA or Euroleague API
			 * @type {object}
			 */
			data: {type: Object},
			
			/**
			 * The status of the data of the component.
			 * Used to display error messages
			 * @type {string}
			 */
			dataStatus: {type: String},

			/**
			 * Is the game live?
			 * @type {boolean}
			 */
			isLive: {type: Boolean},

			/**
			 * Is the game finished?
			 * The game could be in 'PRE' status
			 * @type {boolean}
			 */
			isFinished: {type: Boolean},

			/**
			 * Home team props
			 * @type {object}
			 */
			home: {type: Object},

			/**
			 * Visiting team props
			 * @type {object}
			 */
			visitor: {type: Object}

		};
	}

	constructor() {
		super();
		this.src = '';
		this.data = null;
		this.dataStatus = 'no-data';
		this.isLive = false;
		this.isFinished = true;
		this.league = 'none';
		this.home = {};
		this.visitor = {};
	}

	playerRowTpl(player) {
		return html `
			<tr>
				<td>
				${this.isLive && player.isPlaying || this.isFinished && player.isStarter
					? html `${player.jerseyNumber}. <strong>${player.name}</strong>`
					: html `${player.jerseyNumber}. ${player.name}`
				}
				</td>
				<td>${player.minutes} </td>
				<td>${player.points}</td>
				<td>${player.fgm} </td>
				<td>${player.fga} </td>
				<td>${utils.pct(player.fgm, player.fga)} </td>
				<td>${player.thpm} </td>
				<td>${player.thpa} </td>
				<td>${utils.pct(player.thpm, player.thpa)}</td>
				<td>${player.ftm} </td>
				<td>${player.fta} </td>
				<td>${utils.pct(player.ftm, player.fta)}</td>
				<td>${player.rebounds}</td>
				<td>${player.defRebounds}</td>
				<td>${player.offRebounds}</td>
				<td>${player.assists}</td>
				<td>${player.steals} </td>
				<td>${player.blocks} </td>
				<td>${player.turnovers} </td>
				<td>${player.fouls}</td>
				<td>${player.plusMinus}</td>
			</tr>
		`
	}

	tableHeaderTpl() {
		return html `<thead>
			<tr>
				<th>Player</th>
				<th>Min</th>
				<th>Pts</th>
				<th>Fgm</th>
				<th>Fga</th> 
				<th>FG%</th>
				<th>3pm</th>
				<th>3pa</th>
				<th>3p%</th>
				<th>Ftm</th>
				<th>Fta</th>
				<th>Ft%</th>
				<th>Reb</th>
				<th>Dreb</th>
				<th>Oreb</th>
				<th>Ast</th>
				<th>Stl</th>
				<th>Blk</th>
				<th>To</th>
				<th>PF</th>
				<th>+/- </th>
			</tr>
		</thead>
		`
	}

	render() {
		if (!this.data) {
			return html`
				<p>Cargando...</p>
			`;
		}
		return html`
			<p>${this.home.name} <span class="score">${this.home.score}</span> | <span class="score">${this.visitor.score}</span> ${this.visitor.name} </p>
			<table cellpadding="4">
				${this.tableHeaderTpl()}
				<tbody>
					${this.home.players.map( player => {
							if (player.minutes !== '00:00') {
								return this.playerRowTpl(player)
							}
					})}
				</tbody>
				<tfoot>
					${this.playerRowTpl(this.home.totals)}
				</tfoot>
			</table>
			<br>
			<table cellpadding="4">
				${this.tableHeaderTpl()}
				<tbody>
					${this.visitor.players.map( player => {
							if (player.minutes !== '00:00') {
								return this.playerRowTpl(player)
							}
					})}
				</tbody>
				<tfoot>
					${this.playerRowTpl(this.visitor.totals)}
				</tfoot>
			</table>
		`;
	}

	async connectedCallback() {
		super.connectedCallback();
		// Get the data source
		// SRC attribute has not been set
		if (!this.src.length > 0) {
			if (this.league.toLowerCase() === 'nba') {
				if (this.date && this.gameId) {
					this.src = `https://data.nba.net/json/cms/noseason/game/${this.date}/${this.gameId}/boxscore.json`;
					await this._fetchData()
				} else {
					// Error message: date & Id of the game are needed
				}
			} else if (this.league.toLowerCase() === 'euroleague') {
				if (this.seasonCode && this.gameId) {
					this.src = `https://live.euroleague.net/api/Boxscore?gamecode=${this.gameId}&seasoncode=${this.seasonCode}`;
					await this._fetchData()
				} else {
					// Error message: seasonCode & gameID are needed
				}
			} else {
				// Get internal data
				// Check if the component has an internal script tag whith JSON data
				try {
					const children = this.children;
					for (let child of children) {
						if (child.tagName === 'SCRIPT' && child.type === 'application/json') {
							this.data = JSON.parse(this.children[0].innerHTML);
							this._transformData()
						}
					}
				}

				catch(ex) {
					console.error(ex)
				}
			}
		} else {
			// SRC attribute has ben set
			await this._fetchData()
		}
		
	}


	async _fetchData() {
		const fetchHeaders = new Headers({
			Accept: 'application/json'
		})

		const fetchOptions = {
			cache: 'default',
			headers: fetchHeaders,
			method: 'GET',
			mode: 'cors'
		}
		
		if (this.src.length > 0) {
			const res = await fetch(this.src, fetchOptions);
			const _data = await res.json();
			
			if (res.ok) {
				this.data = _data;
				this._transformData();
			} else {
				this.data = new Error(_data);
			}

		} else {
			return
		}
	}

	_transformData() {
		let feedType;
		
		switch (true) {
			case this.src.includes('nba.net'):
				feedType = 'nba';
				break;
			case this.src.includes('euroleague.net'):
				feedType = 'euroleague';
				break;
			default:
				feedType = 'own';
				break;
		}

		if (feedType === 'nba') {
			const _game = this.data.sports_content.game;
			// Game status: 1 Pre | 2 Live | 3 False
			this.isLive = _game.period_time.game_status == 2 ? true : false;
			this.isFinished = _game.period_time.game_status == 3 ? true : false;

			if (this.isLive || this.isFinished) {
				this.visitor.name = `${_game.visitor.city}  ${_game.visitor.nickname}`;
				this.home.name = `${_game.home.city} ${_game.home.nickname}`;
				this.home.score = parseInt(_game.home.score);
				this.visitor.score = parseInt(_game.visitor.score);
				let _homePlayers = _game.home.players.player;
				let _visitorPlayers = _game.visitor.players.player;
				this.home.players = _homePlayers.map( p => this._mapNBAStats(p));
				this.visitor.players = _visitorPlayers.map( p => this._mapNBAStats(p));
				this.home.totals = this._mapNBAStats(_game.home.stats);
				this.visitor.totals = this._mapNBAStats(_game.visitor.stats);
			}

		} else if (feedType === 'euroleague') {
			this.isLive = this.data.Live;
			this.isFinished = !this.data.Live;
			const _game = this.data.Stats;

			this.home.name = utils.elTeamName(_game[0].Team);
			this.visitor.name = utils.elTeamName(_game[1].Team);
			this.home.score = _game[0].totr.Points;
			this.visitor.score = _game[1].totr.Points;
			this.home.players = _game[0].PlayersStats.map( p => this._mapEuroleagueStats(p));
			this.visitor.players = _game[1].PlayersStats.map( p => this._mapEuroleagueStats(p));
			this.home.totals = this._mapEuroleagueStats(_game[0].totr);
			this.visitor.totals = this._mapEuroleagueStats(_game[1].totr)

		} else if (feedType === 'own') {
			Object.assign(this, this.data)
		}


	}

	_mapNBAStats(obj) {
		return {
			name: `${obj.first_name ? obj.first_name + ' ' + obj.last_name: 'totals'}`,
			jerseyNumber: obj.jersey_number ? obj.jersey_number : undefined,
			isStarter: obj.starting_position && obj.starting_position.length > 0 ? true : false,
			isPlaying: obj.on_court == 1 ? true : false,
			minutes: obj.minutes && `${obj.minutes.length == 1? obj.minutes.padStart(2,0): obj.minutes}:${obj.seconds.length == 1? obj.seconds.padStart(2,0): obj.seconds}`,
			points: parseInt(obj.points),
			fgm: parseInt(obj.field_goals_made),
			fga: parseInt(obj.field_goals_attempted),
			thpm: parseInt(obj.three_pointers_made),
			thpa: parseInt(obj.three_pointers_attempted),
			twpm: parseInt(obj.field_goals_made) - parseInt(obj.three_pointers_made),
			twpa: parseInt(obj.field_goals_attempted) - parseInt(obj.three_pointers_attempted),
			ftm: parseInt(obj.free_throws_made),
			fta: parseInt(obj.free_throws_attempted),
			rebounds: parseInt(obj.rebounds_offensive) + parseInt(obj.rebounds_defensive) + (obj.team_rebounds ? parseInt(obj.team_rebounds) : 0),
			offRebounds: parseInt(obj.rebounds_offensive),
			defRebounds: parseInt(obj.rebounds_defensive),
			assists: parseInt(obj.assists),
			steals: parseInt(obj.steals),
			turnovers: parseInt(obj.turnovers),
			blocks: parseInt(obj.blocks),
			blocksAgainst: null,
			plusMinus: obj.plus_minus && parseInt(obj.plus_minus),
			fouls: parseInt(obj.fouls),
			foulsReceived: null,
			pir: null
		}
	}

	_mapEuroleagueStats(obj) {
		return {
			name: obj.Player ? utils.elPlayerName(obj.Player) : 'totals',
			jerseyNumber: obj.Dorsal ? obj.Dorsal : undefined,
			isStarter: obj.IsStarter && obj.IsStarter === 1? true : false,
			isPlaying: obj.isPlaying && obj.IsPlaying === 1? true : false,
			minutes: obj.Minutes,
			points: obj.Points,
			fgm: obj.FieldGoalsMade2 + obj.FieldGoalsMade3,
			fga: obj.FieldGoalsAttempted2 + obj.FieldGoalsAttempted3,
			thpm: obj.FieldGoalsMade3,
			thpa: obj.FieldGoalsAttempted3,
			twpm: obj.FieldGoalsMade2,
			twpa: obj.FieldGoalsAttempted2,
			ftm: obj.FreeThrowsMade,
			fta: obj.FreeThrowsAttempted,
			rebounds: obj.TotalRebounds,
			offRebounds: obj.OffensiveRebounds,
			defRebounds: obj.DefensiveRebounds,
			assists: obj.Assistances,
			steals: obj.Steals,
			turnovers: obj.Turnovers,
			blocks: obj.BlocksFavour,
			blocksAgainst: obj.BlocksAgainst,
			plusMinus: null,
			fouls: obj.FoulsCommited,
			foulsReceived: obj.FoulsReceived,
			pir: obj.Valuation
		}
	}

}

window.customElements.define('basketball-boxscore', BasketballBoxscore);