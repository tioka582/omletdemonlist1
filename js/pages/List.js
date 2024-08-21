import { store } from '../main.js';
import { embed } from '../util.js';
import { score } from '../score.js';
import { fetchEditors, fetchList } from '../content.js';

import Spinner from '../components/Spinner.js';
import LevelAuthors from '../components/List/LevelAuthors.js';

const roleIconMap = {
	owner: 'crown',
	admin: 'user-gear',
	seniormod: 'user-shield',
	mod: 'user-lock',
	dev: 'code'
};

export default {
	components: { Spinner, LevelAuthors },
	template: `
        <main v-if="loading" class="surface">
            <Spinner></Spinner>
        </main>
        <main v-else class="page-list">
            <div class="list-container surface">
                <table class="list" v-if="list">
                    <tr v-for="([level, err], i) in list">
                        <td class="rank">
                            <p v-if="i + 1 <= 150" class="type-label-lg">#{{ i + 1 }}</p>
                            <p v-else class="type-label-lg">Legacy</p>
                        </td>
                        <td class="level" :class="{ 'active': selected == i, 'error': !level }">
                            <button @click="selected = i">
                                <span class="type-label-lg">{{ level?.name || \`Error (\${err}.json)\` }}</span>
                            </button>
                        </td>
                    </tr>
                </table>
            </div>
            <div class="level-container surface">
                <div class="level" v-if="level">
                    <h1>{{ level.name }}</h1>
                    <LevelAuthors :author="level.author" :creators="level.creators" :verifier="level.verifier"></LevelAuthors>
                    <div v-if="level.showcase" class="tabs">
                        <button class="tab type-label-lg" :class="{selected: !toggledShowcase}" @click="toggledShowcase = false">
                            <span class="type-label-lg">Verification video</span>
                        </button>
                        <button class="tab" :class="{selected: toggledShowcase}" @click="toggledShowcase = true">
                            <span class="type-label-lg">Showcase</span>
                        </button>
                    </div>
                    <iframe class="video" id="videoframe" :src="video" frameborder="0"></iframe>
                    <ul class="stats">
                        <li>
                            <div class="type-title-sm">Points for passing</div>
                            <p>{{ score(selected + 1, 100, level.percentToQualify) }}</p>
                        </li>
                        <li>
                            <div class="type-title-sm">Level ID</div>
                            <p>{{ level.id }}</p>
                        </li>
                        <li>
                            <div class="type-title-sm">Password</div>
                            <p>{{ level.password || 'Free to copy' }}</p>
                        </li>
                    </ul>
                    <h2>Records</h2>
                    <p v-if="selected + 1 <= 75"><strong>{{ level.percentToQualify }}%</strong> or more to qualify</p>
                    <p v-else-if="selected +1 <= 150"><strong>100%</strong> or more to qualify</p>
                    <p v-else>This level is not submitting new records.</p>
                    <table class="records">
                        <tr v-for="record in level.records" class="record">
                            <td class="percent">
                                <p>{{ record.percent }}%</p>
                            </td>
                            <td class="user">
                                <a :href="record.link" target="_blank" class="type-label-lg">{{ record.user }}</a>
                            </td>
                            <td class="mobile">
                                <img v-if="record.mobile" :src="\`/assets/phone-landscape\${store.dark ? '-dark' : ''}.svg\`" alt="Mobile">
                            </td>
                            <td class="hz">
                                <p>{{ record.hz }}hz</p>
                            </td>
                        </tr>
                    </table>
                </div>
                <div v-else class="level" style="height: 100%; justify-content: center; align-items: center;">
                    <p>(ノಠ益ಠ)ノ彡┻━┻</p>
                </div>
            </div>
            <div class="meta-container surface">
                <div class="meta">
                    <div class="errors" v-show="errors.length > 0">
                        <p class="error" v-for="error of errors">{{ error }}</p>
                    </div>
                    <template v-if="editors">
                        <h3>List Editors</h3>
                        <ol class="editors">
                            <li v-for="editor in editors">
                                <img :src="\`/assets/\${roleIconMap[editor.role]}\${(store.dark || store.shitty) ? '-dark' : ''}.svg\`" :alt="editor.role">
                                <a v-if="editor.link" class="type-label-lg link" target="_blank" :href="editor.link">{{ editor.name }}</a>
                                <p v-else>{{ editor.name }}</p>
                            </li>
                        </ol>
                    </template>
                    <h3> Rules </h3>
                    <p> Условное обозначение в виде знака вопроса означает, что конкретная информация об уровне уточняется. </p>
                    <p> Когда вы отправляете рекорд убедитесь что соблюдайте эти правила:</p>
                    <p> 1.0. Прохождение должно быть записано на запись. </p>
                    <p> 1.1. Должна быть сырая запись (Рау футаж) прохождения (нужно только для уровней сложности от Хард Демона). </p>
                    <p> 1.2. В видео должен быть показан эндскрин. </p>
                    <p> 1.3. На видео должны быть клики или тапы. </p>
                    <p> 1.4. Если есть Megahack или другое мод меню, должен быть FPS/TPS Counter (обязательно), Cheat Indicator (обязательно), Clock (обязательно). </p>
                    <p> 1.5. Рауфутаж должен быть загружен на Google Drive. </p>
                    <p> 1.6. Ограничения по физике - 480 TPS (На версии 2.2), для 2.1 - 360 FPS/TPS. </p>
                    <p> 1.7. Не используйте баги, сваг роуты и секрет веи. </p>
                    <p> 1.8 Не присылайте прогреcсы на облегчённых версиях лвлов. </p>
                    <p> 1.9 Должна присутствовать запись в 2 аудиодорожки. </p>
                    <p> 1.10 Сделав багфикс не предупредив об этом администраторов будет считаться как специальный нёрф уровня, что приведет к последующему бану в листе. </p>
                    <p> 1.11 LDM и ULDM версии уровней одобряются если это не влияет на сложность уровня, обнаружение модераторами нерфов в ваших версиях приведет к бану, даже если вы о них не знали. </p>
                    <p> 1.12 Текстур-Паки которые могут облегчить игру, к примеру отображать хитбоксы режимов игры, препятствий и так далее НЕ одобрены листом. </p>
                    <p> 1.13 2 Player уровни не вносятся. </p>
                    <p> 1.14 Альтернативные или твинк-аккаунты запрещены. </p>
                    <p> 1.15 Мод "Click Between Frames" разрешен. </p>
                    <p> 1.16 Запрещается использовать два или больше мод меню (рекомендуется использовать OpenHack или QOLMod). </p>
                    <p> </p>
                    <p> All credit goes to The Shitty list & WEGDPS List. GGDL is not affiliated with The Shitty list & WEGDPS List. </p>
                </div>
            </div>
        </main>
    `,
	data: () => ({
		list: [],
		editors: [],
		loading: true,
		selected: 0,
		errors: [],
		roleIconMap,
		store,
		toggledShowcase: false,
	}),
	computed: {
		level() {
			return this.list[this.selected][0];
		},
		video() {
			if (!this.level.showcase) {
				return embed(this.level.verification);
			}

			return embed(
				this.toggledShowcase ? this.level.showcase : this.level.verification,
			);
		},
	},
	async mounted() {
		// Hide loading spinner
		this.list = await fetchList();
		this.editors = await fetchEditors();

		// Error handling
		if (!this.list) {
			this.errors = [
				'Failed to load list. Retry in a few minutes or notify list staff.',
			];
		} else {
			this.errors.push(
				...this.list
					.filter(([_, err]) => err)
					.map(([_, err]) => {
						return `Failed to load level. (${err}.json)`;
					}),
			);
			if (!this.editors) {
				this.errors.push('Failed to load list editors.');
			}
		}

		this.loading = false;
	},
	methods: {
		embed,
		score,
	},
};
