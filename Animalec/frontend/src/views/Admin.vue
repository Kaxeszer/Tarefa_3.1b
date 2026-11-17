<template>
  <section class="page-section">
    <b-container fluid>
      <HeaderPage title="Gestão do Animalec"/>

      <b-row>

        <b-col cols="12" md="8" lg="6" xl="4" class="mx-auto admin-options">
          <b-card-group deck>
            <AdminOptionBox routeName="listUsers" iconName="users" title="Utilizadores"/>
            <AdminOptionBox routeName="listAnimals" iconName="dog"  title="Animais"/>
          </b-card-group>
          <b-card-group deck class="mt-3">
            <AdminOptionBox routeName="listQuizzes" iconName="file-alt"  title="Quizzes"/>
            <AdminOptionBox routeName="listQuestions" iconName="question-circle"  title="Questões"/>
          </b-card-group>
          <b-card-group deck class="mt-3">
            <b-card bg-variant="secondary" text-variant="white" header="PATROCINADORES" class="text-center">
              <a href="/prototipos_LP/sponsors.html" aria-label="Gerir Patrocinadores"><i class="fas fa-heart fa-5x" aria-hidden="true"></i></a>
            </b-card>
            <b-card bg-variant="secondary" text-variant="white" header="ESPECIALISTAS" class="text-center">
              <a href="/prototipos_LP/experts.html" aria-label="Gerir Especialistas"><i class="fas fa-star fa-5x" aria-hidden="true"></i></a>
            </b-card>
          </b-card-group>
        </b-col>

      </b-row>
    </b-container>
  </section>
</template>
<script>
import HeaderPage from "@/components/HeaderPage.vue";
import AdminOptionBox from "@/components/AdminOptionBox.vue";

export default {
  components: {
    HeaderPage,
    AdminOptionBox
  }
};
</script>
<style scoped>
@media (max-width: 767px) {
  .admin-options {
    max-width: 380px;
  }
  .admin-options .card-deck {
    flex-direction: column;
  }
  .admin-options .card {
    margin-bottom: 12px;
  }
}
</style>
