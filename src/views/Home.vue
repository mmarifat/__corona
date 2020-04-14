<template>
	<v-container fluid>
		<v-container>
			<v-row>
				<v-col cols="8">
					<v-img class="img-center" src="images/covid-19.svg" max-height="80%" max-width="400px"
							 lazy-src="images/loading.gif"
							 alt="corona"/>
				</v-col>
				<v-col cols="4" class="mt-10">
					<v-toolbar color="transparent" class="mt-2" flat>
						<v-autocomplete v-model="select" :loading="loading" :items="cacheCountries"
											 :search-input.sync="search" cache-items class="mx-4"
											 @input="dataLoad" item-value="name" item-text="name"
											 flat hide-no-data hide-details solo-inverted clearable
											 label="Type country name!"/>
						<i :class="countryFlag"/>
					</v-toolbar>
				</v-col>
			</v-row>
		</v-container>
		<v-row v-if="!!coronaCountries">
			<v-spacer/>
			<v-col md="6">
				<v-card flat color="transparent">
					<v-card-text>
						<br/>
						<br/>
						<h1 style="font-size: 40px" class="text-uppercase">{{coronaCountries.country ?
							coronaCountries.country: 'GLOBAL'}}</h1>
						<br/>
						<h3>Last Update: <br/>{{timeConverter(coronaCountries.updated)}}</h3><br/>
					</v-card-text>
				</v-card>
			</v-col>
			<v-col md="4">
				<v-img v-if="!!coronaCountries.countryInfo" class="img-right" :src="coronaCountries.countryInfo.flag"
						 lazy-src="images/loading.gif" alt="flag"/>
				<v-img v-else width="350px" class="img-right" src="images/globe.svg" lazy-src="images/loading.gif"
						 alt="flag"/>
			</v-col>
			<v-spacer/>
		</v-row>
		<v-row class="mt-5">
			<v-col md="3">
				<v-card shaped hover color="orange lighten-3">
					<v-card-title>
						CASES
					</v-card-title>
					<v-card-text class="mx-10">
						<h1>{{coronaCountries.cases}}</h1>
					</v-card-text>
					<v-divider/>
					<v-card-title>
						TODAY'S CASES
					</v-card-title>
					<v-card-text class="mx-10">
						<h1>{{coronaCountries.todayCases}}</h1>
					</v-card-text>
					<v-divider/>
					<v-card-title>
						RATE (/million)
					</v-card-title>
					<v-card-text class="mx-10">
						<h1>{{coronaCountries.casesPerOneMillion}}</h1>
					</v-card-text>
				</v-card>
			</v-col>
			<v-col md="3">
				<v-card shaped hover color="red lighten-1">
					<v-card-title>
						DEATHS
					</v-card-title>
					<v-card-text class="mx-10">
						<h1>{{coronaCountries.deaths}}</h1>
					</v-card-text>
					<v-divider/>
					<v-card-title>
						TODAY'S DEATHS
					</v-card-title>
					<v-card-text class="mx-10">
						<h1>{{coronaCountries.todayDeaths}}</h1>
					</v-card-text>
					<v-divider/>
					<v-card-title>
						RATE (/million)
					</v-card-title>
					<v-card-text class="mx-10">
						<h1>{{coronaCountries.deathsPerOneMillion}}</h1>
					</v-card-text>
				</v-card>
			</v-col>
			<v-col md="3">
				<v-card shaped hover color="yellow lighten-1">
					<v-card-title>
						CRITICAL
					</v-card-title>
					<v-card-text class="mx-10">
						<h1>{{coronaCountries.critical}}</h1>
					</v-card-text>
					<v-divider/>
					<v-card-title>
						ACTIVE
					</v-card-title>
					<v-card-text class="mx-10">
						<h1>{{coronaCountries.active}}</h1>
					</v-card-text>
					<v-divider/>
					<v-card-title>
						RECOVERED
					</v-card-title>
					<v-card-text class="mx-10">
						<h1>{{coronaCountries.recovered}}</h1>
					</v-card-text>
				</v-card>
			</v-col>
			<v-col md="3">
				<v-card shaped hover color="green lighten-2">
					<v-card-title>
						TESTS
					</v-card-title>
					<v-card-text class="mx-10">
						<h1>{{coronaCountries.tests}}</h1>
					</v-card-text>
					<v-divider/>
					<v-card-title>
						TEST RATE ( /million)
					</v-card-title>
					<v-card-text class="mx-10">
						<h1>{{coronaCountries.testsPerOneMillion}}</h1>
					</v-card-text>
					<v-divider/>
					<v-card-text class="text-center">
						<br/><br/><br/>
					</v-card-text>
				</v-card>
			</v-col>
		</v-row>
		<chart-info/>
	</v-container>
</template>

<script lang="ts">
	import {Component, Prop, Vue, Watch} from "vue-property-decorator";
	import ChartInfo from "@/components/ChartInfo.vue";
	import Axios from "axios";
	import Moment from "moment";

	@Component({
		components: {ChartInfo}
	})
	export default class Home extends Vue {
		// countries start
		@Prop({required: true})
		countries: any;

		cacheCountries: any = [];
		loading: boolean = false;

		search: string = null;
		select: string = null;

		countryFlag: string = '';

		changeCountry() {
			let available = this.countries.find((e: any) => e.name === this.select);
			if (available)
				this.countryFlag = 'flag-icon flag flag-icon-' + available.code.toLowerCase();
			else
				this.countryFlag = 'fa fa-globe text--secondary';
		}

		@Watch('search')
		selectCountry(country: string) {
			country && country !== this.select && this.countrySelections(country)
		}

		countrySelections(v: any) {
			this.loading = true;
			setTimeout(() => {
				this.cacheCountries = this.countries.filter((e: any) => {
					return (e.name || '').toLowerCase().indexOf((v || '').toLowerCase()) > -1
				})
				this.loading = false
			}, 500)
		}

		// countries end

		timeConverter(time: number) {
			const fullDate = new Date(time);
			return Moment(fullDate).format("hh:mm:ss A - ddd MMMDD,YY")
		}

		// data load
		coronaCountries: any[] = [];

		mounted() {
			this.dataLoad()
		}

		dataLoad() {
			this.coronaCountries = [];
			if (!this.select) {
				Axios.get("https://corona.lmao.ninja/all")
					.then(({data}) => {
						this.coronaCountries = data
					});
				this.countryFlag = 'fa fa-globe text--secondary';
			} else {
				Axios.get("https://corona.lmao.ninja/countries/" + this.select)
					.then(({data}) => {
						this.coronaCountries = data
					})
					.catch(error => {
						this.$notify({
							type: 'error',
							title: "Country's info not found!!"
						});
					});
				let ifAvailable = this.countries.find((e: any) => e.name === this.select);
				if (ifAvailable)
					this.countryFlag = 'flag-icon flag-icon-' + ifAvailable.code.toLowerCase();
			}
		}
	}
</script>
<style scoped lang="scss">
	h1 {
		font-family: "Consolas", serif;
		font-weight: bolder;
		font-size: 35px;
	}

	.img-center {
		margin: 0 auto;
		display: block;
	}

	.img-right {
		float: right;
		clear: right;
	}

</style>