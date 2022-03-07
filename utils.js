export const utils = {
	// Prints shoting percentage
	pct: (a, b) =>  a !== 0 ? Math.round((a / b * 100) * 10) / 10 : 0,
	// Transforms player name from Euroleague Feed
	elPlayerName: (str) => {
		let name = str.split(', ')[1].toLowerCase();
		name = name.charAt(0).toUpperCase() + name.slice(1);
		let last = str.split(', ')[0].toLowerCase();
		last = last.charAt(0).toUpperCase() + last.slice(1);
		return `${name} ${last}`
	},
	// Transforms Team name from Euroleague Feed
	elTeamName: (str) => str.toLowerCase().split(' ').map( w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}
