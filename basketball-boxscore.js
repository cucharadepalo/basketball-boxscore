/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {LitElement, html, css} from 'lit';

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
			 * The raw JSON data from NBA or Euroleague API
			 * @type {object}
			 */
			data: {type: Object},

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
		this.isLive = false;
		this.home = {};
		this.visitor = {};
	}

	playerRowTpl(player) {
		return html `
			<tr>
				<td>
				${this.isLive && player.isPlaying || this.isFinished && player.isStarter
					? html `<strong>${player.name}</strong>`
					: html `${player.name}`
				}
				</td>
				<td>${player.minutes} </td>
				<td>${player.points}</td>
				<td>${player.fgm} </td>
				<td>${player.fga} </td>
				<td>${this.utils.pct(player.fgm, player.fga)} </td>
				<td>${player.thpm} </td>
				<td>${player.thpa} </td>
				<td>${this.utils.pct(player.thpm, player.thpa)}</td>
				<td>${player.ftm} </td>
				<td>${player.fta} </td>
				<td>${this.utils.pct(player.ftm, player.fta)}</td>
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
		await this._fetchData()
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

	utils = {
		pct: (a, b) =>  a !== 0 ? Math.round((a / b * 100) * 10) / 10 : 0
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

				console.log({home: this.home.players, totals: this.home.totals, visitor: this.visitor.players})
			}

		} else if (feedType === 'euroleague') {
			console.log('Es un partido de Euroleague');

		}

	}

	_mapNBAStats(obj) {
		return {
			name: `${obj.first_name ? obj.first_name + ' ' + obj.last_name: 'totals'}`,
			jersey_number: obj.jersey_number ? obj.jersey_number : undefined,
			isStarter: obj.starting_position && obj.starting_position.length > 0 ? true : false,
			isPlaying: obj.on_court == 1 ? true : false,
			minutes: obj.minutes && `${obj.minutes.length == 1? obj.minutes.padStart(2,0): obj.minutes}:${obj.seconds.length == 1? obj.seconds.padStart(2,0): obj.seconds}`,
			seconds: obj.seconds,
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
			plusMinus: obj.plus_minus && parseInt(obj.plus_minus),
			fouls: parseInt(obj.fouls)
		}
	}

}

window.customElements.define('basketball-boxscore', BasketballBoxscore);
