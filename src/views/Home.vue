<template>
	<section class="pt-8 pa-md-12 pa-lg-12 ml-md-12 mr-md-12 ml-lg-12 mr-lg-12">
		<v-layout row wrap>
			<v-flex xs12 sm12 md6 lg6 class="pt-1">
				<v-img class="img-center" src="images/covid-19.svg" max-height="90%" max-width="400px"
				       alt="corona">
					<template v-slot:placeholder>
						<v-row class="fill-height ma-0" align="center" justify="center">
							<v-progress-circular indeterminate :size="70" :width="8" color="blue"/>
						</v-row>
					</template>
				</v-img>
			</v-flex>
			<v-flex xs12 sm12 md6 lg6 class="pt-12">
				<v-toolbar color="transparent" flat>
					<v-autocomplete v-model="select" :loading="loading" :items="cacheCountries"
					                :search-input.sync="search" cache-items class="mx-4"
					                @input="dataLoad" item-value="name" item-text="name"
					                flat hide-no-data hide-details solo-inverted clearable
					                label="Type country name!"/>
					<i :class="countryFlag"/>
				</v-toolbar>
			</v-flex>
		</v-layout>
		<v-card color="transparent" v-if="!!coronaCountries" flat>
			<v-layout row wrap v-if="!!coronaCountries" class="pt-5">
				<v-flex xs12 sm12 md6 lg6>
					<v-card flat class="ma-3" color="transparent">
						<v-card-text class="mt-5">
							<h2 class="font-weight-bold text-uppercase">{{coronaCountries.country ? coronaCountries.country : 'GLOBAL'}}</h2>
							<h4>{{coronaCountries.country ? '( '+coronaCountries.continent+' )' : ''}}</h4>
							<div class="grey--text mt-5">Last Update: {{timeConverter(coronaCountries.updated)}}</div>
						</v-card-text>
					</v-card>
				</v-flex>
				<v-flex xs12 sm12 md6 lg6>
					<v-img v-if="!!coronaCountries.countryInfo" class="img-right" :src="coronaCountries.countryInfo.flag" alt="flag">
						<template v-slot:placeholder>
							<v-row class="fill-height ma-0" align="center" justify="center">
								<v-progress-circular indeterminate :size="70" :width="8" color="blue"/>
							</v-row>
						</template>
					</v-img>
					<v-img v-else width="350px" height="150px" class="img-right" src="images/globe.svg" alt="flag">
						<template v-slot:placeholder>
							<v-row class="fill-height ma-0" align="center" justify="center">
								<v-progress-circular indeterminate :size="70" :width="8" color="blue"/>
							</v-row>
						</template>
					</v-img>
				</v-flex>
			</v-layout>
			<v-layout row wrap class="mb-5 mt-5" justify-center>
				<v-flex xs12 sm12 md6 lg6>
					<HighCharts :options="chartTodayOptions"/>
				</v-flex>
				<v-flex xs12 sm12 md6 lg6>
					<HighCharts :options="chartTotalOptions"/>
				</v-flex>
			</v-layout>
			<v-tabs v-model="tab" color="green" grow background-color="transparent">
				<v-tab v-for="item in tabItems" :key="item">
					{{ item }}
				</v-tab>
			</v-tabs>
			<v-tabs-items v-model="tab">
				<v-tab-item v-for="item in tabItems" :key="item" color="transparent">
					<v-card flat style="background-color: lightcyan">
						<v-layout row wrap justify-center>
							<v-flex md6 lg8 sm12 xs12 class="pa-5" v-if="item === 'Cases'">
								<mini-statistic title="Total" :icon="coronaCountries.cases" color="light-green accent-2" class="mb-5"/>
								<mini-statistic title="Today" :icon="coronaCountries.todayCases" color="light-green accent-3" class="mb-5"/>
								<mini-statistic title="Rate / Million" :icon="coronaCountries.casesPerOneMillion" color="light-green accent-4"
								                :sub-title="'Rate (People) - '+coronaCountries.oneCasePerPeople"/>
							</v-flex>
							<v-flex md6 lg8 sm12 xs12 class="pa-5" v-if="item === 'Deaths'">
								<mini-statistic title="Total" :icon="coronaCountries.deaths" color="orange accent-1" class="mb-5"/>
								<mini-statistic title="Today" :icon="coronaCountries.todayDeaths" color="orange accent-2" class="mb-5"/>
								<mini-statistic title="Rate / Million" :icon="coronaCountries.deathsPerOneMillion" color="orange accent-3"
								                :sub-title="'Rate (People) - '+coronaCountries.oneDeathPerPeople"/>
							</v-flex>
							<v-flex md6 lg8 sm12 xs12 class="pa-5" v-if="item === 'Patients'">
								<mini-statistic title="Critical" :icon="coronaCountries.critical" color="lime lighten-2" class="mb-5"
								                :sub-title="'Rate (Million) - '+coronaCountries.criticalPerOneMillion"/>
								<mini-statistic title="Active" :icon="coronaCountries.active" color="lime lighten-1" class="mb-5"
								                :sub-title="'Rate (Million) - '+coronaCountries.activePerOneMillion"/>
								<mini-statistic title="Recovered" :icon="coronaCountries.recovered" color="lime accent-3"
								                :sub-title="'Today - '+coronaCountries.todayRecovered+' || Rate (Million) - '+coronaCountries.recoveredPerOneMillion"/>
							</v-flex>
							<v-flex md6 lg8 sm12 xs12 class="pa-5" v-if="item === 'Tests'">
								<mini-statistic title="Population" :icon="coronaCountries.population" color="cyan lighten-2" class="mb-5"/>
								<mini-statistic title="Total" :icon="coronaCountries.tests" color="cyan lighten-1" class="mb-5"/>
								<mini-statistic title="Rate (Million)" :icon="coronaCountries.testsPerOneMillion" color="cyan darken-1"
								                :sub-title="'Rate (People) - '+coronaCountries.oneTestPerPeople"/>
							</v-flex>
						</v-layout>
					</v-card>
				</v-tab-item>
			</v-tabs-items>
		</v-card>
	</section>
