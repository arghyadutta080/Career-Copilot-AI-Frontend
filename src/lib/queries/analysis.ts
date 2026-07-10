import { gql } from "graphql-request";

// ─── Queries ────────────────────────────────────────────────────────────────
// Full analysis fetch — only used when viewing a single analysis detail page.
// Fetches all fields needed across all tabs.

export const GET_ANALYSIS_OVERVIEW = gql`
  query GetAnalysisOverview($id: ID!) {
    getAnalysis(id: $id) {
      id
      userId
      resumeId
      jobDescriptionId
      status
      createdAt
      updatedAt

      toolStatus {
        ats
        skillGap
        optimizer
        coverLetter
        interview
        roadmap
      }

      results {
        ats {
          score
          strengths
          weaknesses
        }
        roadmap {
          overview
        }
      }
    }
  }
`;

export const GET_ANALYSIS_ATS = gql`
  query GetAnalysisATS($id: ID!) {
    getAnalysis(id: $id) {
      id
      results {
        ats {
          score
          strengths
          weaknesses
          missingKeywords
          summary
        }
      }
    }
  }
`;

export const GET_ANALYSIS_SKILL_GAP = gql`
  query GetAnalysisSkillGap($id: ID!) {
    getAnalysis(id: $id) {
      id
      results {
        skillGap {
          missingSkills
          recommendedSkills
          learningPriority {
            skill
            reason
          }
          summary
        }
      }
    }
  }
`;

export const GET_ANALYSIS_RESUME_OPTIMIZER = gql`
  query GetAnalysisResumeOptimizer($id: ID!) {
    getAnalysis(id: $id) {
      id
      results {
        optimizer {
          overallSummary
          atsImpact {
            currentScore
            expectedScore
            reason
          }
          keywordSuggestions
          experienceSuggestions {
            company
            role
            suggestions
          }
          projectSuggestions {
            project
            suggestions
          }
          sectionSuggestions {
            section
            suggestion
          }
          optimizedContent
        }
      }
    }
  }
`;

export const GET_ANALYSIS_COVER_LETTER = gql`
  query GetAnalysisCoverLetter($id: ID!) {
    getAnalysis(id: $id) {
      id
      results {
        coverLetter {
          subject
          content
        }
      }
    }
  }
`;

export const GET_ANALYSIS_INTERVIEW_PREP = gql`
  query GetAnalysisInterviewPrep($id: ID!) {
    getAnalysis(id: $id) {
      id
      results {
        interview {
          hr {
            id
            question
            difficulty
            topics
            answer
          }
          resumeBased {
            id
            question
            topics
            answer
          }
          experienceBased {
            id
            question
            topics
            answer
          }
          projectBased {
            id
            question
            topics
            answer
          }
          technical {
            id
            question
            difficulty
            topics
            answer
          }
          coding {
            id
            question
            difficulty
            topics
            answer
          }
          behavioral {
            id
            question
            topics
            answer
          }
          followUps {
            parentQuestion
            followUps {
              id
              question
              difficulty
              topics
              answer
            }
          }
        }
      }
    }
  }
`;

export const GET_ANALYSIS_LEARNING_ROADMAP = gql`
  query GetAnalysisLearningRoadmap($id: ID!) {
    getAnalysis(id: $id) {
      id
      results {
        roadmap {
          overview
          milestones {
            title
            description
            steps {
              order
              title
              description
              priority
              estimatedHours
              resources {
                id
                title
                query
                reason
                urls
              }
              outcomes
            }
          }
          interviewChecklist
        }
      }
    }
  }
`;

// Lightweight analysis fetch — used for polling status during pipeline execution.
export const GET_ANALYSIS_STATUS = gql`
  query GetAnalysisStatus($id: ID!) {
    getAnalysis(id: $id) {
      id
      status
      toolStatus {
        ats
        skillGap
        optimizer
        coverLetter
        interview
        roadmap
      }
    }
  }
`;

// ─── Mutations ──────────────────────────────────────────────────────────────

export const CREATE_ANALYSIS = gql`
  mutation CreateAnalysis($resumeId: ID!, $jobDescriptionId: ID!) {
    createAnalysis(resumeId: $resumeId, jobDescriptionId: $jobDescriptionId) {
      id
      status
    }
  }
`;

export const START_ANALYSIS = gql`
  mutation StartAnalysis($analysisId: ID!) {
    startAnalysis(analysisId: $analysisId)
  }
`;

export const GENERATE_INTERVIEW_QUESTIONS = gql`
  mutation GenerateInterviewQuestions($analysisId: ID!) {
    generateInterviewQuestions(analysisId: $analysisId)
  }
`;

export const GENERATE_LEARNING_ROADMAP = gql`
  mutation GenerateLearningRoadmap($analysisId: ID!) {
    generateLearningRoadmap(analysisId: $analysisId)
  }
`;
