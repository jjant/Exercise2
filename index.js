const yaml = require('js-yaml');
const fs = require('fs');
const dateFns = require('date-fns');
const ramda = require('ramda');

const loadLegislators = () => {
	return yaml.safeLoad(fs.readFileSync('./legislators-current.yaml', 'utf8'));
};

const isFemale = ({ gender }) => gender === 'F';

const isRep = ({ type }) => type === 'rep';

const isJanuary = date => dateFns.getMonth(date) === 0;

const yearsForTerm = ({ start, end }) => {
	const startDate = dateFns.parse(start);
	const endDate = dateFns.parse(end);

	const startYear = dateFns.getYear(startDate);
	const endYear = dateFns.getYear(endDate);

	const actualEndYear = isJanuary(endDate) ? endYear - 1 : endYear;

	return ramda.range(startYear, actualEndYear + 1);
};

// List (List Int)
const curatedReps = loadLegislators()
	.map(person => ({ gender: person.bio.gender, terms: person.terms }))
	.filter(isFemale)
	.map(person => person.terms.filter(isRep)) // [ [{start, end, ..}] ]
	.map(terms => terms.map(yearsForTerm)); // [ [1992, 1993], [1994]]

// const getFirstYearForRep = terms =>
// 	Math.min(terms.map(term => dateFns.getYear(dateFns.parse(term.start))));
//
// const getFirstYearForReps = reps => Math.min(...reps.map(getFirstYearForRep));

const getRepsCountPerYear = () => {
	const years = ramda.range(1983, 2019);

	const flattenedYears = ramda.flatten(curatedReps);

	// [{year: 1995, count: 150}]
	return years.map(year => ({
		year,
		count: flattenedYears.reduce((ac, y) => (y === year ? ac + 1 : ac), 0)
	})); // O(n^2)

	// Perhaps more performant
	// flattenedYears.reduce((ac, y) => ({...ac, [y]: ac[y] + 1}), {"2018": 0, "2017": 0,...})
};

const renderRepsCount = ({ year, count }) => `${year}: ${'#'.repeat(count)}`;

const display = years => years.map(renderRepsCount).join('\n');

console.log(display(getRepsCountPerYear()));