</template>

<script lang="ts">
	import {Component, Prop, Vue, Watch} from "vue-property-decorator";
	import MiniStatistic from "@/components/MiniStatistic.vue";
	import {Options} from "highcharts";
	import {Chart} from "highcharts-vue";
	import Axios from "axios";
	import Moment from "moment";

	@Component({
		components: {MiniStatistic, HighCharts: Chart}
	})
	export default class Home extends Vue {
		@Prop({required: true})
		countries: any;

		cacheCountries: any = [];
		loading: boolean = false;

		search: string = null;
		select: string = null;

		countryFlag: string = '';

		tab: any = null
		tabItems: any = ['Cases', 'Deaths', 'Patients', 'Tests']

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

		timeConverter(time: number) {
			const fullDate = new Date(time);
			return Moment(fullDate).format("hh:mm:ss A - ddd MMMDD,YY")
		}

		coronaCountries: any[] = [];

		chartTodayOptions: Options = {}
		chartTotalOptions: Options = {}

		created() {
			this.dataLoad()
		}

		dataLoad() {
			this.getFromApi().then(() => {
				let val: any = {}
				val = this.coronaCountries

				let todaySeries = [{
					name: 'Cases',
					data: [val.todayCases]
				}, {
					name: 'Critical',
					data: [val.critical]
				}, {
					name: 'Recovered',
					data: [val.todayRecovered]
				}, {
					name: 'Deaths',
					data: [val.todayDeaths]
				}]

				let totalSeries = [{
					name: 'Cases',
					data: [val.cases]
				}, {
					name: 'Active',
					data: [val.active]
				}, {
					name: 'Recovered',
					data: [val.recovered]
				}, {
					name: 'Deaths',
					data: [val.deaths]
				}]

				this.chartTodayOptions = {
					colors: ['#DDDF00', '#ff001e', '#50B432', '#ED561B'],
					chart: {
						zoomType: 'x',
						type: 'column',
						backgroundColor: 'transparent'
					},
					title: {
						text: null
					},
					xAxis: {
						categories: ['Today']
					},
					yAxis: {
						title: {
							text: 'In Number'
						}
					},
					legend: {
						verticalAlign: 'top',
						enabled: true
					},
					plotOptions: {
						area: {
							marker: {
								radius: 2
							},
							lineWidth: 1,
							states: {
								hover: {
									lineWidth: 1
								}
							},
							threshold: null
						}
					},
					//@ts-ignore
					series: todaySeries
				}

				this.chartTotalOptions = {
					colors: ['#fae607', '#a36868', '#6407fa', '#fa0707'],
					chart: {
						zoomType: 'x',
						type: 'column',
						backgroundColor: 'transparent'
					},
					title: {
						text: null
					},
					xAxis: {
						categories: ['Total']
					},
					yAxis: {
						title: {
							text: 'In Number'
						}
					},
					legend: {
						verticalAlign: 'top',
						enabled: true
					},
					plotOptions: {
						area: {
							marker: {
								radius: 2
							},
							lineWidth: 1,
							states: {
								hover: {
									lineWidth: 1
								}
							},
							threshold: null
						}
					},
					//@ts-ignore
					series: totalSeries
				}
			})
		}

		getFromApi() {
			this.coronaCountries = [];
			if (!this.select) {
				return Axios.get("https://corona.lmao.ninja/v2/all")
					  .then(({data}) => {
						  this.coronaCountries = data
					  }).finally(() => {
						  this.countryFlag = 'fa fa-globe text--secondary';
					  })
			} else {
				return Axios.get("https://corona.lmao.ninja/v2/countries/" + this.select)
					  .then(({data}) => {
						  this.coronaCountries = JSON.parse(JSON.stringify(data))
					  })
					  .catch(error => {
						  this.$notify({
							  type: 'error',
							  title: "Country's info not found!!"
						  });
					  }).finally(() => {
						  let ifAvailable = this.countries.find((e: any) => e.name === this.select);
						  if (ifAvailable)
							  this.countryFlag = 'flag-icon flag-icon-' + ifAvailable.code.toLowerCase();
					  })
			}
		}
	}
</script>
<style scoped lang="scss">
	.img-center {
		margin: 0 auto;
		display: block;
	}

	.img-right {
		float: right;
		clear: right;
	}


</style>