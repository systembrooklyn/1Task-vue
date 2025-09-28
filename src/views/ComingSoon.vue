<template>
    <div class="container-fluid py-4">
        <div class="row justify-content-center">
            <div class="col-lg-8 col-md-10">
                <div class="card shadow-lg border-0">
                    <div class="card-body text-center py-5">
                        <div class="mb-4">
                            <i class="fas fa-rocket fa-4x text-primary mb-3"></i>
                        </div>
                        <h1 class="display-4 font-weight-bold text-dark mb-3">
                            {{ title }}
                        </h1>
                        <p class="lead text-muted mb-4" v-if="description">
                            {{ description }}
                        </p>
                        <p class="text-secondary mb-4" v-else>
                            {{ isRTL ? 'هذه الميزة قيد التطوير وستكون متاحة قريباً' : 'This feature is under development and will be available soon.' }}
                        </p>
                        <div class="row justify-content-center">
                            <div class="col-md-6">
                                <div class="bg-gradient-primary p-3 rounded-3 text-white">
                                    <i class="fas fa-clock me-2"></i>
                                    <span class="font-weight-bold">
                                        {{ isRTL ? 'قريباً جداً!' : 'Coming Very Soon!' }}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div class="mt-4">
                            <router-link :to="{
                                name: isOwner ? 'Dashboard' : 'routine task',
                                params: { companyName: companyNameNormalized }
                            }" class="btn bg-gradient-secondary me-2">
                                <i class="fas fa-arrow-left me-1"></i>
                                {{ isRTL ? (isOwner ? 'العودة للوحة القيادة' : 'العودة للمهام اليومية') : (isOwner ?
                                    'Back to Dashboard' : 'Back to Routine Tasks') }}
                            </router-link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';

// Props
defineProps({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    }
});

// Store
const store = useStore();
const isRTL = computed(() => store.state.isRTL);
const isOwner = computed(() => store.getters.isOwner);
const currentCompanyName = computed(() => store.getters.companyName || 'DefaultCompany');
const companyNameNormalized = currentCompanyName.value.replace(/\s+/g, '-');
</script>

<style scoped>
.card {
    border-radius: 15px;
    min-height: 400px;
}

.display-4 {
    font-size: 2.5rem;
}

.bg-gradient-primary {
    background: linear-gradient(45deg, #5e72e4, #825ee4);
}

.bg-gradient-secondary {
    background: linear-gradient(45deg, #8392ab, #96a2b2);
}

.fa-rocket {
    animation: bounce 2s infinite;
}

@keyframes bounce {

    0%,
    20%,
    50%,
    80%,
    100% {
        transform: translateY(0);
    }

    40% {
        transform: translateY(-10px);
    }

    60% {
        transform: translateY(-5px);
    }
}
</style>
