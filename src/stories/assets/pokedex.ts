import capitalize from 'lodash/capitalize';

export const getNameFromSlug = (slug: string) => {
	return slug
		.split('_')
		.map((x) => capitalize(x))
		.join(' ');
};

export interface PokedexInterface {
	id: number;
	Name: string;
	biometrics?: {
		Height: number;
		Weight: number;
	};
	Description?: string;
	Category?: string;
	nationality?: string;
	Abilities?: string[];
	pokedex_number?: number;
	caught?: boolean;
}

export default [
	{
		id: 1,
		Name: 'Bulbasaur',
		biometrics: {
			Height: 0.7,
			Weight: 6.9,
		},
		Description:
			"Bulbasaur can be seen napping in bright sunlight. There is a seed on its back. By soaking up the sun's rays, the seed grows progressively larger.",
		Category: 'Seed',
		nationality: 'chinese',
		Abilities: ['Overgrow'],
		pokedex_number: 1,
		caught: true,
	},
	{
		id: 2,
		Name: 'Ivysaur',
		biometrics: {
			Height: 1,
			Weight: 13,
		},
		Description:
			"There is a bud on this Pokemon's back. To support its weight, Ivysaur's legs and trunk grow thick and strong. If it starts spending more time lying in the sunlight, it's a sign that the bud will bloom into a large flower soon.",
		Category: 'Seed',
		nationality: 'chinese',
		Abilities: ['Overgrow'],
		pokedex_number: 2,
		caught: false,
	},
	{
		id: 3,
		Name: 'Venusaur',
		biometrics: {
			Height: 2,
			Weight: 100,
		},
		Description:
			"There is a large flower on Venusaur's back. The flower is said to take on vivid colors if it gets plenty of nutrition and sunlight. The flower's aroma soothes the emotions of people.",
		Category: 'Seed',
		nationality: 'italian',
		Abilities: ['Overgrow'],
		pokedex_number: 3,
		caught: false,
	},
	{
		id: 4,
		Name: 'Charmander',
		biometrics: {
			Height: 0.6,
			Weight: 8.5,
		},
		Description:
			'The flame that burns at the tip of its tail is an indication of its emotions. The flame wavers when Charmander is enjoying itself. If the Pokemon becomes enraged, the flame burns fiercely.',
		Category: 'Lizard',
		nationality: 'french',
		Abilities: ['Blaze'],
		pokedex_number: 4,
		caught: false,
	},
	{
		id: 5,
		Name: 'Charmeleon',
		biometrics: {
			Height: 1.1,
			Weight: 19,
		},
		Description:
			'Charmeleon mercilessly destroys its foes using its sharp claws. If it encounters a strong foe, it turns aggressive. In this excited state, the flame at the tip of its tail flares with a bluish white color.',
		Category: 'Flame',
		nationality: 'greek',
		Abilities: ['Blaze'],
		pokedex_number: 5,
		first_seen: '2012-01-01T14:43:02.000Z',
		caught: false,
	},
	{
		id: 6,
		Name: 'Charizard',
		biometrics: {
			Height: 1.7,
			Weight: 90.5,
		},
		Description:
			'Charizard flies around the sky in search of powerful opponents. It breathes fire of such great heat that it melts anything. However, it never turns its fiery breath on any opponent weaker than itself.',
		Category: 'Flame',
		nationality: 'south_african',
		Abilities: ['Blaze'],
		first_seen: '2013-04-17T14:43:02.000Z',
		pokedex_number: 6,
		caught: false,
		Tag: [
			{
				tag_name: 'rarity',
				tag_value: '10',
			},
			{
				tag_name: 'region',
				tag_value: 'Kanto',
			},
		],
	},
	{
		id: 7,
		Name: 'Squirtle',
		biometrics: {
			Height: 0.5,
			Weight: 9,
		},
		Description:
			"Squirtle's shell is not merely used for protection. The shell's rounded shape and the grooves on its surface help minimize resistance in water, enabling this Pokemon to swim at high speeds.",
		Category: 'Tiny Turtle',
		nationality: 'georgian',
		Abilities: ['Torrent'],
		pokedex_number: 7,
		first_seen: '2017-11-03T08:49:26.961Z',
		caught: false,
		Tag: [
			{
				tag_name: 'rarity',
				tag_value: '5',
			},
			{
				tag_name: 'region',
				tag_value: 'Johto',
			},
		],
	},
	{
		id: 8,
		Name: 'Wartortle',
		biometrics: {
			Height: 1,
			Weight: 22.5,
		},
		Description:
			"Its tail is large and covered with a rich, thick fur. The tail becomes increasingly deeper in color as Wartortle ages. The scratches on its shell are evidence of this Pokemon's toughness as a battler.",
		Category: 'Turtle',
		nationality: 'polish',
		Abilities: ['Torrent'],
		pokedex_number: 8,
		caught: false,
	},
	{
		id: 9,
		Name: 'Blastoise',
		biometrics: {
			Height: 1.6,
			Weight: 85.5,
		},
		Description:
			'Blastoise has water spouts that protrude from its shell. The water spouts are very accurate. They can shoot bullets of water with enough accuracy to strike empty cans from a distance of over 160 feet.',
		Category: 'Shellfish',
		nationality: 'new_zealand',
		Abilities: ['Torrent'],
		pokedex_number: 9,
		caught: false,
	},
	{
		id: 10,
		Name: 'Caterpie',
		biometrics: {
			Height: 0.3,
			Weight: 2.9,
		},
		Description:
			'Caterpie has a voracious appetite. It can devour leaves bigger than its body right before your eyes. From its antenna, this Pokémon releases a terrifically strong odor.',
		Category: 'Worm',
		nationality: 'croatian',
		Abilities: ['Shield Dust'],
		pokedex_number: 10,
		caught: true,
	},
	{
		id: 11,
		Name: 'Staryu',
		biometrics: {
			Height: 0.8,
			Weight: 34.5,
		},
		Description:
			"Staryu's center section has an organ called the core that shines bright red. If you go to a beach toward the end of summer, the glowing cores of these Pokémon look like the stars in the sky.",
		Category: 'Star Shape',
		nationality: 'english',
		Abilities: ['Natural Cure', 'Illuminate'],
		pokedex_number: 120,
		caught: true,
	},
];
