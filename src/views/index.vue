<template>
	<div class="library">
		<el-row>
			<el-col :span="5">
				<div class="left">
					<div class="left_item" 
						v-waves="'pink'"
						v-for="(item, index) in leftList" 
						:key="index + '_index1'"
						@click="handleCard(item.type)"
						:class="lableClass(item.type)">
						<div class="left_label">{{ item.title }}</div>
						<div class="left_point"></div>
					</div>
				</div>
			</el-col>
			<el-col :span="12" class="center_content">
				<div class="main" v-if="titleData.length">
					<div class="item_content" 
						v-for="(item, index) in titleData" 
						@click="goLidDetail(item.id)"
						:key="index +'_index2'">
						<div class="item_title text_overflow dotted_title">{{ item.title }}</div>
						<div class="item_sub_text text_overflow">{{ item.subtext }}</div>
						<div class="item_time flex">
							<el-icon><Timer /></el-icon>
							<div class="date">{{ formattedDate(item.createdAt) }}</div>
						</div>
						<div class="item_label" :class="lableClass(item.type)">{{ getLabel(item.type) }}</div>
					</div>
				</div>
				<div v-else>
					<el-empty :description="description" />
				</div>
				<Pagination 
					v-if="page.total"
					@onSizeChange="onSizeChange"
					@onCurrentChange="onCurrentChange"
					:page="page">
				</Pagination>
			</el-col>
			<el-col :span="7">
				<RightInfo></RightInfo>
			</el-col>
		</el-row>
	</div>
</template>

<script setup>
import { ref, onMounted, reactive, computed, watch } from 'vue';
import Pagination from '../components/Pagination.vue';
import RightInfo from '../components/RightInfo.vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from "@/store/user";
import { articlesApi, typeArticleApi } from "@/api/index";
import formattedDate from "@/utils/date"; 
const router = useRouter();
const route = useRoute()
const User = useUserStore();
const leftList = ref([
	{ title: '全部', type: 0 },
	{ title: 'js', type: 1 },
	{ title: 'css', type: 2 },
	{ title: 'java', type: 3 },
	{ title: 'node', type: 4 },
	{ title: 'Vue', type: 5 },
	{ title: 'Linux', type: 6 },
]);
const titleData = ref([]);
const color = ref('');
const colorValue = ref(false);
const description = ref('抱歉，没有数据哦');
const page = reactive({
	pageno: 1,
	count: 10,
	total: 0,
})

onMounted(() =>{
	getList();
})

const getList = async () =>{
	let pageCopy = Object.assign({}, page);
	let params = {
		pageno: pageCopy.pageno,
		count: pageCopy.count,
	}
	const res = await articlesApi(params);
	const data = res?.data;
	if(res.status == 200 ) {
		titleData.value = data?.data || [];
		page.total = data?.total;
	}
}

const handleIcon = () =>{
	colorValue.value = !colorValue.value;
	return color.value = colorValue.value ? 'blue' : '';
}

const getLabel = (type) =>{
	switch (type) {
		case 1:
			return 'js';

		case 2:
			return 'css';

		case 3:
			return 'java';

		case 4:
			return 'node';

		case 5:
			return 'Vue';

		case 6:
			return 'Linux';
		default:
			break;
	}
}
const lableClass = (type) =>{
	switch (type) {
		case 0:
			return 'color0';

		case 1:
			return 'color1';

		case 2:
			return 'color2';

		case 3:
			return 'color3';

		case 4:
			return 'color4';

		case 5:
			return 'color5';

		case 6:
			return 'color6';
		default:
			break;
	}
}

const handleCard = async ( type) => {
	if(type == 0) {
		getList();
	} else {
		const res = await typeArticleApi(type);
		const data = res?.data;
		if(res.status == 200) {
			titleData.value = data.data;
			page.total = data.total;
		}
	}
}

const goLidDetail = (id) =>{
	router.push({ path: 'index-detail', query: {id: id}});
}

const onSizeChange = (val) => {
	page.count = val;
}
const onCurrentChange = (val) => {
	page.pageno = val;
}

</script>
<style lang="scss" scoped>
.library{
    width: 100%;
	height: 94vh;
	overflow: auto;
}
.color0{
	background: #ca97feb3;
}
.color1{
	background: #0170e6b3;
}
.color2{
	background: #ab6173b3;
}
.color3{
	background: #fdd303b3;
}
.color4{
	background: #be0936b3;
}
.color5{
	background: #026e00b3;
}
.color6{
	background: #82d7f7b3;
}
.left{
	margin-top: 2rem;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-direction: column;
	text-align: center;
	font-size: 0.8rem;
    animation: translateV 1.5s ease-in-out forwards;
	.left_item{
		width: 5rem;
		height: 1.625rem;
		line-height: 1.625rem;
		margin-bottom: 1rem;
		transition: all 0.5s;
		clip-path: polygon(0% 0%, 82% 0, 100% 50%, 82% 100%, 0% 100%);
		position: relative;
		border-radius: 0.25rem;
		&:hover{
			transform: translateX(1.5rem);
			cursor: pointer;
			color: #fff;
		}
		.left_label{
			width: 82%;
		}
		.left_point{
			position: absolute;
			right: 18%;
			top: 50%;
			width: 0.375rem;
			height: 0.375rem;
			background-color: #fff;
			border-radius: 50%;
			transform: translate(-50%, -50%);
		}
    }
}
@keyframes translateV {
    0%{
        transform: translate(-100%, 0);
    }
    100%{
        transform: translate(0, 0);
    }
}
.center_content{
	border: 1px solid rgba(221, 221, 221, 0.8666666667);
	margin: 1.5rem 0;
	border-radius: 8px;
	background: #30797e33;
}
.main{
	overflow: auto;
	max-height: calc(94vh - 7rem - 2px);
}
.item_content{
	background-color: #fff;
	margin: 1.5rem;
	border-radius: 8px;
	padding: 1.2rem;
	opacity: 0.8;
	position: relative;
	overflow: hidden;
	transition: all 0.3s;
	.item_title{
		width: fit-content;
		font-weight: bolder;
	}
	.item_sub_text{
		margin-top: 1vh;
		font-size: 14.5px;
		color: #8a919f;
		width: 100%;
	}
	.item_time{
		margin-top: 1vh;
		color: #333;
		& > div {
			margin-right: 0.5rem;
			font-size: 12px;
		}
		& > .el-icon {
			margin-right: 0.2rem;
		}
	}
	.item_label{
		position: absolute;
		width: 80px;
		height: 20px;
		position: absolute;
		top: 8px;
		right: -20px;
		text-align: center;
		transform: rotate(45deg);
		font-size: 14px;
		color: rgba(51, 51, 51);
	}
	&:hover{
		transform: scale(1.02);
		box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
		.dotted_title::after{
			width: 100%;
		}
	}
}

</style>